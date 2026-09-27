'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Truck, Lock, Users } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import CategoryCard from '@/components/CategoryCard'
import { products, categories, makers } from '@/lib/mockData'

export default function Home() {
  const featuredProducts = products.filter(p => p.badge || p.rating >= 4.8).slice(0, 6)
  const featuredMakers = makers.filter(m => m.featured).slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-rose-dark/20 via-noir-950 to-noir-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-muted mb-6">Discover Independent Makers</p>
            <h1 className="font-serif italic text-5xl md:text-6xl lg:text-7xl text-noir-50 leading-[1.1] mb-6">
              Crafted for<br />the lifestyle.
            </h1>
            <p className="text-noir-300 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              Floggers is the marketplace where independent BDSM artisans connect with people who value quality, discretion, and craft.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/category" className="btn-primary inline-flex items-center gap-2">
                Browse the Marketplace <ArrowRight size={18} />
              </Link>
              <Link href="/makers" className="btn-secondary inline-flex items-center gap-2">
                Meet the Makers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-noir-800/50 bg-noir-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: 'Verified Makers', desc: 'Identity & craft verified' },
              { icon: Truck, label: 'Discreet Shipping', desc: 'Plain packaging always' },
              { icon: Lock, label: 'Secure Payments', desc: 'Encrypted transactions' },
              { icon: Users, label: 'Community Driven', desc: 'Reviews you can trust' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <item.icon size={24} className="text-rose shrink-0" />
                <div>
                  <p className="text-sm font-medium text-noir-200">{item.label}</p>
                  <p className="text-xs text-noir-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif italic text-3xl text-noir-50">Shop by Category</h2>
            <Link href="/category" className="text-sm text-rose hover:text-rose-light transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} large={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-noir-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif italic text-3xl text-noir-50 mb-2">Featured Products</h2>
              <p className="text-sm text-noir-400">Hand-picked by our community</p>
            </div>
            <Link href="/category" className="text-sm text-rose hover:text-rose-light transition-colors flex items-center gap-1">
              Browse All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Makers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif italic text-3xl text-noir-50 mb-2">Featured Makers</h2>
              <p className="text-sm text-noir-400">The artisans behind the gear</p>
            </div>
            <Link href="/makers" className="text-sm text-rose hover:text-rose-light transition-colors flex items-center gap-1">
              Explore All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMakers.map(maker => (
              <Link key={maker.id} href={`/maker/${maker.id}`} className="group card-glass p-6 hover:bg-noir-800/50 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <img src={maker.image} alt={maker.name} className="w-14 h-14 rounded-full object-cover border border-noir-700" />
                  <div>
                    <h3 className="font-medium text-noir-100 group-hover:text-noir-50 transition-colors">{maker.name}</h3>
                    <p className="text-xs text-noir-400">{maker.location}</p>
                  </div>
                </div>
                <p className="text-sm text-noir-300 leading-relaxed mb-4">{maker.tagline}</p>
                <div className="flex items-center gap-4 text-xs text-noir-400">
                  <span>{maker.products} products</span>
                  <span>★ {maker.rating}</span>
                </div>
              </Link>
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
              Ready to discover your next piece?
            </h2>
            <p className="relative text-noir-300 mb-8 max-w-md mx-auto">
              Explore hundreds of handcrafted products from verified independent makers in the community.
            </p>
            <Link href="/category" className="relative btn-primary inline-flex items-center gap-2">
              Start Browsing <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
