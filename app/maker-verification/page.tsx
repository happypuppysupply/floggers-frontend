import Link from 'next/link'
import { BadgeCheck, ClipboardCheck, UserCheck, Award } from 'lucide-react'

export const metadata = {
  title: 'Maker Verification Program — Floggers',
  description: 'How we verify makers to ensure quality and authenticity.',
}

export default function MakerVerificationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center mx-auto mb-6">
          <BadgeCheck size={32} className="text-rose" />
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl text-noir-50 mb-4">
          Maker Verification Program
        </h1>
        <p className="text-lg text-noir-300 max-w-2xl mx-auto">
          Every maker on Floggers goes through a rigorous verification process. We do this to protect buyers and maintain the integrity of our marketplace.
        </p>
      </div>

      {/* Verification Badges */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card-glass p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-noir-800 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={28} className="text-noir-300" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">ID Verified</h3>
          <p className="text-sm text-noir-400">
            Makers submit government-issued ID to confirm identity and age. This information is handled securely and never shared.
          </p>
        </div>
        <div className="card-glass p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-rose/15 flex items-center justify-center mx-auto mb-4">
            <Award size={28} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Craft Verified</h3>
          <p className="text-sm text-noir-400">
            We review portfolios and work samples. Makers must demonstrate skill with their craft — whether leather, metal, rope, or latex.
          </p>
        </div>
        <div className="card-glass p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-noir-800 flex items-center justify-center mx-auto mb-4">
            <UserCheck size={28} className="text-noir-300" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Community Vouched</h3>
          <p className="text-sm text-noir-400">
            Existing verified makers and community members can vouch for new applicants. Social proof matters on Floggers.
          </p>
        </div>
      </div>

      {/* Process */}
      <div className="card-glass p-8 md:p-12 mb-16">
        <h2 className="font-serif italic text-2xl text-noir-50 mb-8 text-center">The Verification Process</h2>
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="flex gap-6">
            <div className="shrink-0 w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose font-medium">1</div>
            <div>
              <h4 className="text-lg font-medium text-noir-200 mb-1">Application Submission</h4>
              <p className="text-sm text-noir-400">Makers fill out a detailed application including their background, craft focus, and photos of their workshop or work samples.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="shrink-0 w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose font-medium">2</div>
            <div>
              <h4 className="text-lg font-medium text-noir-200 mb-1">Identity Verification</h4>
              <p className="text-sm text-noir-400">Government ID + selfie verification through our secure partner. This confirms the maker is who they say they are and is of legal age.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="shrink-0 w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose font-medium">3</div>
            <div>
              <h4 className="text-lg font-medium text-noir-200 mb-1">Portfolio Review</h4>
              <p className="text-sm text-noir-400">Our team reviews product photos, workmanship, and safety practices. We verify that products are handmade and meet quality standards.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="shrink-0 w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose font-medium">4</div>
            <div>
              <h4 className="text-lg font-medium text-noir-200 mb-1">Approval or Feedback</h4>
              <p className="text-sm text-noir-400">Approved makers receive a verified badge and can list products immediately. If more info is needed, we provide specific feedback.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="grid md:grid-cols-3 gap-6 mb-16 text-center">
        <div className="p-6">
          <div className="text-3xl font-serif italic text-rose mb-2">100%</div>
          <p className="text-sm text-noir-400">Of sellers are ID-verified adults</p>
        </div>
        <div className="p-6">
          <div className="text-3xl font-serif italic text-rose mb-2">48hrs</div>
          <p className="text-sm text-noir-400">Average review time for applications</p>
        </div>
        <div className="p-6">
          <div className="text-3xl font-serif italic text-rose mb-2">Zero</div>
          <p className="text-sm text-noir-400">Tolerance for counterfeit or mass-produced goods</p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/makers" className="btn-primary">
          Browse Verified Makers
        </Link>
        <Link href="/maker/signup" className="btn-secondary">
          Apply to Sell
        </Link>
      </div>
    </div>
  )
}
