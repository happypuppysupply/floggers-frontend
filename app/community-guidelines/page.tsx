import Link from 'next/link'
import { Heart, Scale, MessageCircle, Ban } from 'lucide-react'

export const metadata = {
  title: 'Community Guidelines — Floggers',
  description: 'Our standards for a safe, respectful marketplace.',
}

export default function CommunityGuidelinesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center mx-auto mb-6">
          <Heart size={32} className="text-rose" />
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl text-noir-50 mb-4">
          Community Guidelines
        </h1>
        <p className="text-lg text-noir-300 max-w-2xl mx-auto">
          Floggers is built on trust, consent, and mutual respect. These guidelines exist to keep our community safe and our marketplace thriving.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <Scale size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Consent Is Everything</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            BDSM is built on informed, enthusiastic, and revocable consent. We expect this ethos in every interaction on our platform — between buyers, sellers, and community members.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <Ban size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Zero Tolerance for Harm</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            We do not allow content, products, or behavior that promotes non-consensual acts, minors, or illegal activity. Violations result in permanent banning and law enforcement notification where appropriate.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <MessageCircle size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Respect & Inclusion</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            Floggers welcomes all genders, orientations, roles, and experience levels. Discrimination, harassment, or gatekeeping of any kind is not tolerated.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <Scale size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Honest Representation</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            Makers must accurately describe materials, sizing, and safety considerations. Buyers must be honest in reviews and communications. Misrepresentation undermines trust.
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="card-glass p-8 md:p-12 mb-16">
        <h2 className="font-serif italic text-2xl text-noir-50 mb-8">What We Don't Allow</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Products designed for or involving minors in any capacity</p>
          </div>
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Non-consensual or revenge-related items or content</p>
          </div>
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Counterfeit goods or mass-produced items passed off as handmade</p>
          </div>
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Hate speech, threats, or harassment in any form</p>
          </div>
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Drugs, alcohol, or illegal substances in listings</p>
          </div>
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Spam, scams, or fraudulent transactions</p>
          </div>
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Doxxing or sharing private information without consent</p>
          </div>
          <div className="flex items-start gap-3">
            <Ban size={16} className="text-rose shrink-0 mt-1" />
            <p className="text-sm text-noir-300">Animal harm or products derived from non-ethical sources</p>
          </div>
        </div>
      </div>

      {/* Reporting */}
      <div className="card-glass p-8 mb-16">
        <h3 className="text-lg font-medium text-noir-50 mb-3">See Something Wrong?</h3>
        <p className="text-sm text-noir-400 mb-4">
          Every product listing and user profile has a report button. Our moderation team reviews reports within 24 hours. Serious violations are escalated immediately.
        </p>
        <p className="text-sm text-noir-400">
          You can also email us directly at <a href="mailto:safety@floggers.com" className="text-rose hover:underline">safety@floggers.com</a> for urgent concerns.
        </p>
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
