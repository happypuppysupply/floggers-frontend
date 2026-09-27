'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

function OAuthButtons() {
  const handleOAuth = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleOAuth}
        className="w-full flex items-center justify-center gap-3 bg-noir-950 border border-noir-700 hover:border-noir-600 rounded-lg px-4 py-2.5 text-sm text-noir-200 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#4285F4"/><path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#EA4335"/><path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.365 16.192 44 24 44z" fill="#34A853"/><path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C39.17 36.167 44 30.34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#FBBC05"/></svg>
        Continue with Google
      </button>
      <button
        onClick={handleOAuth}
        className="w-full flex items-center justify-center gap-3 bg-noir-950 border border-noir-700 hover:border-noir-600 rounded-lg px-4 py-2.5 text-sm text-noir-200 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#fff"/></svg>
        Continue with Apple
      </button>
      <button
        onClick={handleOAuth}
        className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] rounded-lg px-4 py-2.5 text-sm text-white transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Continue with Facebook
      </button>
      <button
        onClick={handleOAuth}
        className="w-full flex items-center justify-center gap-3 bg-rose-dark hover:bg-rose rounded-lg px-4 py-2.5 text-sm text-noir-50 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Continue with Phone
      </button>
    </div>
  )
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return
    if (!agreed) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/dashboard'
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>

        <div className="card-glass p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Create an account</h1>
            <p className="text-sm text-noir-400">Join the Floggers community</p>
          </div>

          <OAuthButtons />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-noir-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-noir-900 px-3 text-noir-500">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-noir-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                placeholder="Jane Doe"
              />
            </div>

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
              <p className="text-xs text-noir-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm text-noir-300 mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="age" required className="mt-0.5 rounded border-noir-700 bg-noir-950" />
              <label htmlFor="age" className="text-xs text-noir-400">I confirm that I am 18 years or older</label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 rounded border-noir-700 bg-noir-950" />
              <label htmlFor="terms" className="text-xs text-noir-400">
                I agree to the <Link href="#" className="text-rose hover:underline">Terms of Service</Link> and <Link href="#" className="text-rose hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={loading || !agreed} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-noir-400">Already have an account? <Link href="/login" className="text-rose hover:text-rose-light transition-colors">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
