'use client'

import React from 'react'
import { Shield, Sparkles } from 'lucide-react'

interface FooterProps {
  onNavigate: (view: string) => void
  currentUser?: import('@/lib/types').UserProfile | null
  currentView?: string
}

export function Footer({ onNavigate, currentUser, currentView }: FooterProps) {
  // If in admin view, minimal operations footer
  if (currentUser?.role === 'ADMIN') {
    return (
      <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/brand/aurora-mark.svg" alt="Aurora" className="size-5 rounded-md" />
            <p>© Aurora Operations Portal. All rights reserved.</p>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">Store Operations, Inventory & Order Fulfillment</p>
        </div>
      </footer>
    )
  }

  const isLanding = currentView === 'landing'

  return (
    <footer
      className={`w-full border-t ${
        isLanding
          ? 'border-zinc-800 bg-[#060907] text-zinc-300'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300'
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand & Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src="/brand/aurora-mark.svg"
                alt="Aurora"
                className="size-9 rounded-xl shadow-md border border-zinc-800/80"
              />
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Aurora<span className="text-emerald-600 dark:text-emerald-400 font-light ml-1">Hardware</span>
              </span>
            </div>
            <p className="mt-3.5 max-w-md text-xs leading-relaxed text-zinc-500">
              Thoughtfully curated technology designed for longevity, acoustic fidelity, and everyday performance.
              Backed by official manufacturer warranties and easy returns.
            </p>
            <div className="mt-5 text-xs text-zinc-400">
              <span>Customer Concierge: support@shopaurora.com</span>
            </div>
          </div>

          {/* Navigation Links (7 cols) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Storefront
              </h4>
              <ul className="mt-3.5 space-y-2.5 text-xs text-zinc-500">
                <li>
                  <button onClick={() => onNavigate('landing')} className="hover:text-emerald-600 transition">
                    Featured
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('shop')} className="hover:text-emerald-600 transition">
                    Catalog & Products
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Account & Orders
              </h4>
              <ul className="mt-3.5 space-y-2.5 text-xs text-zinc-500">
                <li>
                  <button onClick={() => onNavigate('login')} className="hover:text-emerald-600 transition">
                    Sign In to Account
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('orders')} className="hover:text-emerald-600 transition">
                    Track Orders
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Assurance
              </h4>
              <ul className="mt-3.5 space-y-2.5 text-xs text-zinc-500">
                <li>Official 2-Year Warranty</li>
                <li>Free Express Shipping</li>
                <li>30-Day Hassle-Free Returns</li>
                <li>100% Genuine Devices</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-6 text-[11px] text-zinc-400 sm:flex-row dark:border-zinc-800">
          <p>© Aurora Hardware. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Warranty Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
