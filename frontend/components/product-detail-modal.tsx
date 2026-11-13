'use client'

import React, { useState } from 'react'
import {
  Check,
  CheckCircle2,
  Clock,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react'
import { formatMoney } from '@/lib/store'
import { Product } from '@/lib/types'

interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (p: Product, quantity: number) => void
}

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const isOutOfStock = product.stockQuantity <= 0
  const maxQty = Math.max(1, product.stockQuantity)

  const handleAdd = () => {
    onAddToCart(product, quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl xl:max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/80 text-zinc-500 shadow-sm backdrop-blur transition hover:bg-zinc-100 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700"
          aria-label="Close details"
        >
          <X className="size-4" />
        </button>

        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2">
          {/* Image Showcase */}
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover mix-blend-multiply transition duration-500 hover:scale-105 dark:mix-blend-normal"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details & Action */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {product.category}
                </span>
                {product.rating && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="size-3.5 fill-current" />
                    {product.rating} ({product.reviewsCount || 42} reviews)
                  </span>
                )}
              </div>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                {product.name}
              </h2>

              <p className="mt-3 text-2xl font-black text-zinc-900 dark:text-white">
                {formatMoney(product.price)}
              </p>

              <p className="mt-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>

              {/* Live stock status pill */}
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                <CheckCircle2
                  className={`size-4 ${
                    isOutOfStock ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {isOutOfStock ? 'Sold Out in Warehouse' : `In Stock: ${product.stockQuantity} units available`}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Synchronized via Product & Inventory Service database lock.
                  </p>
                </div>
              </div>

              {/* Quantity Picker */}
              {!isOutOfStock && (
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Quantity</span>
                  <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-800">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="flex size-7 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-xs font-bold text-zinc-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty}
                      className="flex size-7 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CTA & Trust badges */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold shadow-lg transition ${
                  isOutOfStock
                    ? 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800'
                    : 'bg-zinc-900 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400'
                }`}
              >
                <ShoppingBag className="size-4" />
                {isOutOfStock ? 'Currently Unavailable' : `Add ${quantity} to Bag · ${formatMoney(product.price * quantity)}`}
              </button>

              <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 text-center text-[10px] text-zinc-500 dark:border-zinc-800">
                <div className="flex flex-col items-center">
                  <Truck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="mt-1">Express Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="mt-1">Official Warranty</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="mt-1">Hassle-Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
