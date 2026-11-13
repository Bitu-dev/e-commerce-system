'use client'

import React, { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  User,
  UserPlus,
} from 'lucide-react'
import { Role, UserProfile } from '@/lib/types'
import { ApiClient } from '@/lib/api-client'

interface LoginViewProps {
  currentUser: UserProfile | null
  onLogin: (user: UserProfile) => void
  onLogout: () => void
  onContinueToShop: () => void
}

export function LoginView({ currentUser, onLogin, onLogout, onContinueToShop }: LoginViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Sign-in fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Sign-up fields
  const [regFullName, setRegFullName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectedRole, setDetectedRole] = useState<Role | null>(null)

  // Auto-redirect if session is active so user never gets stuck on intermediate card
  React.useEffect(() => {
    if (currentUser) {
      onContinueToShop()
    }
  }, [currentUser, onContinueToShop])

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const userProfile = await ApiClient.login(username.trim(), password)
      setDetectedRole(userProfile.role)
      setIsLoading(false)
      onLogin(userProfile)
    } catch (err: any) {
      setIsLoading(false)
      setErrorMessage(err.message || 'Authentication failed. Please verify your username and password.')
    }
  }

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUsername = regUsername.trim().toLowerCase()
    if (!cleanUsername) {
      setErrorMessage('Please provide a valid username.')
      return
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.')
      return
    }

    setIsLoading(true)

    try {
      setSuccessMessage('Creating account in Keycloak...')
      const userProfile = await ApiClient.register({
        username: cleanUsername,
        password: regPassword,
        email: regEmail.trim() || undefined,
        fullName: regFullName.trim() || undefined,
      })

      setDetectedRole(userProfile.role)
      setSuccessMessage('Account created successfully! Signing in...')
      setIsLoading(false)
      onLogin(userProfile)
    } catch (err: any) {
      setIsLoading(false)
      setSuccessMessage('')
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.')
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] w-full items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-full max-w-4xl -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/10 via-zinc-500/5 to-amber-500/10 blur-[140px]" />

      <div className="w-full max-w-lg">
        {/* If already authenticated, display session details */}
        {currentUser ? (
          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-8 sm:p-10 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-center">
              <div
                className={`mx-auto flex size-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ${
                  currentUser.role === 'ADMIN' ? 'bg-amber-600' : 'bg-emerald-700'
                }`}
              >
                {currentUser.username[0].toUpperCase()}
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {currentUser.name}
              </h2>
              <p className="mt-1 text-xs font-mono text-zinc-500">{currentUser.email}</p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current animate-pulse" />
                  {currentUser.role === 'ADMIN' ? 'Store Administrator (Role: ADMIN)' : 'Verified Customer (Role: USER)'}
                </span>
              </div>

              <p className="mt-3 text-[11px] text-zinc-400">
                Authenticated via Keycloak OAuth2 with PKCE token
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={onContinueToShop}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-xs font-bold text-white shadow-xl transition hover:bg-zinc-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
              >
                <span>{currentUser.role === 'ADMIN' ? 'Access Admin Operations Portal' : 'Enter Store Catalog'}</span>
                <ArrowRight className="size-4" />
              </button>

              <button
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3.5 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-red-950/20"
              >
                <LogOut className="size-4" />
                <span>Sign Out & Clear Session</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication & Account Creation Card */
          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-8 sm:p-10 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="text-center">
              <img
                src="/brand/aurora-mark.svg"
                alt="Aurora"
                className="mx-auto size-14 rounded-2xl shadow-xl border border-zinc-800/80"
              />
              <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
              </h1>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {mode === 'signin'
                  ? 'Access your customer cart, order history, and store services'
                  : 'Register a personal customer account to start shopping'}
              </p>
            </div>

            {/* Segmented Mode Toggle */}
            <div className="mt-6 flex rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMessage('')
                  setSuccessMessage('')
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === 'signin'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMessage('')
                  setSuccessMessage('')
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === 'signup'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ======================================================= */}
            {/* MODE: SIGN IN FORM */}
            {/* ======================================================= */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Username
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <User className="size-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-xs text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                    <span className="text-[11px] text-zinc-400">Keycloak PKCE</span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <Lock className="size-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-10 text-xs text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-0 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <span>Remember this session</span>
                  </label>

                  <span className="text-[11px] text-zinc-400">OAuth2 Standard</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-xs font-bold text-white shadow-xl transition hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-70 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
                >
                  {isLoading ? (
                    <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                {/* Don't have an account switch prompt */}
                <div className="mt-5 text-center">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                      className="font-bold text-zinc-900 underline hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 transition"
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* ======================================================= */
              /* MODE: SIGN UP FORM */
              /* ======================================================= */
              <form onSubmit={handleSignUpSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <User className="size-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-xs text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Username
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <UserPlus className="size-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'))}
                      placeholder="e.g. alex.johnson"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-xs text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <Mail className="size-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-xs text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <Lock className="size-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-10 text-xs text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Confirm Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <Lock className="size-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-xs text-zinc-900 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-xs font-bold text-white shadow-xl transition hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-70 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
                >
                  {isLoading ? (
                    <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                  ) : (
                    <>
                      <span>Create Account & Start Shopping</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                {/* Already have an account switch prompt */}
                <div className="mt-5 text-center">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                      className="font-bold text-zinc-900 underline hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 transition"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            )}


          </div>
        )}
      </div>
    </div>
  )
}
