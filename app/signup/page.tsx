'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    accountType: 'buyer' as 'buyer' | 'maker'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: form.accountType,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role: form.accountType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // If maker, create maker application
      if (form.accountType === 'maker') {
        const { error: makerError } = await supabase.from('maker_applications').insert({
          user_id: data.user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        if (makerError) {
          console.error('Maker application error:', makerError)
        }
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          role: form.accountType,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glass p-8">
            <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Check Your Email</h1>
            <p className="text-noir-300 mb-6">
              We&apos;ve sent a confirmation link to {form.email}. Click the link to verify your account.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
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

          {error && (
            <div className="bg-rose/20 border border-rose/30 text-rose-light px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Account Type Selection */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setForm({ ...form, accountType: 'buyer' })}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                form.accountType === 'buyer'
                  ? 'bg-rose-dark text-noir-50'
                  : 'bg-noir-950 border border-noir-700 text-noir-400 hover:border-noir-600'
              }`}
            >
              I&apos;m a Buyer
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, accountType: 'maker' })}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                form.accountType === 'maker'
                  ? 'bg-rose-dark text-noir-50'
                  : 'bg-noir-950 border border-noir-700 text-noir-400 hover:border-noir-600'
              }`}
            >
              I&apos;m a Maker
            </button>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-noir-950 border border-noir-700 hover:border-noir-600 rounded-lg px-4 py-2.5 text-sm text-noir-200 transition-colors mb-3 disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#4285F4"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#EA4335"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.365 16.192 44 24 44z" fill="#34A853"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C39.17 36.167 44 30.34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#FBBC05"/>
            </svg>
            Continue with Google
          </button>

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
                  minLength={6}
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
              <p className="text-xs text-noir-500 mt-1">At least 6 characters</p>
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
              <input type="checkbox" id="terms" required className="mt-0.5 rounded border-noir-700 bg-noir-950" />
              <label htmlFor="terms" className="text-xs text-noir-400">
                I agree to the <Link href="#" className="text-rose hover:underline">Terms of Service</Link> and <Link href="#" className="text-rose hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : `Sign Up as ${form.accountType === 'buyer' ? 'Buyer' : 'Maker'}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-noir-400">
              Already have an account?{' '}
              <Link href="/login" className="text-rose hover:text-rose-light transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
