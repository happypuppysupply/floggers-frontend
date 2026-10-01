import Link from 'next/link'
import { ArrowRight, Shield, Truck, Lock, Users, Sparkles, Zap, Star, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import CategoryCard from '@/components/CategoryCard'
import BrandLogo from '@/components/BrandLogo'
import { getProducts, getMakers, getCategories } from '@/lib/data'

export default async function Home() {
  const [products, makers, categories] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getMakers({ featured: true, limit: 3 }),
    getCategories(),
  ])

  const floggerProducts = products.filter(p => p.category_id === 'floggers').slice(0, 4)

  return (
    <div>
      {/* Hero — Premium Design */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-dark/40 via-brand-dark to-brand-surface" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-magenta/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-violet-dark/30 border border-violet/30 rounded-full px-4 py-1.5 mb-8">
              <Sparkles size={14} className="text-violet-light" />
              <span className="text-xs text-violet-light font-medium">The Future of Kink Commerce</span>
            </div>
            
            <h1 className="font-serif italic text-5xl md:text-6xl lg:text-7xl text-noir-50 leading-[1.1] mb-6">
              Handcrafted
              <br />
              <span className="gradient-text">Desire.</span>
            </h1>
            
            <p className="text-noir-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              The world's most curated marketplace for artisan BDSM gear. 
              Connect directly with independent makers crafting floggers, 
              restraints, and accessories with uncompromising quality.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/category" className="btn-primary inline-flex items-center gap-2 text-base">
                Explore Collection <ArrowRight size={18} />
              </Link>
              <Link href="/maker/signup" className="btn-secondary inline-flex items-center gap-2 text-base">
                Become a Maker
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-noir-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
                  <Shield size={14} className="text-violet" />
                </div>
                <span className="text-xs text-noir-400">Verified Makers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
                  <Lock size={14} className="text-violet" />
                </div>
                <span className="text-xs text-noir-400">Discreet Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
                  <Zap size={14} className="text-violet" />
                </div>
                <span className="text-xs text-noir-400">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero image grid */}
        {/* Hero Product Showcase */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[80%]">
          <div className="relative h-full w-full max-w-2xl mx-auto flex items-center justify-center">
            <div className="relative w-96 h-96">
              {/* Main product image */}
              <img 
                src="/logo.png" 
                alt="Floggers" 
                className="w-full h-full object-contain drop-shadow-[0_0_60px_rgba(155,77,202,0.5)]"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-violet/20 rounded-full blur-[80px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {floggerProducts.length > 0 && (
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-3">Featured Floggers</h2>
                <p className="text-sm text-noir-400">Hand-selected pieces from our most skilled artisans</p>
              </div>
              <Link href="/category/floggers" className="group flex items-center gap-2 text-sm text-violet hover:text-violet-light transition-colors">
                View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {floggerProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-24 bg-noir-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-dark/5 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <h2 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-3">Shop by Category</h2>
              <p className="text-sm text-noir-400 max-w-md mx-auto">From impact play to restraint — find exactly what you're looking for</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Makers */}
      {makers.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-3">Featured Makers</h2>
                <p className="text-sm text-noir-400">Meet the artisans behind the gear</p>
              </div>
              <Link href="/makers" className="group flex items-center gap-2 text-sm text-violet hover:text-violet-light transition-colors">
                Explore All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {makers.map(maker => (
                <Link key={maker.id} href={`/maker/${maker.id}`} className="group card-glass p-6 hover:bg-noir-800/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-noir-700 bg-noir-800">
                      {maker.avatar_url ? (
                        <img src={maker.avatar_url} alt={maker.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet text-lg font-serif italic">
                          {maker.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-noir-100 group-hover:text-noir-50 transition-colors">{maker.name}</h3>
                      <p className="text-xs text-noir-400">{maker.location}</p>
                    </div>
                  </div>
                  <p className="text-sm text-noir-300 leading-relaxed mb-4 line-clamp-2">{maker.bio || maker.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    {maker.rating && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Star size={12} className="fill-amber-400" /> {maker.rating.toFixed(1)}
                      </span>
                    )}
                    {maker.verified && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Shield size={12} /> Verified
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-noir-900 to-brand-dark border border-noir-800/50 p-12 md:p-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet/20 rounded-full blur-[100px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-violet/20 border border-violet/30 rounded-full px-3 py-1 mb-6">
                <Users size={14} className="text-violet" />
                <span className="text-xs text-violet-light">Join 1,000+ makers</span>
              </div>
              <h2 className="font-serif italic text-3xl md:text-5xl text-noir-50 mb-4">
                Ready to turn your craft<br />into a business?
              </h2>
              <p className="text-noir-300 mb-8 max-w-md mx-auto">
                Join the world's most curated marketplace for artisan BDSM gear. 
                Zero listing fees. Discreet fulfillment tools. Built-in audience.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/maker/signup" className="btn-primary inline-flex items-center gap-2">
                  Apply to Sell <ArrowRight size={18} />
                </Link>
                <Link href="/category" className="btn-secondary">
                  Browse First
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
