'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Mock login - redirect to dashboard
      window.location.href = '/dashboard'
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>

        <div className="card-glass p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Welcome back</h1>
            <p className="text-sm text-noir-400">Sign in to your Floggers account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-noir-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-noir-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-noir-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-noir-400">
                <input type="checkbox" className="rounded border-noir-700 bg-noir-950" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-rose hover:text-rose-light transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-noir-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-rose hover:text-rose-light transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-noir-800/50">
            <p className="text-xs text-noir-500 text-center mb-3">Are you a maker?</p>
            <Link href="/maker/signup" className="btn-secondary w-full text-center block text-sm">
              Apply to Sell on Floggers
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
