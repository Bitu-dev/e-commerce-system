export type Role = 'USER' | 'ADMIN'

export interface UserProfile {
  id: string
  username: string
  name: string
  email: string
  role: Role
  roles?: string[]
  token: string
  refreshToken?: string
  expiresAt?: number
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  stockQuantity: number
  active: boolean
  image: string
  badge?: string
  rating?: number
  reviewsCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CartItem extends Product {
  quantity: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
  image?: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail?: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  rejectionReason?: string
}

export type NotificationEventType = 'OrderPlaced' | 'OrderConfirmed' | 'OrderRejected'

export interface CustomerNotification {
  id: string
  eventId: string
  customerId: string
  orderId: string
  message: string
  read: boolean
  createdAt: string
  type: NotificationEventType
}

export interface SystemEventLog {
  id: string
  eventId: string
  eventType: 'OrderPlaced' | 'InventoryReserved' | 'InventoryReservationFailed' | 'OrderConfirmed' | 'OrderRejected' | 'ProductUpdated'
  sourceService: 'Order Service' | 'Product and Inventory Service' | 'Notification Service'
  payload: Record<string, unknown>
  timestamp: string
}

export interface Promotion {
  id: string
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  category?: string
  minOrderAmount?: number
  status: 'ACTIVE' | 'INACTIVE'
  usedCount: number
  expires: string
  description?: string
  createdAt?: string
}

