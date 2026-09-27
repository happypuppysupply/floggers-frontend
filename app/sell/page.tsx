'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, DollarSign, Users, Shield, Zap, Globe, TrendingUp } from 'lucide-react'

const benefits = [
  { icon: Users, title: 'Built-in Audience', desc: 'Access thousands of buyers actively seeking quality BDSM gear' },
  { icon: Shield, title: 'Verified Community', desc: 'Join a vetted marketplace of trusted artisans and informed buyers' },
  { icon: DollarSign, title: 'Lower Fees', desc: 'Keep more of what you earn compared to general marketplaces' },
  { icon: Zap, title: 'Quick Setup', desc: 'Launch your shop in minutes with our streamlined onboarding' },
  { icon: Globe, title: 'Discreet Shipping', desc: 'Built-in tools for private, professional fulfillment' },
  { icon: TrendingUp, title: 'Growth Tools', desc: 'Analytics, marketing insights, and seller education resources' },
]

const features = [
  { title: 'Multi-Channel Sales', desc: 'Sync with Etsy and Shopify while managing everything from one dashboard' },
  { title: 'Import Your Store', desc: 'One-click import from existing platforms — no manual re-listing' },
  { title: 'Seller Protection', desc: 'Dispute resolution and secure payment processing' },
  { title: 'Community Support', desc: 'Connect with fellow makers and share best practices' },
]

const testimonials = [
  { quote: 'Floggers helped me quit my day job. The audience here actually understands and values craftsmanship.', author: 'Raven', shop: 'Black Raven Leather', metric: '$8,200/month' },
  { quote: 'Finally, a platform that treats our work with respect. No more explaining what a flogger is to confused buyers.', author: 'Mistress V', shop: 'Velvet Noose Ropeworks', metric: '500+ sales' },
  { quote: 'The import tool saved me weeks of work. I was selling on Floggers the same day I applied.', author: 'Iron Heart', shop: 'Iron Heart Forge', metric: 'Top 10 Maker' },
]

const pricing = [
  { label: 'Free to Join', value: '$0', desc: 'No monthly fees, no setup costs' },
  { label: 'Transaction Fee', value: '8%', desc: 'Only pay when you make a sale' },
  { label: 'Payout', value: 'Weekly', desc: 'Direct deposit to your bank' },
]

export default function SellPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-dark/20 via-noir-950 to-noir-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-muted mb-6">For Makers</p>
            <h1 className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-noir-50 leading-[1.1] mb-6">
              Why Sell on<br />Floggers.com
            </h1>
            <p className="text-noir-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
              The marketplace built specifically for BDSM artisans. 
              Reach buyers who appreciate craft, quality, and discretion.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/maker/signup" className="btn-primary inline-flex items-center gap-2">
                Apply to Sell <ArrowRight size={18} />
              </Link>
              <Link href="#features" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-noir-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif italic text-3xl text-noir-50 mb-4">Built for Your Craft</h2>
            <p className="text-noir-400">Everything you need to grow your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="card-glass p-6 hover:bg-noir-800/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-rose-dark/20 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-rose" />
                  </div>
                  <h3 className="font-medium text-noir-100 mb-2">{b.title}</h3>
                  <p className="text-sm text-noir-400">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif italic text-3xl text-noir-50 mb-6">Powerful Tools for Makers</h2>
              <div className="space-y-6">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-rose-dark/20 flex items-center justify-center shrink-0">
                      <CheckCircle size={16} className="text-rose" />
                    </div>
                    <div>
                      <h3 className="font-medium text-noir-100 mb-1">{f.title}</h3>
                      <p className="text-sm text-noir-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-glass p-8">
              <h3 className="font-medium text-noir-100 mb-6">Simple Pricing</h3>
              <div className="space-y-4">
                {pricing.map((p) => (
                  <div key={p.label} className="flex items-center justify-between p-4 rounded-lg bg-noir-900/50">
                    <div>
                      <p className="text-sm text-noir-400">{p.label}</p>
                      <p className="text-xs text-noir-500">{p.desc}</p>
                    </div>
                    <p className="text-2xl font-medium text-noir-50">{p.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-noir-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif italic text-3xl text-noir-50 mb-4">Maker Stories</h2>
            <p className="text-noir-400">Join hundreds of successful artisans</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="card-glass p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className="text-rose text-sm">★</span>
                  ))}
                </div>
                <p className="text-noir-300 mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-noir-100">{t.author}</p>
                    <p className="text-xs text-noir-400">{t.shop}</p>
                  </div>
                  <span className="text-xs bg-rose-dark/20 text-rose px-2 py-1 rounded">{t.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-noir-900 to-noir-950 border border-noir-800/50 p-12 md:p-16 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-dark/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="relative font-serif italic text-3xl md:text-4xl text-noir-50 mb-4">
              Ready to grow your craft?
            </h2>
            <p className="relative text-noir-300 mb-8 max-w-md mx-auto">
              Apply now and join the leading marketplace for BDSM artisans.
            </p>
            <div className="relative flex flex-wrap justify-center gap-4">
              <Link href="/maker/signup" className="btn-primary inline-flex items-center gap-2">
                Apply to Sell <ArrowRight size={18} />
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                Preview Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
