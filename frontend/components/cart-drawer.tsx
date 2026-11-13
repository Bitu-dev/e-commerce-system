'use client'

import React from 'react'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { formatMoney } from '@/lib/store'
import { CartItem } from '@/lib/types'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onProceedToCheckout: () => void
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-in Drawer */}
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-950 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Shopping Bag</h2>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900"
            aria-label="Close cart"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
                <ShoppingBag className="size-6" />
              </div>
              <h3 className="mt-4 font-bold text-zinc-900 dark:text-white">Your bag is empty</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Explore the hardware collection and add devices to your cart.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-16 rounded-xl bg-white object-cover mix-blend-multiply dark:mix-blend-normal"
                  />

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-400 hover:text-red-500"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {formatMoney(item.price)}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-[11px] font-bold text-zinc-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-700"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-semibold text-zinc-500">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Bar */}
        {cart.length > 0 && (
          <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-zinc-500">Subtotal</span>
              <span className="text-lg font-black text-zinc-900 dark:text-white">
                {formatMoney(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Tax calculated and stock locked asynchronously on checkout.
            </p>

            <button
              onClick={() => {
                onClose()
                onProceedToCheckout()
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-xs font-bold text-white shadow-xl transition hover:bg-zinc-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
