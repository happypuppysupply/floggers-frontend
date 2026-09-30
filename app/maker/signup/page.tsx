'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

// Generate slug from shop name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export default function MakerSignupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    shopName: '',
    location: '',
    website: '',
    instagram: '',
    category: '',
    description: '',
    makerName: '',
    makerEmail: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to apply. Please sign in first.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()

    // Check if user already has a pending or approved application
    const { data: existingApp } = await supabase
      .from('maker_applications')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (existingApp) {
      if (existingApp.status === 'approved') {
        setError('You are already a registered seller! Redirecting to dashboard...')
        setTimeout(() => router.push('/dashboard'), 2000)
        setLoading(false)
        return
      } else {
        setError('You already have a pending application. Please wait for approval.')
        setLoading(false)
        return
      }
    }

    // Create application
    const { error: insertError } = await supabase
      .from('maker_applications')
      .insert({
        user_id: user.id,
        shop_name: form.shopName,
        slug: generateSlug(form.shopName),
        location: form.location,
        website: form.website || null,
        instagram: form.instagram || null,
        category: form.category,
        description: form.description,
        applicant_name: form.makerName,
        applicant_email: form.makerEmail,
        status: 'pending'
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glass p-8">
            <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Sign In Required</h1>
            <p className="text-noir-300 mb-6">You need to be logged in to apply as a seller.</p>
            <Link href="/login?redirect=/maker/signup" className="btn-primary">
              Sign In to Apply
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glass p-8">
            <CheckCircle size={64} className="text-emerald-400 mx-auto mb-6" />
            <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Application Received!</h1>
            <p className="text-noir-300 mb-2">Thank you for applying to sell on Floggers.</p>
            <p className="text-sm text-noir-400 mb-6">
              We&apos;ll review your application and email you at {form.makerEmail} within 2-3 business days.
            </p>
            <Link href="/" className="btn-primary">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>

        <div className="card-glass p-8">
          <div className="mb-8">
            <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Apply to Sell on Floggers</h1>
            <p className="text-sm text-noir-400">Join our community of independent BDSM artisans</p>
          </div>

          {error && (
            <div className="bg-rose/20 border border-rose/30 text-rose-light px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-rose' : 'bg-noir-800'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-rose' : 'bg-noir-800'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 3 ? 'bg-rose' : 'bg-noir-800'}`} />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-4">About Your Shop</h2>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={form.shopName}
                    onChange={e => setForm({ ...form, shopName: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="e.g., Black Raven Leather"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="e.g., Portland, OR"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Website (optional)</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Instagram (optional)</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={e => setForm({ ...form, instagram: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="@yourhandle"
                  />
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-4">
                  Continue <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-4">Tell Us About Your Craft</h2>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Primary Category *</label>
                  <select 
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  >
                    <option value="">Select a category</option>
                    <option value="floggers">Floggers</option>
                    <option value="paddles">Paddles</option>
                    <option value="crops-canes">Crops & Canes</option>
                    <option value="restraints">Restraints & Cuffs</option>
                    <option value="collars">Collars & Leashes</option>
                    <option value="apparel">Apparel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Shop Description *</label>
                  <textarea
                    required
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="Tell us about your craft, materials, and process..."
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-4">Your Information</h2>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.makerName}
                    onChange={e => setForm({ ...form, makerName: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.makerEmail}
                    onChange={e => setForm({ ...form, makerEmail: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex items-start gap-3 mt-4">
                  <input type="checkbox" id="verify" required className="mt-0.5 rounded border-noir-700 bg-noir-950" />
                  <label htmlFor="verify" className="text-xs text-noir-400">
                    I confirm that I am 18+ and all products I sell comply with Floggers&apos; content guidelines
                  </label>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
