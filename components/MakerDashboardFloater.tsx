'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X, LayoutDashboard, ChevronRight, DollarSign, Package, TrendingUp, Star, Megaphone,
  Store, ShoppingBag, Heart, MessageCircle, ClipboardList
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

/**
 * Floating pill for ALL logged-in users.
 *
 * On public pages:
 *   - Makers → violet "Maker Dashboard" (stats + quick links)
 *   - Non-makers → rose "Buyer Marketplace" (cart/fav/chat + "Start Selling" CTA)
 *
 * In dashboard:
 *   - Everyone → rose "Buyer Marketplace" (browse/fav/chat, back to store)
 *
 * Maker registration is separate — handled via /dashboard onboarding /maker/signup.
 */
export default function MakerDashboardFloater() {
  const { user, loading: authLoading } = useAuth()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  // Maker state
  const [isMaker, setIsMaker] = useState(false)
  const [makerName, setMakerName] = useState('')
  const [makerStats, setMakerStats] = useState({ products: 0, orders: 0, earnings: 0, rating: 0 })

  // Buyer state
  const [cartCount, setCartCount] = useState(0)
  const [favCount, setFavCount] = useState(0)

  const isInDashboard = pathname?.startsWith('/dashboard')

  // Load data
  useEffect(() => {
    if (authLoading || !user) return

    const load = async () => {
      const supabase = createClient()

      // Cart + favorites (always needed)
      const [{ count: cartC }, { count: favC }] = await Promise.all([
        supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setCartCount(cartC || 0)
      setFavCount(favC || 0)

      if (!isInDashboard) {
        // On public pages: check if user is a maker
        const { data: maker } = await supabase
          .from('makers')
          .select('id, name')
          .eq('profile_id', user.id)
          .maybeSingle()

        if (maker) {
          setIsMaker(true)
          setMakerName(maker.name)

          const [{ count: productCount }, { data: orders }, { data: makerData }] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('maker_id', maker.id),
            supabase.from('order_items').select('price, quantity').eq('maker_id', maker.id),
            supabase.from('makers').select('rating').eq('id', maker.id).single(),
          ])

          const earnings = orders?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
          setMakerStats({
            products: productCount || 0,
            orders: orders?.length || 0,
            earnings,
            rating: makerData?.rating || 0,
          })
        } else {
          setIsMaker(false)
        }
      }
    }

    load()
  }, [user, authLoading, isInDashboard])

  if (!user) return null

  // ── INSIDE DASHBOARD ───────────────────────────────────────
  if (isInDashboard) {
    if (!expanded) {
      return (
        <button
          onClick={() => setExpanded(true)}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 bg-rose text-noir-950 rounded-full text-sm font-medium shadow-lg shadow-rose/30 hover:scale-105 transition-all"
        >
          <Store size={20} />
          <span>Buyer Marketplace</span>
        </button>
      )
    }

    return (
      <div className="fixed bottom-6 right-6 z-50 w-72">
        <div className="bg-noir-900/95 backdrop-blur-sm border border-rose/30 rounded-2xl shadow-2xl shadow-rose/20 overflow-hidden">
          <div className="bg-gradient-to-r from-rose to-rose-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-white" />
              <span className="font-medium text-white text-sm">Buyer Marketplace</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white p-1"><span className="text-xs">−</span></button>
              <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white p-1"><X size={16} /></button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <Link href="/cart" className="flex items-center justify-between p-3 rounded-xl bg-noir-800/50 hover:bg-noir-800 transition-colors">
              <div className="flex items-center gap-3"><ShoppingBag size={18} className="text-rose" /><span className="text-sm text-noir-200">Cart</span></div>
              {cartCount > 0 && <span className="px-2 py-0.5 bg-rose text-noir-950 text-xs font-bold rounded-full">{cartCount}</span>}
            </Link>
            <Link href="/favorites" className="flex items-center justify-between p-3 rounded-xl bg-noir-800/50 hover:bg-noir-800 transition-colors">
              <div className="flex items-center gap-3"><Heart size={18} className="text-rose" /><span className="text-sm text-noir-200">Favorites</span></div>
              {favCount > 0 && <span className="px-2 py-0.5 bg-rose text-noir-950 text-xs font-bold rounded-full">{favCount}</span>}
            </Link>
            <Link href="/dashboard/messages" className="flex items-center justify-between p-3 rounded-xl bg-noir-800/50 hover:bg-noir-800 transition-colors">
              <div className="flex items-center gap-3"><MessageCircle size={18} className="text-rose" /><span className="text-sm text-noir-200">Messages</span></div>
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 bg-rose text-noir-950 rounded-xl text-sm font-medium hover:bg-rose-light transition-colors">
              <Store size={16} />Browse Marketplace<ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── ON PUBLIC PAGES ────────────────────────────────────────
  if (isMaker) {
    // Maker → violet pill with stats
    if (!expanded) {
      return (
        <button
          onClick={() => setExpanded(true)}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 bg-violet text-white rounded-full text-sm font-medium shadow-lg shadow-violet/30 hover:scale-105 transition-all"
        >
          <LayoutDashboard size={20} />
          <span>Maker Dashboard</span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </button>
      )
    }

    return (
      <div className="fixed bottom-6 right-6 z-50 w-80">
        <div className="bg-noir-900/95 backdrop-blur-sm border border-violet/30 rounded-2xl shadow-2xl shadow-violet/20 overflow-hidden">
          <div className="bg-gradient-to-r from-violet to-violet-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={18} className="text-white" />
              <span className="font-medium text-white text-sm">{makerName || 'Maker Dashboard'}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white p-1"><span className="text-xs">−</span></button>
              <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white p-1"><X size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            <div className="bg-noir-800/50 rounded-lg p-2 text-center">
              <Package size={16} className="text-violet mx-auto mb-1" />
              <p className="text-lg font-bold text-noir-50">{makerStats.products}</p>
              <p className="text-[10px] text-noir-400">Products</p>
            </div>
            <div className="bg-noir-800/50 rounded-lg p-2 text-center">
              <DollarSign size={16} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-noir-50">${makerStats.earnings.toFixed(0)}</p>
              <p className="text-[10px] text-noir-400">Earnings</p>
            </div>
            <div className="bg-noir-800/50 rounded-lg p-2 text-center">
              <TrendingUp size={16} className="text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-noir-50">{makerStats.orders}</p>
              <p className="text-[10px] text-noir-400">Orders</p>
            </div>
            <div className="bg-noir-800/50 rounded-lg p-2 text-center">
              <Star size={16} className="text-rose mx-auto mb-1" />
              <p className="text-lg font-bold text-noir-50">{makerStats.rating.toFixed(1)}</p>
              <p className="text-[10px] text-noir-400">Rating</p>
            </div>
          </div>

          <div className="px-3 pb-3">
            <div className="bg-violet/10 border border-violet/20 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone size={14} className="text-violet" />
                <p className="text-xs font-medium text-violet-light">Seller Tip</p>
              </div>
              <p className="text-[11px] text-noir-300 leading-relaxed">
                Products with high-quality photos get 3x more views. Update your listings with detailed images.
              </p>
            </div>

            <div className="space-y-1.5 mb-3">
              <Link href="/dashboard/products" className="flex items-center gap-2 text-xs text-noir-300 hover:text-noir-100 py-1.5 px-2 rounded-lg hover:bg-noir-800/50 transition-colors">
                <Package size={14} className="text-violet" />Manage Products<ChevronRight size={12} className="ml-auto text-noir-500" />
              </Link>
              <Link href="/dashboard/orders" className="flex items-center gap-2 text-xs text-noir-300 hover:text-noir-100 py-1.5 px-2 rounded-lg hover:bg-noir-800/50 transition-colors">
                <TrendingUp size={14} className="text-emerald-400" />View Orders<ChevronRight size={12} className="ml-auto text-noir-500" />
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 text-xs text-noir-300 hover:text-noir-100 py-1.5 px-2 rounded-lg hover:bg-noir-800/50 transition-colors">
                <LayoutDashboard size={14} className="text-amber-400" />Full Dashboard<ChevronRight size={12} className="ml-auto text-noir-500" />
              </Link>
            </div>

            <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-2.5 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet-light transition-colors">
              Open Dashboard<ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Non-maker → rose Buyer Marketplace pill (with Start Selling CTA)
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 bg-rose text-noir-950 rounded-full text-sm font-medium shadow-lg shadow-rose/30 hover:scale-105 transition-all"
      >
        <Store size={20} />
        <span>Buyer Marketplace</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72">
      <div className="bg-noir-900/95 backdrop-blur-sm border border-rose/30 rounded-2xl shadow-2xl shadow-rose/20 overflow-hidden">
        <div className="bg-gradient-to-r from-rose to-rose-dark px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-white" />
            <span className="font-medium text-white text-sm">Buyer Marketplace</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white p-1"><span className="text-xs">−</span></button>
            <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white p-1"><X size={16} /></button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <Link href="/cart" className="flex items-center justify-between p-3 rounded-xl bg-noir-800/50 hover:bg-noir-800 transition-colors">
            <div className="flex items-center gap-3"><ShoppingBag size={18} className="text-rose" /><span className="text-sm text-noir-200">Cart</span></div>
            {cartCount > 0 && <span className="px-2 py-0.5 bg-rose text-noir-950 text-xs font-bold rounded-full">{cartCount}</span>}
          </Link>
          <Link href="/favorites" className="flex items-center justify-between p-3 rounded-xl bg-noir-800/50 hover:bg-noir-800 transition-colors">
            <div className="flex items-center gap-3"><Heart size={18} className="text-rose" /><span className="text-sm text-noir-200">Favorites</span></div>
            {favCount > 0 && <span className="px-2 py-0.5 bg-rose text-noir-950 text-xs font-bold rounded-full">{favCount}</span>}
          </Link>
          <Link href="/dashboard/messages" className="flex items-center justify-between p-3 rounded-xl bg-noir-800/50 hover:bg-noir-800 transition-colors">
            <div className="flex items-center gap-3"><MessageCircle size={18} className="text-rose" /><span className="text-sm text-noir-200">Messages</span></div>
          </Link>

          {/* Start Selling CTA for non-makers */}
          <div className="pt-2 border-t border-noir-800/50">
            <Link href="/maker/signup" className="flex items-center gap-2 p-3 rounded-xl bg-violet/10 border border-violet/20 hover:bg-violet/20 transition-colors">
              <ClipboardList size={18} className="text-violet" />
              <div>
                <p className="text-sm text-noir-200">Start Selling</p>
                <p className="text-[10px] text-noir-400">Apply to become a maker</p>
              </div>
              <ChevronRight size={14} className="ml-auto text-violet" />
            </Link>
          </div>

          <Link href="/" className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 bg-rose text-noir-950 rounded-xl text-sm font-medium hover:bg-rose-light transition-colors">
            <Store size={16} />Browse Marketplace<ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
