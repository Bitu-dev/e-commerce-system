'use client'

import React from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Headphones,
  Laptop,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Truck,
  User,
  Watch,
  Zap,
} from 'lucide-react'
import { Product, UserProfile } from '@/lib/types'
import { CATEGORIES, formatMoney } from '@/lib/store'

interface LandingHeroProps {
  products: Product[]
  currentUser: UserProfile | null
  onAddToCart: (p: Product) => void
  onNavigateToShop: () => void
  onNavigateToLogin: () => void
}

export function LandingHero({
  products,
  currentUser,
  onAddToCart,
  onNavigateToShop,
  onNavigateToLogin,
}: LandingHeroProps) {
  const flagship = products[0]
  const bestSellers = products.slice(0, 6)

  const handleAction = (p: Product) => {
    if (!currentUser) {
      onNavigateToLogin()
    } else {
      onAddToCart(p)
    }
  }

  return (
    <div className="w-full flex flex-col gap-20 pb-24 bg-[#fafaf9] text-zinc-900 dark:bg-[#060907] dark:text-white overflow-hidden transition-colors duration-200">
      {/* ========================================================================= */}
      {/* Hero Showcase Section — Matches Precision Engineering Design             */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-8 md:pt-14 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Ambient Dark Atmospheric Background Glows & Neon Ribbons */}
        <div className="pointer-events-none absolute -top-40 right-1/4 -z-10 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_65%)] blur-[100px]" />
        <div className="pointer-events-none absolute top-1/3 right-10 -z-10 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.14)_0%,transparent_60%)] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 left-10 -z-10 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_60%)] blur-[120px]" />

        {/* Curved Organic Neon Light Waves (Background Ribbon) */}
        <div className="pointer-events-none absolute top-16 right-0 -z-10 w-[65%] h-[550px] opacity-25">
          <svg viewBox="0 0 800 600" className="size-full">
            <path
              d="M 100 450 C 300 200, 500 500, 750 150"
              fill="none"
              stroke="url(#auroraWaveGrad)"
              strokeWidth="48"
              strokeLinecap="round"
              filter="blur(36px)"
            />
            <path
              d="M 150 480 C 350 240, 520 460, 780 180"
              fill="none"
              stroke="#84cc16"
              strokeWidth="24"
              strokeLinecap="round"
              filter="blur(28px)"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="auroraWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="60%" stopColor="#84cc16" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="w-full">
          <div className="grid items-center gap-12 lg:grid-cols-12 xl:gap-14">
            {/* Left Column: Headline, Copy & Actions */}
            <div className="lg:col-span-6 xl:col-span-6 z-10">
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl xl:text-[4.25rem] font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.08]">
                Precision engineering.
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-lime-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                  Thoughtfully crafted
                  <br />
                  devices.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl">
                Flagship laptops, phones, watches and audio, picked by hand. Stock updates live, so what you see is what ships.
              </p>

              {/* Primary CTAs (when authenticated) */}
              {currentUser && (
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <button
                    onClick={onNavigateToShop}
                    className="group flex items-center gap-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-7 py-3.5 text-xs sm:text-sm font-bold shadow-lg dark:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition hover:shadow-[0_0_35px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95"
                  >
                    <ShoppingBag className="size-4 text-white dark:text-zinc-900" />
                    <span>Explore Catalog</span>
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </button>
                  <button
                    onClick={onNavigateToShop}
                    className="rounded-full border border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-900/80 px-7 py-3.5 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 backdrop-blur transition hover:bg-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    Browse Categories
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Complete Floating Device Hardware Showcase */}
            <div className="lg:col-span-6 xl:col-span-6 relative mt-6 lg:mt-0">
              <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[550px] flex items-center justify-center">
                {/* Floating Micro-Sparks / Glowing Dust Particles */}
                <div className="pointer-events-none absolute top-[14%] right-[32%] size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                <div className="pointer-events-none absolute top-[38%] right-[16%] size-1 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-pulse delay-300" />
                <div className="pointer-events-none absolute top-[55%] right-[28%] size-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b] animate-pulse delay-700" />
                <div className="pointer-events-none absolute top-[82%] right-[24%] size-1 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-pulse delay-500" />
                <div className="pointer-events-none absolute top-[36%] right-[3%] size-1 rounded-full bg-emerald-300 shadow-[0_0_6px_#10b981] animate-pulse delay-1000" />
                <div className="pointer-events-none absolute top-[24%] right-[52%] size-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse delay-200" />

                {/* 1. Silicon Processor Chip (Top Left above Laptop) */}
                <div className="absolute top-2 sm:top-4 left-6 sm:left-14 z-20 w-16 sm:w-20 aspect-square -rotate-12 transition-transform duration-500 hover:rotate-0 hover:scale-110 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                  <svg viewBox="0 0 80 80" className="size-full">
                    {/* Metallic Pin Contacts */}
                    <g stroke="#71717a" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="16" y1="2" x2="16" y2="10" />
                      <line x1="26" y1="2" x2="26" y2="10" />
                      <line x1="36" y1="2" x2="36" y2="10" />
                      <line x1="46" y1="2" x2="46" y2="10" />
                      <line x1="56" y1="2" x2="56" y2="10" />
                      <line x1="66" y1="2" x2="66" y2="10" />

                      <line x1="16" y1="70" x2="16" y2="78" />
                      <line x1="26" y1="70" x2="26" y2="78" />
                      <line x1="36" y1="70" x2="36" y2="78" />
                      <line x1="46" y1="70" x2="46" y2="78" />
                      <line x1="56" y1="70" x2="56" y2="78" />
                      <line x1="66" y1="70" x2="66" y2="78" />

                      <line x1="2" y1="16" x2="10" y2="16" />
                      <line x1="2" y1="26" x2="10" y2="26" />
                      <line x1="2" y1="36" x2="10" y2="36" />
                      <line x1="2" y1="46" x2="10" y2="46" />
                      <line x1="2" y1="56" x2="10" y2="56" />
                      <line x1="2" y1="66" x2="10" y2="66" />

                      <line x1="70" y1="16" x2="78" y2="16" />
                      <line x1="70" y1="26" x2="78" y2="26" />
                      <line x1="70" y1="36" x2="78" y2="36" />
                      <line x1="70" y1="46" x2="78" y2="46" />
                      <line x1="70" y1="56" x2="78" y2="56" />
                      <line x1="70" y1="66" x2="78" y2="66" />
                    </g>
                    {/* Chip Body Package */}
                    <rect x="10" y="10" width="60" height="60" rx="9" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                    <rect x="15" y="15" width="50" height="50" rx="6" fill="#09090b" />
                    {/* Concentric Aurora Emblem on Chip */}
                    <path d="M 25 50 A 15 15 0 0 1 55 50" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" className="drop-shadow-[0_0_8px_#10b981]" />
                    <path d="M 32 50 A 8 8 0 0 1 48 50" fill="none" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                    <rect x="33" y="54" width="14" height="3" rx="1.5" fill="#fafafa" />
                  </svg>
                </div>

                {/* 2. Floating Over-Ear ANC Headphones (Top Right) */}
                <div className="absolute -top-4 sm:-top-8 right-6 sm:right-14 z-10 w-28 sm:w-36 aspect-square rotate-12 transition-transform duration-500 hover:rotate-6 hover:scale-105 drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]">
                  <svg viewBox="0 0 120 120" className="size-full">
                    {/* Headband arch */}
                    <path d="M 26 80 A 42 42 0 0 1 94 80" fill="none" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 26 80 A 42 42 0 0 1 94 80" fill="none" stroke="#52525b" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                    {/* Left Earcup */}
                    <ellipse cx="26" cy="80" rx="10" ry="17" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                    <ellipse cx="26" cy="80" rx="5" ry="12" fill="none" stroke="#10b981" strokeWidth="2" className="drop-shadow-[0_0_8px_#10b981]" />
                    {/* Right Earcup */}
                    <ellipse cx="94" cy="80" rx="10" ry="17" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                    <ellipse cx="94" cy="80" rx="5" ry="12" fill="none" stroke="#10b981" strokeWidth="2" className="drop-shadow-[0_0_8px_#10b981]" />
                  </svg>
                </div>

                {/* 3. Floating Notification Glass Card (Top Right) */}
                <div className="absolute top-2 sm:top-5 right-1 sm:right-12 z-30 rounded-2xl border border-emerald-500/25 bg-zinc-950/85 p-3 sm:p-3.5 backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-transform duration-300 hover:scale-105">
                  <div className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    <Check className="size-4 text-emerald-400 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Order #4821 confirmed</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">Stock reserved, packing now</p>
                  </div>
                </div>

                {/* 4. Rating Pill Badge (Above Laptop Center-Left) */}
                <div className="absolute top-20 sm:top-24 left-1/4 z-30 rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1 backdrop-blur-md flex items-center gap-1.5 shadow-xl transition-transform duration-300 hover:scale-105">
                  <Star className="size-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-white">4.9</span>
                  <span className="text-xs text-zinc-400">182 reviews</span>
                </div>

                {/* 5. Central Display Laptop (Angled MacBook Pro Display) */}
                <div className="relative mx-auto w-[290px] sm:w-[380px] md:w-[440px] lg:w-[480px] transition-transform duration-500 hover:scale-[1.01]">
                  {/* Laptop Lid Screen */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl border-[5px] border-zinc-800 bg-[#080c09] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_60px_rgba(16,185,129,0.2)] overflow-hidden">
                    {/* Screen Camera Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-16 sm:w-20 rounded-b-lg bg-zinc-900 z-20 flex items-center justify-center">
                      <div className="size-1 rounded-full bg-emerald-500/80 shadow-[0_0_4px_#10b981]" />
                    </div>

                    {/* Screen Wallpaper: Glowing Aurora Concentric Arcs */}
                    <div className="relative size-full flex items-center justify-center bg-gradient-to-b from-[#050806] via-[#09110d] to-[#040605] overflow-hidden">
                      {/* Background radial glow */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(16,185,129,0.35)_0%,rgba(132,204,22,0.15)_35%,transparent_75%)]" />

                      {/* Glossy glass reflection line */}
                      <div className="pointer-events-none absolute -top-12 -left-12 w-[140%] h-48 -rotate-12 bg-gradient-to-b from-white/10 via-white/3 to-transparent blur-sm" />

                      {/* Aurora Neon Concentric Arcs Logo */}
                      <div className="relative z-10 flex flex-col items-center">
                        <svg viewBox="0 0 200 130" className="w-40 sm:w-52 md:w-60 h-auto drop-shadow-[0_0_24px_rgba(16,185,129,0.7)]">
                          <defs>
                            <linearGradient id="laptopArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="70%" stopColor="#84cc16" />
                              <stop offset="100%" stopColor="#bef264" />
                            </linearGradient>
                            <filter id="laptopGlow">
                              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          {/* Outer arc */}
                          <path d="M 25 105 A 75 75 0 0 1 175 105" fill="none" stroke="url(#laptopArcGrad)" strokeWidth="8" strokeLinecap="round" filter="url(#laptopGlow)" />
                          {/* Inner arc */}
                          <path d="M 55 105 A 45 45 0 0 1 145 105" fill="none" stroke="url(#laptopArcGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
                          {/* Center capsule bar */}
                          <rect x="75" y="112" width="50" height="8" rx="4" fill="#fafafa" filter="url(#laptopGlow)" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Laptop Deck Base */}
                  <div className="relative -mt-0.5 mx-auto w-[108%] -left-[4%] h-3.5 sm:h-4.5 rounded-b-2xl bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border-t border-zinc-600/40 shadow-2xl flex items-center justify-center">
                    <div className="h-1.5 w-16 sm:w-20 rounded-b-md bg-zinc-950/70" />
                  </div>
                </div>

                {/* 6. Floating Smartphone (Front Left, Angled Forward) */}
                <div className="absolute -bottom-4 sm:-bottom-6 left-1 sm:left-4 z-30 w-36 sm:w-44 md:w-48 aspect-[9/18.5] rounded-[32px] sm:rounded-[38px] p-2 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-zinc-600/60 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.95),0_0_30px_rgba(16,185,129,0.25)] -rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                  <div className="relative size-full rounded-[26px] sm:rounded-[30px] bg-gradient-to-b from-[#09110d] via-[#050806] to-[#0a140f] overflow-hidden flex flex-col items-center justify-center p-4 border border-zinc-900/80">
                    {/* Top Dynamic Island */}
                    <div className="absolute top-2.5 h-3 w-12 rounded-full bg-black z-20" />
                    {/* Screen Radial Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.3)_0%,transparent_70%)]" />

                    {/* Order Confirmed Screen UI */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="size-11 sm:size-13 rounded-full border border-emerald-500/50 bg-emerald-950/60 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] mb-3">
                        <Check className="size-5 sm:size-6 text-emerald-400 stroke-[3]" />
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-white tracking-tight">Order confirmed</p>
                      <p className="mt-1 text-[10px] sm:text-xs text-zinc-400 font-mono">Reserved in 38 ms</p>
                    </div>
                  </div>
                </div>

                {/* 7. Floating Smartwatch (Right of Laptop) */}
                <div className="absolute top-28 sm:top-32 right-1 sm:right-4 z-20 w-24 sm:w-32 aspect-[3/4] flex flex-col items-center rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                  {/* Top Strap */}
                  <div className="w-14 sm:w-18 h-7 sm:h-8 rounded-t-xl bg-gradient-to-b from-zinc-950 to-zinc-900 border-t border-x border-zinc-800" />
                  {/* Watch Case */}
                  <div className="relative w-full aspect-square rounded-[24px] sm:rounded-[28px] p-2 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border border-zinc-600/60 shadow-[0_20px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.2)]">
                    <div className="relative size-full rounded-[18px] sm:rounded-[22px] bg-black flex items-center justify-center p-2 overflow-hidden border border-zinc-900">
                      {/* Activity Rings */}
                      <svg viewBox="0 0 80 80" className="absolute inset-0 size-full">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="140 50" strokeLinecap="round" className="drop-shadow-[0_0_8px_#10b981]" />
                        <circle cx="40" cy="40" r="23" fill="none" stroke="#06b6d4" strokeWidth="5" strokeDasharray="100 50" strokeLinecap="round" className="drop-shadow-[0_0_6px_#06b6d4]" />
                        <circle cx="40" cy="40" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="70 40" strokeLinecap="round" className="drop-shadow-[0_0_5px_#f59e0b]" />
                      </svg>
                      {/* Digital Time */}
                      <span className="relative z-10 text-xs sm:text-sm font-black text-white font-mono tracking-tight">9:41</span>
                    </div>
                  </div>
                  {/* Bottom Strap */}
                  <div className="w-14 sm:w-18 h-9 sm:h-10 rounded-b-xl bg-gradient-to-t from-zinc-950 to-zinc-900 border-b border-x border-zinc-800" />
                </div>

                {/* 8. Floating Product Spec Spotlight Card (Bottom Right) */}
                <div className="absolute -bottom-4 sm:-bottom-8 right-0 sm:right-2 z-30 rounded-2xl border border-zinc-800/90 bg-zinc-950/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl w-60 sm:w-68 transition-transform duration-300 hover:scale-105">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Mac Studio M4 Max</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Workstation, 36 GB, 1 TB</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      <span>In stock, 12 left</span>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <p className="text-sm sm:text-base font-extrabold text-white">ETB 75,000</p>
                    <button
                      onClick={() => {
                        const prod = products.find((p) => p.id === 'prod-macbook-pro-m4') || products[1] || products[0]
                        if (prod) handleAction(prod)
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3 py-1.5 text-xs shadow-md active:scale-95 transition"
                    >
                      <ShoppingBag className="size-3.5" />
                      <span>Add to cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Bottom Horizontal Value Props Bar (Matches Screenshot 4 Items)           */}
        {/* ========================================================================= */}
        {/* Bottom Horizontal Value Props Bar (Matches Screenshot 4 Items)           */}
        {/* ========================================================================= */}
        <div className="mt-16 sm:mt-20 w-full border-t border-zinc-200/90 dark:border-zinc-800/80 pt-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <Truck className="size-4 sm:size-4.5" />
              </div>
              <span>Fast express delivery</span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="size-4 sm:size-4.5" />
              </div>
              <span>2-year warranty</span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <RotateCcw className="size-4 sm:size-4.5" />
              </div>
              <span>30-day returns</span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="size-4 sm:size-4.5" />
              </div>
              <span>Verified genuine</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Curated Hardware Catalog Section                                          */}
      {/* ========================================================================= */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-t border-zinc-200/90 dark:border-zinc-800/80 pt-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Curated Selection
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Trending Hardware & Essentials
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Explore the latest in personal electronics, high-fidelity sound, and professional performance.
            </p>
          </div>

          <button
            onClick={currentUser ? onNavigateToShop : onNavigateToLogin}
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
          >
            {currentUser ? 'View all devices' : 'Sign in to view catalog'} <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Expansive Responsive Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {bestSellers.map((p) => {
            const isOutOfStock = p.stockQuantity === 0
            const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 4

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white dark:border-zinc-800/90 dark:bg-zinc-900/60 p-4 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl dark:shadow-xl dark:hover:shadow-emerald-950/30"
              >
                <div>
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {p.badge && (
                      <span className="absolute top-3 left-3 rounded-full bg-zinc-950/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur border border-zinc-800">
                        {p.badge}
                      </span>
                    )}

                    {/* Stock status badge */}
                    <span
                      className={`absolute bottom-3 right-3 rounded-md px-2 py-0.5 text-[10px] font-semibold backdrop-blur border ${
                        isOutOfStock
                          ? 'border-red-900/40 bg-red-950/80 text-red-300'
                          : isLowStock
                          ? 'border-amber-900/40 bg-amber-950/80 text-amber-300'
                          : 'border-zinc-300 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${p.stockQuantity} left` : 'In Stock'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {p.category}
                      </span>
                      {p.rating && (
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <Star className="size-3 text-amber-400 fill-amber-400" /> {p.rating}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition text-sm">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    {formatMoney(p.price)}
                  </span>
                  <button
                    onClick={() => handleAction(p)}
                    disabled={isOutOfStock}
                    className={`flex size-9 items-center justify-center rounded-xl shadow transition ${
                      isOutOfStock
                        ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800'
                        : 'bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-zinc-950 border border-zinc-800 dark:border-zinc-700/80'
                    }`}
                    aria-label={`Add ${p.name} to bag`}
                  >
                    <ShoppingBag className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Brand Philosophy Editorial Banner                                         */}
      {/* ========================================================================= */}
      <section className="w-full border-t border-zinc-200/90 bg-zinc-50/80 dark:border-zinc-800/80 dark:bg-zinc-950/60 py-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              The Aurora Standard
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl leading-tight">
              Good technology should feel effortless.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Every device in our collection is handpicked, rigorously tested, and backed by a dedicated team that
              cares about craftsmanship, battery longevity, and seamless everyday interaction.
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                Verified authentic hardware
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                Zero refurbished compromises
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                Guaranteed stock reservation
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
