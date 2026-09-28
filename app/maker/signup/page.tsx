'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'

export default function MakerSignupPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    shopName: '',
    location: '',
    website: '',
    instagram: '',
    description: '',
    makerName: '',
    makerEmail: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      // Redirect to seller dashboard after short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glass p-8">
            <CheckCircle size={64} className="text-rose mx-auto mb-6" />
            <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Application Received</h1>
            <p className="text-noir-300 mb-2">Thank you for applying to sell on Floggers!</p>
            <p className="text-sm text-noir-400 mb-6">We'll review your application and get back to you within 2-3 business days.</p>
            <p className="text-xs text-noir-500">Redirecting to your seller dashboard...</p>
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
                  <label className="block text-sm text-noir-300 mb-1">Shop Name</label>
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
                  <label className="block text-sm text-noir-300 mb-1">Location</label>
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
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-4">
                  Continue <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-4">Tell Us About Your Craft</h2>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">What do you make?</label>
                  <select required className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50">
                    <option value="">Select a category</option>
                    <option value="leather">Leather goods</option>
                    <option value="metal">Metalwork / Restraints</option>
                    <option value="rope">Rope / Shibari</option>
                    <option value="apparel">Apparel</option>
                    <option value="impact">Impact toys</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Shop Description</label>
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
                  <label className="block text-sm text-noir-300 mb-1">Your Name</label>
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
                  <label className="block text-sm text-noir-300 mb-1">Email</label>
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
                    I confirm that I am 18+ and all products I sell comply with Floggers' content guidelines
                  </label>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Submitting...' : 'Submit Application'}
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
