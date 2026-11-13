'use client'

import React, { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'
import {
  formatMoney,
  getStoredCart,
  getStoredNotifications,
  getStoredOrders,
  getStoredProducts,
  getStoredUser,
  saveCart,
  saveStoredUser,
  TEST_USERS,
} from '@/lib/store'
import { CartItem, CustomerNotification, Order, Product, SystemEventLog, UserProfile } from '@/lib/types'
import { Navbar } from './navbar'
import { LandingHero } from './landing-hero'
import { ShopView } from './shop-view'
import { ProductDetailModal } from './product-detail-modal'
import { CartDrawer } from './cart-drawer'
import { CheckoutView } from './checkout-view'
import { OrdersView } from './orders-view'
import { AdminView } from './admin-view'
import { LoginView } from './login-view'
import { Footer } from './footer'

export default function MiniCommerceApp() {
  const [currentView, setCurrentView] = useState<'landing' | 'shop' | 'orders' | 'admin' | 'login' | 'checkout'>('landing')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [systemEvents, setSystemEvents] = useState<SystemEventLog[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Initialize theme from storage or system
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurora_theme') as 'light' | 'dark' | null
      const initialTheme = saved === 'light' ? 'light' : 'dark'
      setTheme(initialTheme)
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurora_theme', next)
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Hydrate state from storage and ensure active session
  const refreshAllData = async () => {
    let user = getStoredUser()

    if (user) {
      try {
        user = await ApiClient.ensureValidToken(user)
        setCurrentUser(user)
      } catch (err) {
        console.warn('Session expired or invalid during refresh:', err)
        saveStoredUser(null)
        setCurrentUser(null)
        user = null
      }
    } else {
      setCurrentUser(null)
    }

    try {
      const prods = await ApiClient.getProducts()
      setProducts(prods)
    } catch (e) {
      console.error('Failed to load products from Product Service:', e)
    }

    const storedCart = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('aurora_cart') || '[]') : []
    setCart(storedCart)

    if (user) {
      try {
        const myNotifs = await ApiClient.getMyNotifications(user)
        setNotifications(myNotifs)

        if (user.role === 'ADMIN') {
          const allOrders = await ApiClient.getAllOrders(user)
          setOrders(allOrders)
        } else {
          const myOrders = await ApiClient.getMyOrders(user)
          setOrders(myOrders)
        }
      } catch (err: any) {
        if (err.message && err.message.includes('401')) {
          saveStoredUser(null)
          setCurrentUser(null)
          navigateTo('login')
        }
      }
    } else {
      setNotifications([])
      setOrders([])
    }

    const events = await ApiClient.getSystemEvents()
    setSystemEvents(events)
  }

  // Sync view change with role protection and URL history
  const navigateTo = (requestedView: typeof currentView, userOverride?: UserProfile | null) => {
    let target = requestedView
    const activeUser = userOverride !== undefined ? userOverride : currentUser

    // Strict role protection without trapping: guests must sign in to access shop, orders, or checkout
    if (!activeUser) {
      if (target === 'orders' || target === 'checkout' || target === 'admin' || target === 'shop') {
        target = 'login'
      }
    } else if (activeUser.role === 'USER') {
      if (target === 'admin') {
        target = 'shop'
      }
    } else if (activeUser.role === 'ADMIN') {
      // Store administrator operates in admin portal; allow explicit navigation to login for signing out
      if (target === 'checkout' || target === 'orders' || target === 'shop' || target === 'landing') {
        target = 'admin'
      }
    }

    setCurrentView(target)

    if (typeof window !== 'undefined') {
      const targetPath = target === 'landing' ? '/' : `/${target}`
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    refreshAllData()

    if (typeof window !== 'undefined') {
      const user = getStoredUser()
      const path = window.location.pathname

      if (path === '/shop') {
        setCurrentView(user?.role === 'ADMIN' ? 'admin' : (user?.role === 'USER' ? 'shop' : 'login'))
      } else if (path === '/orders') {
        setCurrentView(user?.role === 'USER' ? 'orders' : 'login')
      } else if (path === '/admin') {
        setCurrentView(user?.role === 'ADMIN' ? 'admin' : (user?.role === 'USER' ? 'shop' : 'login'))
      } else if (path === '/login') {
        setCurrentView('login')
      } else if (path === '/checkout') {
        setCurrentView(user?.role === 'USER' ? 'checkout' : 'login')
      } else {
        // Landing page: if admin, go to admin portal; otherwise landing
        setCurrentView(user?.role === 'ADMIN' ? 'admin' : 'landing')
      }

      const handlePop = () => {
        const u = getStoredUser()
        const p = window.location.pathname
        if (p === '/shop') setCurrentView(u?.role === 'ADMIN' ? 'admin' : (u?.role === 'USER' ? 'shop' : 'login'))
        else if (p === '/orders') setCurrentView(u?.role === 'USER' ? 'orders' : 'login')
        else if (p === '/admin') setCurrentView(u?.role === 'ADMIN' ? 'admin' : (u?.role === 'USER' ? 'shop' : 'login'))
        else if (p === '/login') setCurrentView('login')
        else if (p === '/checkout') setCurrentView(u?.role === 'USER' ? 'checkout' : 'login')
        else setCurrentView(u?.role === 'ADMIN' ? 'admin' : 'landing')
      }

      window.addEventListener('popstate', handlePop)
      return () => window.removeEventListener('popstate', handlePop)
    }
  }, [])

  // Cart operations
  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurora_cart', JSON.stringify(newCart))
    }
  }

  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!currentUser) {
      navigateTo('login')
      return
    }

    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      const nextQty = Math.min(product.stockQuantity, existing.quantity + quantity)
      updateCartState(cart.map((item) => (item.id === product.id ? { ...item, quantity: nextQty } : item)))
    } else {
      updateCartState([...cart, { ...product, quantity: Math.min(product.stockQuantity, quantity) }])
    }
    setCartOpen(true)
  }

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      updateCartState(cart.filter((item) => item.id !== productId))
    } else {
      updateCartState(
        cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
      )
    }
  }

  const handleRemoveFromCart = (productId: string) => {
    updateCartState(cart.filter((item) => item.id !== productId))
  }

  const handleClearCart = () => {
    updateCartState([])
  }

  // User management
  const handleSwitchUser = async (username: 'bitaniya.user' | 'bitaniya.admin') => {
    try {
      const pass = username === 'bitaniya.admin' ? 'adminPass2026' : 'password123'
      const user = await ApiClient.login(username, pass)
      setCurrentUser(user)
      saveStoredUser(user)
      await refreshAllData()
      navigateTo(user.role === 'ADMIN' ? 'admin' : 'shop', user)
    } catch (e) {
      console.error('Failed to switch user via Keycloak:', e)
    }
  }

  // Proactive session heartbeat: checks token validity every 45 seconds
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(async () => {
      try {
        const freshUser = await ApiClient.ensureValidToken(currentUser)
        if (freshUser.token !== currentUser.token) {
          setCurrentUser(freshUser)
        }
      } catch {
        setCurrentUser(null)
        saveStoredUser(null)
        navigateTo('login', null)
      }
    }, 45000)
    return () => clearInterval(interval)
  }, [currentUser])

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user)
    saveStoredUser(user)
    refreshAllData()
    navigateTo(user.role === 'ADMIN' ? 'admin' : 'shop', user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    saveStoredUser(null)
    setCart([])
    setOrders([])
    setNotifications([])
    refreshAllData()
    navigateTo('login', null)
  }

  // Seamless role-based redirect protection (prevents any 403 states)
  useEffect(() => {
    if (currentView === 'admin' && currentUser?.role !== 'ADMIN') {
      navigateTo(currentUser?.role === 'USER' ? 'shop' : 'login', currentUser)
    }
  }, [currentView, currentUser])

  // Notifications
  const handleMarkNotifRead = async (id: string) => {
    if (!currentUser) return
    await ApiClient.markNotificationAsRead(currentUser, id)
    const myNotifs = await ApiClient.getMyNotifications(currentUser)
    setNotifications(myNotifs)
  }

  return (
    <div className={`min-h-screen ${currentView === 'landing' ? 'bg-[#fafaf9] text-zinc-900 dark:bg-[#060907] dark:text-white' : 'bg-[#fcfdfc] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'} antialiased selection:bg-emerald-500 selection:text-black flex flex-col justify-between transition-colors duration-200`}>
      <div>
        {/* Navbar */}
        <Navbar
          currentView={currentView}
          setCurrentView={(v) => navigateTo(v as any)}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onOpenCart={() => setCartOpen(true)}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotifRead}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Main View Router */}
        <main className="min-h-[calc(100vh-140px)]">
          {currentView === 'landing' && (
            <LandingHero
              products={products}
              currentUser={currentUser}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onNavigateToShop={() => navigateTo('shop')}
              onNavigateToLogin={() => navigateTo('login')}
            />
          )}

          {currentView === 'shop' && (
            <ShopView
              products={products}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          )}

          {currentView === 'orders' && (
            <OrdersView
              currentUser={currentUser}
              onNavigateToShop={() => navigateTo('shop')}
              onNavigateToLogin={() => navigateTo('login')}
            />
          )}

          {currentView === 'admin' && currentUser?.role === 'ADMIN' && (
            <AdminView
              currentUser={currentUser}
              products={products}
              orders={orders}
              systemEvents={systemEvents}
              onRefreshData={refreshAllData}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {currentView === 'login' && (
            <LoginView
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onContinueToShop={() => navigateTo(currentUser?.role === 'ADMIN' ? 'admin' : 'shop')}
            />
          )}

          {currentView === 'checkout' && (
            <CheckoutView
              cart={cart}
              currentUser={currentUser}
              onOrderPlaced={(order) => {
                refreshAllData()
                navigateTo('orders')
              }}
              onNavigateToLogin={() => navigateTo('login')}
              onClearCart={handleClearCart}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer onNavigate={(v) => navigateTo(v as any)} currentUser={currentUser} currentView={currentView} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => navigateTo('checkout')}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
