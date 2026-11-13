'use client'

import React, { useState } from 'react'
import {
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Package,
  Shield,
  ShoppingBag,
  Sun,
  User,
  X,
} from 'lucide-react'
import { CustomerNotification, UserProfile } from '@/lib/types'

interface NavbarProps {
  currentView: string
  setCurrentView: (view: string) => void
  currentUser: UserProfile | null
  setCurrentUser: (user: UserProfile | null) => void
  cartCount: number
  onOpenCart: () => void
  notifications: CustomerNotification[]
  onMarkNotificationAsRead: (id: string) => void
  onSwitchUser: (username: 'bitaniya.user' | 'bitaniya.admin') => void
  onLogout?: () => void
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export function Navbar({
  currentView,
  setCurrentView,
  currentUser,
  setCurrentUser,
  cartCount,
  onOpenCart,
  notifications,
  onMarkNotificationAsRead,
  onSwitchUser,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const unreadNotifs = notifications.filter((n) => !n.read)
  const isAdmin = currentUser?.role === 'ADMIN'
  const isCustomer = currentUser?.role === 'USER'

  // If logged in as ADMIN, show dedicated Admin Console Operations Bar
  if (isAdmin) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950 text-white backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {/* Admin Brand & Operations Title */}
          <div className="flex items-center gap-3">
            <img
              src="/brand/aurora-mark.svg"
              alt="Aurora"
              className="size-9 rounded-xl shadow-md border border-zinc-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">
                  Aurora
                </span>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-amber-500/30">
                  Admin Portal
                </span>
              </div>
              <span className="block text-[11px] tracking-wide text-zinc-400 -mt-0.5 font-medium">
                Store Operations, Inventory & Order Fulfillment
              </span>
            </div>
          </div>

        {/* Admin Right: Theme Toggle, Profile Pill & Sign Out */}
        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex size-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-zinc-300" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 shadow-sm">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-none text-white">{currentUser.name}</p>
              <p className="mt-1 text-[10px] leading-none text-amber-400 font-mono">Store Administrator</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onLogout) {
                onLogout()
              } else {
                setCurrentUser(null)
                setCurrentView('login')
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-900/50 hover:text-white"
            title="Sign Out of Admin Console"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
        currentView === 'landing'
          ? 'border-zinc-200/80 bg-white/90 text-zinc-900 dark:border-zinc-800/80 dark:bg-[#060907]/90 dark:text-white'
          : 'border-zinc-200/80 bg-white/95 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-white'
      }`}
    >
      {/* Main Navigation Bar */}
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Brand Logo */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => setCurrentView('landing')}
            className="group flex items-center gap-3 text-left transition"
          >
            <img
              src="/brand/aurora-mark.svg"
              alt="Aurora"
              className="size-9 rounded-xl shadow-md border border-zinc-800/80 transition group-hover:scale-105"
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Aurora<span className="text-emerald-600 dark:text-emerald-400 font-light ml-1">Hardware</span>
              </span>
              <span className="block text-[10px] tracking-widest text-zinc-400 uppercase -mt-0.5 font-medium">
                Premium Devices
              </span>
            </div>
          </button>

          {/* Customer Navigation Links (Only shown when logged in as customer) */}
          {isCustomer && (
            <nav className="hidden items-center gap-1 md:flex">
              <button
                onClick={() => setCurrentView('landing')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currentView === 'landing'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setCurrentView('shop')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currentView === 'shop'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Shop All
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currentView === 'orders'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                My Orders
              </button>
            </nav>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white shadow-sm"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="size-4 text-amber-400 transition hover:rotate-45" />
              ) : (
                <Moon className="size-4 text-zinc-700 transition hover:-rotate-12" />
              )}
            </button>
          )}

          {/* Customer Logged-in Features: Notifications & Bag */}
          {isCustomer && (
            <>
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  aria-label="Order notifications"
                >
                  <Bell className="size-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {/* Notification Drawer Popover */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Bell className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          Order Updates
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {unreadNotifs.length} unread
                      </span>
                    </div>

                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-zinc-500">
                          No order notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => onMarkNotificationAsRead(n.id)}
                            className={`cursor-pointer rounded-xl p-3 text-xs transition ${
                              n.read
                                ? 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400'
                                : 'border-l-2 border-emerald-500 bg-emerald-50/50 text-zinc-900 dark:bg-emerald-950/20 dark:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                                {n.type === 'OrderPlaced'
                                  ? 'Order Placed'
                                  : n.type === 'OrderConfirmed'
                                  ? 'Order Confirmed'
                                  : 'Order Update'}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 border-t border-zinc-100 pt-2 text-center dark:border-zinc-800">
                      <button
                        onClick={() => {
                          setNotifOpen(false)
                          setCurrentView('orders')
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        View All Orders →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Bag Trigger */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Bag</span>
                <span className="flex size-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-emerald-400 dark:text-black">
                  {cartCount}
                </span>
              </button>

              {/* Customer Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-bold leading-none text-zinc-900 dark:text-white">
                      {currentUser.name}
                    </p>
                    <p className="mt-1 text-[10px] font-medium leading-none text-zinc-500">
                      Customer
                    </p>
                  </div>
                  <ChevronDown className="size-3 text-zinc-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                      <p className="text-xs font-medium text-zinc-400">Signed in as</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        {currentUser.email}
                      </p>
                    </div>

                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          setCurrentView('orders')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <Package className="size-3.5" />
                        <span>My Orders</span>
                      </button>
                    </div>

                    <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          if (onLogout) {
                            onLogout()
                          } else {
                            setCurrentUser(null)
                            setCurrentView('login')
                          }
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="size-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* GUEST (NOT LOGGED IN): Sleek pill Sign In button matching screenshot */}
          {!currentUser && (
            <button
              onClick={() => setCurrentView('login')}
              className="flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-900 px-4 sm:px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:hover:border-zinc-600"
            >
              <User className="size-3.5 text-zinc-300 dark:text-zinc-400" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
