import Link from 'next/link'
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Age Verification — Floggers',
  description: 'Our commitment to a safe, age-verified marketplace.',
}

export default function AgeVerificationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={32} className="text-rose" />
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl text-noir-50 mb-4">
          Age-Verified Marketplace
        </h1>
        <p className="text-lg text-noir-300 max-w-2xl mx-auto">
          Floggers is strictly an adults-only marketplace. Every visitor is required to affirm their age before browsing, and we actively enforce this policy.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <Lock size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Mandatory Age Gate</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            Every visitor must confirm they are 18+ before accessing the site. This gate cannot be bypassed and stores consent locally.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">18+ Labels on All Content</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            Products are clearly marked as adult content. We use persistent visual warnings to ensure underage users are deterred from entering.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <ShieldCheck size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Parental Controls</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            We provide easy-to-follow guidance for blocking access to our site using parental control tools and DNS filters.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card-glass p-8 md:p-12 mb-16">
        <h2 className="font-serif italic text-2xl text-noir-50 mb-8 text-center">How Our Age Verification Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl font-serif italic text-rose/30 mb-4">01</div>
            <h4 className="text-lg font-medium text-noir-200 mb-2">First Visit</h4>
            <p className="text-sm text-noir-400">A full-screen age gate appears. No browsing is possible until affirmative confirmation is given.</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-serif italic text-rose/30 mb-4">02</div>
            <h4 className="text-lg font-medium text-noir-200 mb-2">Consent Stored</h4>
            <p className="text-sm text-noir-400">Once confirmed, consent is stored securely in the browser. The gate won't appear again on that device.</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-serif italic text-rose/30 mb-4">03</div>
            <h4 className="text-lg font-medium text-noir-200 mb-2">Ongoing Enforcement</h4>
            <p className="text-sm text-noir-400">At checkout and account creation, we re-verify age. Any violation results in immediate account termination.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/" className="btn-primary">
          Return to Floggers
        </Link>
      </div>
    </div>
  )
}
