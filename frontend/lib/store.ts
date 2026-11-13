import { CartItem, CustomerNotification, Order, OrderItem, Product, Promotion, Role, SystemEventLog, UserProfile } from './types'

export const TEST_USERS: Record<string, UserProfile> = {
  'bitaniya.user': {
    id: 'f3e51fd0-dd18-4274-baa5-7f363041bf12',
    username: 'bitaniya.user',
    name: 'Bitaniya User (Customer)',
    email: 'bitaniya.user@minicommerce.local',
    role: 'USER',
    token: '',
  },
  'bitaniya.admin': {
    id: '4dfb4757-c2e3-48e5-af52-523e9b447fb0',
    username: 'bitaniya.admin',
    name: 'Bitaniya Admin (Store Admin)',
    email: 'bitaniya.admin@minicommerce.local',
    role: 'ADMIN',
    token: '',
  },
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-iphone-16-pro',
    name: 'iPhone 16 Pro Max',
    category: 'Smartphones',
    description: 'Grade 5 titanium design with custom sculpted edges, 48MP Fusion camera system, and the ultra-efficient A18 Pro chip.',
    price: 49999,
    stockQuantity: 14,
    active: true,
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=85',
    badge: 'Flagship',
    rating: 4.9,
    reviewsCount: 182,
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'prod-macbook-pro-m4',
    name: 'MacBook Pro 14” M4 Max',
    category: 'Laptops',
    description: 'Liquid Retina XDR display with up to 1600 nits peak brightness. Powered by M4 Max for extreme creative workflows.',
    price: 89999,
    stockQuantity: 6,
    active: true,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85',
    badge: 'Pro Performance',
    rating: 5.0,
    reviewsCount: 94,
    createdAt: '2026-09-12T09:30:00Z',
    updatedAt: '2026-10-02T15:20:00Z',
  },
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless ANC',
    category: 'Audio',
    description: 'Industry-leading noise cancellation with dual processors, 8 microphones, and ultra-comfortable soft-fit leather.',
    price: 15499,
    stockQuantity: 22,
    active: true,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
    badge: 'Best Seller',
    rating: 4.8,
    reviewsCount: 310,
    createdAt: '2026-08-20T11:15:00Z',
    updatedAt: '2026-09-25T10:00:00Z',
  },
  {
    id: 'prod-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    category: 'Smartphones',
    description: 'Next-gen Galaxy AI multimodal engine, integrated S Pen stylus, and an aerospace titanium enclosure.',
    price: 46999,
    stockQuantity: 11,
    active: true,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85',
    badge: 'Galaxy AI',
    rating: 4.7,
    reviewsCount: 142,
    createdAt: '2026-09-15T14:00:00Z',
    updatedAt: '2026-10-04T09:10:00Z',
  },
  {
    id: 'prod-ps5-pro',
    name: 'PlayStation 5 Pro Console',
    category: 'Gaming',
    description: 'PlayStation Spectral Super Resolution (PSSR), 2TB high-speed NVMe SSD, and 60+ FPS ray tracing performance.',
    price: 29999,
    stockQuantity: 3,
    active: true,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=85',
    badge: 'Low Stock',
    rating: 4.9,
    reviewsCount: 228,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-08T18:00:00Z',
  },
  {
    id: 'prod-apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2 Black Titanium',
    category: 'Wearables',
    description: 'Rugged 49mm satin black titanium case, 3000 nits display, precision dual-frequency GPS, and up to 72 hours battery life.',
    price: 26999,
    stockQuantity: 8,
    active: true,
    image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=1200&q=85',
    badge: 'Adventure',
    rating: 4.8,
    reviewsCount: 89,
    createdAt: '2026-09-05T08:45:00Z',
    updatedAt: '2026-09-28T14:30:00Z',
  },
  {
    id: 'prod-ipad-pro-m4',
    name: 'iPad Pro 13” Ultra Retina XDR',
    category: 'Tablets',
    description: 'Tandem OLED breakthrough display, razor-thin 5.1mm chassis, and desktop-class M4 performance.',
    price: 43999,
    stockQuantity: 5,
    active: true,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=85',
    badge: 'Tandem OLED',
    rating: 4.9,
    reviewsCount: 76,
    createdAt: '2026-09-18T16:20:00Z',
    updatedAt: '2026-10-05T11:40:00Z',
  },
  {
    id: 'prod-bose-qc-ultra',
    name: 'Bose QuietComfort Ultra Headphones',
    category: 'Audio',
    description: 'World-class spatial audio with Bose Immersive Audio technology and CustomTune sound personalization.',
    price: 14299,
    stockQuantity: 15,
    active: true,
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85',
    rating: 4.7,
    reviewsCount: 165,
    createdAt: '2026-08-25T13:10:00Z',
    updatedAt: '2026-09-30T09:15:00Z',
  },
]

export const CATEGORIES = [
  { name: 'All', count: 8 },
  { name: 'Smartphones', count: 2, icon: 'Smartphone' },
  { name: 'Laptops', count: 1, icon: 'Laptop' },
  { name: 'Audio', count: 2, icon: 'Headphones' },
  { name: 'Gaming', count: 1, icon: 'Gamepad2' },
  { name: 'Wearables', count: 1, icon: 'Watch' },
  { name: 'Tablets', count: 1, icon: 'Tablet' },
]

export function formatMoney(val: number): string {
  return `ETB ${val.toLocaleString('en-US')}`
}

const STORAGE_KEYS = {
  USER: 'aurora_auth_user',
  CART: 'aurora_cart_items',
  PRODUCTS: 'aurora_products_catalog',
  ORDERS: 'aurora_orders_list',
  NOTIFICATIONS: 'aurora_notifications_list',
  EVENTS: 'aurora_system_events',
  PROMOTIONS: 'aurora_promotions_list',
}


export function isUserSessionExpired(user: UserProfile | null): boolean {
  if (!user || !user.token) return true
  if (user.token.startsWith('jwt_mock_') || user.token.length < 20) return true
  if (user.expiresAt) {
    // Return true if expired or expiring within 10 seconds
    return Date.now() / 1000 >= user.expiresAt - 10
  }
  try {
    const base64Url = user.token.split('.')[1]
    if (!base64Url) return true
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    if (payload.exp) {
      return Date.now() / 1000 >= payload.exp - 10
    }
  } catch {
    return true
  }
  return false
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    if (!raw) return null
    const user = JSON.parse(raw) as UserProfile
    if (!user || !user.token || user.token.startsWith('jwt_mock_')) {
      localStorage.removeItem(STORAGE_KEYS.USER)
      return null
    }
    // Strict session timeout verification:
    if (isUserSessionExpired(user)) {
      // If we don't have a refresh token, session has completely timed out
      if (!user.refreshToken) {
        localStorage.removeItem(STORAGE_KEYS.USER)
        return null
      }
    }
    return user
  } catch {
    return null
  }
}

export function saveStoredUser(user: UserProfile | null) {
  if (typeof window === 'undefined') return
  if (user && user.token && !user.token.startsWith('jwt_mock_')) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}

export function getStoredCart(): import('./types').CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCart(cart: import('./types').CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart))
}

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
      return INITIAL_PRODUCTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_PRODUCTS
  }
}

export function saveStoredProducts(products: Product[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredOrders(orders: Order[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
}

export function getStoredNotifications(): CustomerNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredNotifications(notifs: CustomerNotification[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs))
}

export function getStoredEvents(): SystemEventLog[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredEvents(events: SystemEventLog[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events.slice(0, 50)))
}

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-aurora-pro10',
    code: 'AURORA-PRO10',
    discountType: 'PERCENT',
    discountValue: 10,
    category: 'Smartphones & Laptops',
    minOrderAmount: 0,
    status: 'ACTIVE',
    usedCount: 24,
    expires: '2026-12-31',
    description: '10% instant discount across all premium hardware lines.',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'promo-flash-drop-5k',
    code: 'FLASH-DROP-5K',
    discountType: 'FIXED',
    discountValue: 5000,
    category: 'Orders above ETB 50,000',
    minOrderAmount: 50000,
    status: 'ACTIVE',
    usedCount: 11,
    expires: '2026-11-15',
    description: 'Flat ETB 5,000 savings on orders exceeding ETB 50,000.',
    createdAt: '2026-09-15T00:00:00Z',
  },
  {
    id: 'promo-audio-titanium',
    code: 'AUDIO-TITANIUM',
    discountType: 'PERCENT',
    discountValue: 15,
    category: 'Audio',
    minOrderAmount: 0,
    status: 'ACTIVE',
    usedCount: 39,
    expires: '2026-12-31',
    description: '15% savings on all noise cancelling & wireless audio gear.',
    createdAt: '2026-08-20T00:00:00Z',
  },
]

export function getStoredPromotions(): Promotion[] {
  if (typeof window === 'undefined') return INITIAL_PROMOTIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROMOTIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(INITIAL_PROMOTIONS))
      return INITIAL_PROMOTIONS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_PROMOTIONS
  }
}

export function saveStoredPromotions(promos: Promotion[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promos))
}

export function validatePromotion(
  code: string,
  subtotal: number,
  cartItems: CartItem[]
): { valid: boolean; discount: number; promo?: Promotion; error?: string } {
  const normalized = code.trim().toUpperCase()
  if (!normalized) {
    return { valid: false, discount: 0, error: 'Please enter a promo code.' }
  }

  const promos = getStoredPromotions()
  const promo = promos.find((p) => p.code.toUpperCase() === normalized)

  if (!promo) {
    return { valid: false, discount: 0, error: `Promo code "${normalized}" does not exist.` }
  }

  if (promo.status !== 'ACTIVE') {
    return { valid: false, discount: 0, error: `Promo code "${normalized}" is currently paused or inactive.` }
  }

  // Check expiration if date provided
  if (promo.expires && promo.expires !== 'Ongoing') {
    const expDate = new Date(promo.expires)
    if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
      return { valid: false, discount: 0, error: `Promo code "${normalized}" has expired.` }
    }
  }

  // Check minimum order amount
  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      error: `Requires a minimum purchase of ${formatMoney(promo.minOrderAmount)} (current: ${formatMoney(subtotal)}).`,
    }
  }

  // Calculate discount
  let discount = 0
  if (promo.discountType === 'PERCENT') {
    discount = Math.round((subtotal * promo.discountValue) / 100)
  } else {
    discount = Math.min(subtotal, promo.discountValue)
  }

  return { valid: true, discount, promo }
}

export function recordPromotionUsage(code: string): void {
  if (typeof window === 'undefined') return
  const normalized = code.trim().toUpperCase()
  const promos = getStoredPromotions()
  const updated = promos.map((p) => {
    if (p.code.toUpperCase() === normalized) {
      return { ...p, usedCount: p.usedCount + 1 }
    }
    return p
  })
  saveStoredPromotions(updated)
}

