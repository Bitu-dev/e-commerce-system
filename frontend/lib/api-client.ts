'use client'

import { CustomerNotification, Order, OrderItem, OrderStatus, Product, Role, SystemEventLog, UserProfile } from './types'
import {
  getStoredEvents,
  isUserSessionExpired,
  saveStoredEvents,
  saveStoredUser,
} from './store'

const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8081'
const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8082'
const NOTIFICATION_SERVICE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:8083'
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'

function parseJwtToken(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const ApiClient = {
  // ----------------------------------------------------
  // Keycloak OAuth2 Authentication & Session Management
  // ----------------------------------------------------
  async login(username: string, password: string): Promise<UserProfile> {
    const params = new URLSearchParams()
    params.append('client_id', 'mini-commerce-web')
    params.append('grant_type', 'password')
    params.append('username', username)
    params.append('password', password)

    let res: Response
    try {
      res = await fetch(`${KEYCLOAK_URL}/realms/mini-commerce/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
    } catch (e: any) {
      throw new Error(`Cannot connect to Keycloak at ${KEYCLOAK_URL}. Ensure Docker container is running. (${e.message})`)
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error_description || 'Invalid credentials. Keycloak rejected this username or password.')
    }

    const data = await res.json()
    const token = data.access_token
    const claims = parseJwtToken(token)

    // Dynamically detect roles directly from Keycloak JWT claims
    const realmRoles: string[] = claims?.roles || claims?.realm_access?.roles || []
    const isAdmin = realmRoles.includes('ADMIN')
    const role: Role = isAdmin ? 'ADMIN' : 'USER'
    const expiresIn = Number(data.expires_in) || 1800
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn

    const defaultName = role === 'ADMIN' ? 'Bitaniya Admin (Store Admin)' : 'Bitaniya User (Customer)'

    const profile: UserProfile = {
      id: claims?.sub || ('usr-' + Math.random().toString(36).substring(2, 9)),
      username: claims?.preferred_username || username,
      name: claims?.name || defaultName,
      email: claims?.email || `${username}@minicommerce.local`,
      role,
      roles: realmRoles,
      token,
      refreshToken: data.refresh_token,
      expiresAt,
    }

    saveStoredUser(profile)
    return profile
  },

  async register(params: {
    username: string
    password: string
    email?: string
    fullName?: string
    firstName?: string
    lastName?: string
  }): Promise<UserProfile> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account. Please try again.')
    }

    // Automatically authenticate with Keycloak upon successful registration
    return this.login(params.username.trim().toLowerCase(), params.password)
  },

  async refreshToken(user: UserProfile): Promise<UserProfile> {
    if (!user.refreshToken) {
      saveStoredUser(null)
      throw new Error('401 Session expired: No refresh token available. Please sign in again.')
    }

    const params = new URLSearchParams()
    params.append('client_id', 'mini-commerce-web')
    params.append('grant_type', 'refresh_token')
    params.append('refresh_token', user.refreshToken)

    let res: Response
    try {
      res = await fetch(`${KEYCLOAK_URL}/realms/mini-commerce/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
    } catch (e: any) {
      saveStoredUser(null)
      throw new Error('Keycloak unreachable during token refresh. Session timed out.')
    }

    if (!res.ok) {
      saveStoredUser(null)
      throw new Error('401 Session expired: Refresh token has expired. Please sign in again.')
    }

    const data = await res.json()
    const token = data.access_token
    const claims = parseJwtToken(token)
    const realmRoles: string[] = claims?.roles || claims?.realm_access?.roles || []
    const isAdmin = realmRoles.includes('ADMIN')
    const role: Role = isAdmin ? 'ADMIN' : 'USER'
    const expiresIn = Number(data.expires_in) || 1800
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn

    const refreshed: UserProfile = {
      ...user,
      token,
      refreshToken: data.refresh_token || user.refreshToken,
      expiresAt,
      role,
      roles: realmRoles,
    }

    saveStoredUser(refreshed)
    return refreshed
  },

  async ensureValidToken(user: UserProfile): Promise<UserProfile> {
    if (!isUserSessionExpired(user)) {
      return user
    }

    // Token is expired! Silently refresh using refresh_token
    if (user.refreshToken) {
      return await this.refreshToken(user)
    }

    saveStoredUser(null)
    throw new Error('401 Session expired: Security token expired. Please sign in again.')
  },

  getSessionStatus(user: UserProfile | null): {
    isValid: boolean
    remainingSeconds: number
    formattedRemaining: string
  } {
    if (!user || !user.token) {
      return { isValid: false, remainingSeconds: 0, formattedRemaining: 'Expired' }
    }

    const now = Math.floor(Date.now() / 1000)
    let expiresAt: number = user.expiresAt ?? 0
    if (!expiresAt) {
      const claims = parseJwtToken(user.token)
      expiresAt = claims?.exp ?? 0
    }

    const remaining = expiresAt - now
    if (remaining <= 0) {
      return { isValid: false, remainingSeconds: 0, formattedRemaining: 'Expired' }
    }

    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60
    return {
      isValid: true,
      remainingSeconds: remaining,
      formattedRemaining: `${mins}m ${secs < 10 ? '0' : ''}${secs}s`,
    }
  },

  // ----------------------------------------------------
  // Product & Inventory Service Endpoints (Port 8081)
  // ----------------------------------------------------
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) {
      throw new Error(`Failed to load products from Product Service: HTTP ${res.status}`)
    }
    return await res.json()
  },

  async getProductById(id: string): Promise<Product | null> {
    const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${id}`)
    if (res.status === 404) return null
    if (!res.ok) {
      throw new Error(`Failed to fetch product ${id}: HTTP ${res.status}`)
    }
    return await res.json()
  },

  async createProduct(user: UserProfile, data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freshUser.token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      if (res.status === 403) throw new Error('403 Forbidden: Product creation is restricted to ADMIN.')
      if (res.status === 401) throw new Error('401 Unauthorized: Invalid or expired access token.')
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Failed to create product: HTTP ${res.status}`)
    }

    return await res.json()
  },

  async updateProduct(user: UserProfile, id: string, patch: Partial<Product>): Promise<Product> {
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freshUser.token}`,
      },
      body: JSON.stringify(patch),
    })

    if (!res.ok) {
      if (res.status === 403) throw new Error('403 Forbidden: Product editing is restricted to ADMIN.')
      if (res.status === 401) throw new Error('401 Unauthorized: Invalid or expired access token.')
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Failed to update product: HTTP ${res.status}`)
    }

    return await res.json()
  },

  async updateStock(user: UserProfile, id: string, newStock: number): Promise<Product> {
    if (newStock < 0) {
      throw new Error('400 Bad Request: Stock quantity cannot be negative.')
    }
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freshUser.token}`,
      },
      body: JSON.stringify({ stockQuantity: newStock }),
    })

    if (!res.ok) {
      if (res.status === 403) throw new Error('403 Forbidden: Stock adjustment is restricted to ADMIN.')
      if (res.status === 401) throw new Error('401 Unauthorized: Invalid or expired access token.')
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Failed to adjust stock: HTTP ${res.status}`)
    }

    return await res.json()
  },

  // ----------------------------------------------------
  // Order Service Endpoints (Port 8082) & RabbitMQ Events
  // ----------------------------------------------------
  async placeOrder(
    user: UserProfile,
    itemsToOrder: { product: Product; quantity: number }[]
  ): Promise<Order> {
    if (itemsToOrder.length === 0) {
      throw new Error('400 Bad Request: Order must contain at least one item.')
    }

    const freshUser = await this.ensureValidToken(user)
    const payload = {
      items: itemsToOrder.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        unitPrice: it.product.price,
        quantity: it.quantity,
      })),
    }

    const res = await fetch(`${ORDER_SERVICE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freshUser.token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      if (res.status === 403) throw new Error('403 Forbidden: Customer account required to place orders.')
      if (res.status === 401) throw new Error('401 Unauthorized: Session expired. Please sign in again.')
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Order creation failed: HTTP ${res.status}`)
    }

    return await res.json()
  },

  async getMyOrders(user: UserProfile): Promise<Order[]> {
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${ORDER_SERVICE_URL}/api/orders/my`, {
      headers: {
        Authorization: `Bearer ${freshUser.token}`,
      },
    })

    if (!res.ok) {
      if (res.status === 401) throw new Error('401 Unauthorized: Session expired. Please sign in again.')
      throw new Error(`Failed to fetch orders: HTTP ${res.status}`)
    }

    return await res.json()
  },

  async getAllOrders(user: UserProfile): Promise<Order[]> {
    if (user.role !== 'ADMIN') {
      throw new Error('403 Forbidden: Viewing all orders is strictly restricted to ADMIN.')
    }
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${ORDER_SERVICE_URL}/api/orders`, {
      headers: {
        Authorization: `Bearer ${freshUser.token}`,
      },
    })

    if (!res.ok) {
      if (res.status === 403) throw new Error('403 Forbidden: Admin privileges required.')
      if (res.status === 401) throw new Error('401 Unauthorized: Session expired. Please sign in again.')
      throw new Error(`Failed to load orders: HTTP ${res.status}`)
    }

    return await res.json()
  },

  async getOrderById(user: UserProfile, orderId: string): Promise<Order> {
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${freshUser.token}`,
      },
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error(`404: Order #${orderId} not found.`)
      if (res.status === 403) throw new Error('403 Forbidden: You do not have permission to view this order.')
      throw new Error(`Failed to fetch order: HTTP ${res.status}`)
    }

    return await res.json()
  },

  // ----------------------------------------------------
  // Notification Service Endpoints (Port 8083)
  // ----------------------------------------------------
  async getMyNotifications(user: UserProfile): Promise<CustomerNotification[]> {
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/my`, {
      headers: {
        Authorization: `Bearer ${freshUser.token}`,
      },
    })

    if (!res.ok) {
      if (res.status === 401) throw new Error('401 Unauthorized: Session expired.')
      return []
    }

    return await res.json()
  },

  async markNotificationAsRead(user: UserProfile, id: string): Promise<void> {
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${freshUser.token}`,
      },
    })

    if (!res.ok) {
      if (res.status === 403) throw new Error("403 Forbidden: Cannot modify another customer's notification.")
    }
  },

  async getAllNotifications(user: UserProfile): Promise<CustomerNotification[]> {
    if (user.role !== 'ADMIN') {
      throw new Error('403 Forbidden: Viewing all notifications requires ADMIN role.')
    }
    const freshUser = await this.ensureValidToken(user)
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${freshUser.token}`,
      },
    })

    if (!res.ok) {
      return []
    }

    return await res.json()
  },

  async getSystemEvents(): Promise<SystemEventLog[]> {
    return getStoredEvents()
  },

  async clearSystemLogs(): Promise<void> {
    saveStoredEvents([])
  },
}
