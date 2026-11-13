'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  Radio,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { ApiClient } from '@/lib/api-client'
import { formatMoney } from '@/lib/store'
import { Order, OrderStatus, UserProfile } from '@/lib/types'

interface OrdersViewProps {
  currentUser: UserProfile | null
  onNavigateToShop: () => void
  onNavigateToLogin: () => void
}

export function OrdersView({ currentUser, onNavigateToShop, onNavigateToLogin }: OrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'ALL' | OrderStatus>('ALL')
  const [isPolling, setIsPolling] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string>('')

  // Load and poll orders
  const fetchOrders = async () => {
    if (!currentUser) return
    try {
      const data = await ApiClient.getMyOrders(currentUser)
      setOrders(data)
      setLastRefreshed(new Date().toLocaleTimeString())

      // Check if any order is still PENDING
      const hasPending = data.some((o) => o.status === 'PENDING')
      setIsPolling(hasPending)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentUser])

  // Polling loop as specified in PDF Section 5 Step 5:
  useEffect(() => {
    if (!isPolling || !currentUser) return

    const interval = setInterval(() => {
      fetchOrders()
    }, 1500)

    return () => clearInterval(interval)
  }, [isPolling, currentUser])

  if (!currentUser) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-20 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Package className="mx-auto size-12 text-zinc-400" />
          <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">Sign In to Track Orders</h2>
          <p className="mt-2 text-xs text-zinc-500">
            Customers can only view their own order history with a verified authentication session.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-xs font-semibold text-white shadow dark:bg-emerald-500 dark:text-black"
          >
            Sign in as bitaniya.user
          </button>
        </div>
      </div>
    )
  }

  const filtered = orders.filter((o) => filterStatus === 'ALL' || o.status === filterStatus)

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-10">
      {/* Header & Polling status indicator */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <Radio className="size-3.5 animate-pulse" />
            <span>Real-Time Order Tracking & History</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Your Orders & Live Status
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Customer Account: <strong>{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        {/* Polling telemetry badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span
              className={`size-2.5 rounded-full ${
                isPolling ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span className="font-medium text-zinc-600 dark:text-zinc-300">
              {isPolling ? 'Checking order status...' : 'Order up to date'}
            </span>
          </div>

          <button
            onClick={fetchOrders}
            className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            title="Refresh Orders"
          >
            <RefreshCw className={`size-4 ${isPolling ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-8 flex gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {(['ALL', 'PENDING', 'CONFIRMED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filterStatus === tab
                ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-black'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab}
            {tab === 'ALL' && ` (${orders.length})`}
            {tab === 'PENDING' && ` (${orders.filter((o) => o.status === 'PENDING').length})`}
            {tab === 'CONFIRMED' && ` (${orders.filter((o) => o.status === 'CONFIRMED').length})`}
            {tab === 'REJECTED' && ` (${orders.filter((o) => o.status === 'REJECTED').length})`}
          </button>
        ))}
      </div>

      {/* Orders List - Spans Full Width */}
      {loading ? (
        <div className="py-24 text-center text-xs text-zinc-500">
          Loading order history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 w-full rounded-3xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-800">
          <Package className="mx-auto size-12 text-zinc-400" />
          <h3 className="mt-4 font-bold text-zinc-900 dark:text-white text-base">No orders placed yet</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Browse the hardware collection to submit an order and test live asynchronous tracking.
          </p>
          <button
            onClick={onNavigateToShop}
            className="mt-6 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-bold text-white shadow dark:bg-emerald-500 dark:text-black"
          >
            Explore Catalog →
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {filtered.map((order) => {
            const isPending = order.status === 'PENDING'
            const isConfirmed = order.status === 'CONFIRMED'
            const isRejected = order.status === 'REJECTED'

            return (
              <div
                key={order.id}
                className="w-full overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col justify-between gap-3 border-b border-zinc-100 bg-zinc-50/70 px-6 py-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                      #{order.id.toUpperCase()}
                    </span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
                        isPending
                          ? 'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : isConfirmed
                          ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {isPending && <Clock className="size-3.5 animate-spin text-amber-600" />}
                      {isConfirmed && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                      {isRejected && <XCircle className="size-3.5 text-red-600" />}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Event-Driven Timeline Stepper */}
                <div className="border-b border-zinc-100 bg-zinc-900/5 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Order Fulfillment Progress
                  </p>
                  <div className="mt-3 flex items-center gap-2 sm:gap-6 text-xs font-medium">
                    {/* Step 1: Order Placed */}
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Order Placed</span>
                    </div>

                    <div className="h-0.5 flex-1 bg-zinc-200 dark:bg-zinc-700" />

                    {/* Step 2: Processing */}
                    <div
                      className={`flex items-center gap-1.5 ${
                        isPending
                          ? 'text-amber-600 animate-pulse font-bold'
                          : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      }`}
                    >
                      {isPending ? (
                        <RefreshCw className="size-4 shrink-0 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4 shrink-0" />
                      )}
                      <span>Inventory Processing</span>
                    </div>

                    <div className="h-0.5 flex-1 bg-zinc-200 dark:bg-zinc-700" />

                    {/* Step 3: Terminal Status */}
                    <div
                      className={`flex items-center gap-1.5 ${
                        isConfirmed
                          ? 'text-emerald-600 font-bold dark:text-emerald-400'
                          : isRejected
                          ? 'text-red-600 font-bold'
                          : 'text-zinc-400'
                      }`}
                    >
                      {isConfirmed && <CheckCircle2 className="size-4 shrink-0" />}
                      {isRejected && <AlertTriangle className="size-4 shrink-0" />}
                      {isPending && <Clock className="size-4 shrink-0" />}
                      <span>
                        {isConfirmed
                          ? 'Inventory Confirmed'
                          : isRejected
                          ? 'Reservation Failed'
                          : 'Pending Allocation'}
                      </span>
                    </div>
                  </div>

                  {isRejected && order.rejectionReason && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      <strong>Rejection Reason:</strong> {order.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Items Snapshot Table */}
                <div className="px-6 py-5">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt=""
                              className="size-12 rounded-xl bg-zinc-100 object-cover"
                            />
                          )}
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white text-sm">
                              {item.productName}
                            </p>
                            <p className="font-mono text-xs text-zinc-400 mt-0.5">
                              Snapshot Price: {formatMoney(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                          {formatMoney(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-bold text-zinc-900 dark:border-zinc-800 dark:text-white">
                    <span>Order Total</span>
                    <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {formatMoney(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
