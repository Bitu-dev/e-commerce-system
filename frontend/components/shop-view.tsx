'use client'

import React, { useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  Filter,
  Heart,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react'
import { CATEGORIES, formatMoney } from '@/lib/store'
import { Product } from '@/lib/types'

interface ShopViewProps {
  products: Product[]
  onAddToCart: (p: Product) => void
  onSelectProduct: (p: Product) => void
}

export function ShopView({ products, onAddToCart, onSelectProduct }: ShopViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured')

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'stock') return b.stockQuantity - a.stockQuantity
        return 0
      })
  }, [products, selectedCategory, searchQuery, sortBy])

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-10">
      {/* Catalog Title & Search Bar */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-3.5" />
            <span>Curated Hardware Catalog</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Explore All Devices & Essentials
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time stock availability with instant cache synchronization.
          </p>
        </div>

        {/* Search Input & Sort Selector */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices, chips, specs..."
              className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs text-zinc-900 outline-none transition focus:border-emerald-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-medium text-zinc-700 outline-none shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Stock Availability</option>
          </select>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.name
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-md dark:bg-emerald-500 dark:text-black'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Products Grid - Fluid Full Width */}
      {filteredProducts.length === 0 ? (
        <div className="mt-16 w-full rounded-3xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-800">
          <Search className="mx-auto size-8 text-zinc-400" />
          <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Try adjusting your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            className="mt-4 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white dark:bg-emerald-500 dark:text-black"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stockQuantity === 0
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  {/* Image Container */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105 dark:mix-blend-normal"
                    />

                    {product.badge && (
                      <span className="absolute top-3 left-3 rounded-full bg-zinc-900/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                        {product.badge}
                      </span>
                    )}

                    <span
                      className={`absolute bottom-3 right-3 rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold shadow-sm backdrop-blur ${
                        isOutOfStock
                          ? 'bg-red-500/90 text-white'
                          : isLowStock
                          ? 'bg-amber-500/90 text-black'
                          : 'bg-white/90 text-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-200'
                      }`}
                    >
                      {isOutOfStock ? 'Sold Out' : `Stock: ${product.stockQuantity}`}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {product.category}
                      </span>
                      {product.rating && (
                        <span className="text-[11px] font-semibold text-zinc-400">
                          ★ {product.rating}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="mt-1 cursor-pointer font-bold text-zinc-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 text-sm"
                    >
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer / Price & Add */}
                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <div>
                    <span className="text-base font-black text-zinc-900 dark:text-white">
                      {formatMoney(product.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow transition ${
                      isOutOfStock
                        ? 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800'
                        : 'bg-zinc-900 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400'
                    }`}
                  >
                    <Plus className="size-3.5" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
