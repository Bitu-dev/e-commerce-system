import React, { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Radio,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react'
import { ApiClient } from '@/lib/api-client'
import { formatMoney, recordPromotionUsage, validatePromotion } from '@/lib/store'
import { CartItem, Order, Promotion, UserProfile } from '@/lib/types'

interface CheckoutViewProps {
  cart: CartItem[]
  currentUser: UserProfile | null
  onOrderPlaced: (order: Order) => void
  onNavigateToLogin: () => void
  onClearCart: () => void
}

export function CheckoutView({
  cart,
  currentUser,
  onOrderPlaced,
  onNavigateToLogin,
  onClearCart,
}: CheckoutViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Promo Code State
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null)
  const [promoDiscount, setPromoDiscount] = useState<number>(0)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 250
  const total = Math.max(0, subtotal - promoDiscount + shipping)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError('')
    setPromoSuccess('')

    if (!promoInput.trim()) {
      setPromoError('Please enter a promotion or coupon code.')
      return
    }

    const result = validatePromotion(promoInput, subtotal, cart)
    if (!result.valid || !result.promo) {
      setPromoError(result.error || 'Invalid promotion code.')
      setAppliedPromo(null)
      setPromoDiscount(0)
      return
    }

    setAppliedPromo(result.promo)
    setPromoDiscount(result.discount)
    setPromoSuccess(`Applied coupon "${result.promo.code}": saved ${formatMoney(result.discount)}!`)
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoDiscount(0)
    setPromoInput('')
    setPromoError('')
    setPromoSuccess('')
  }

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      setErrorMessage('Authentication required. Please sign in or select a test user account.')
      return
    }
    if (cart.length === 0) {
      setErrorMessage('Cannot submit an empty order.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const itemsToOrder = cart.map((c) => ({
        product: c,
        quantity: c.quantity,
      }))

      // Call Order Service (POST /api/orders)
      const newOrder = await ApiClient.placeOrder(currentUser, itemsToOrder)

      // If a real promo was applied, record usage
      if (appliedPromo) {
        recordPromotionUsage(appliedPromo.code)
      }

      onClearCart()
      onOrderPlaced(newOrder)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-10">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        <Radio className="size-3.5 animate-pulse" />
        <span>Secure Order Checkout</span>
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        Review & Complete Order
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Submitting creates a verified order and initiates asynchronous inventory reservation.
      </p>

      {errorMessage && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-12 xl:gap-12">
        {/* Left Column: Customer & Delivery details (Takes 7 columns) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Customer Identity Card */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <User className="size-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">Customer Account</h3>
              </div>
              {currentUser && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Verified Identity
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-zinc-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">{currentUser.email}</p>
                  <p className="mt-2 text-[11px] text-zinc-400 font-mono">
                    Customer ID: <code className="text-emerald-600 font-bold">{currentUser.id}</code>
                  </p>
                </div>
                <button
                  onClick={onNavigateToLogin}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Switch Persona
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                <p className="font-bold text-sm">You are not signed in.</p>
                <p className="mt-1 leading-relaxed">
                  Authentication is required to place and track orders.
                </p>
                <button
                  onClick={onNavigateToLogin}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700"
                >
                  <KeyRound className="size-3.5" /> Sign in as bitaniya.user
                </button>
              </div>
            )}
          </div>

          {/* Delivery & Dispatch Note */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2.5">
              <Truck className="size-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">Asynchronous Fulfillment Assurance</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              Orders are validated and processed asynchronously. When submitted, the order is persisted with status{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">PENDING</strong> while inventory availability is
              atomically reserved to prevent overselling.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary (Takes 5 columns) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Order Summary</h3>

            {/* Items List */}
            <div className="mt-5 max-h-72 space-y-3 overflow-y-auto border-y border-zinc-100 py-4 pr-1 dark:border-zinc-800">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt=""
                      className="size-11 rounded-xl bg-zinc-100 object-cover"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="mt-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Promo code (e.g. AURORA-PRO10)"
                    disabled={!!appliedPromo}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs font-mono font-semibold uppercase outline-none placeholder:normal-case placeholder:font-sans placeholder:font-normal dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-red-400"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
                  >
                    Apply
                  </button>
                )}
              </form>

              {promoSuccess && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>{promoSuccess}</span>
                  </span>
                </div>
              )}

              {promoError && (
                <div className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {promoError}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {formatMoney(subtotal)}
                </span>
              </div>
              {appliedPromo && promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="size-3" />
                    <span>Coupon ({appliedPromo.code})</span>
                  </span>
                  <span className="font-mono">-{formatMoney(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Express Delivery</span>
                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  {shipping === 0 ? 'FREE' : formatMoney(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-3 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-white">
                <span>Total Amount</span>
                <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatMoney(total)}
                </span>
              </div>
            </div>


            {/* Action Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !currentUser || cart.length === 0}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold text-white shadow-xl transition ${
                isSubmitting || !currentUser || cart.length === 0
                  ? 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-800'
                  : 'bg-zinc-900 hover:bg-emerald-600 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="size-4" />
                  <span>Submit Order</span>
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-zinc-400">
              Guaranteed stock reservation & item price freeze at submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
