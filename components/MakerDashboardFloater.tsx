'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, LayoutDashboard, ChevronRight, DollarSign, Package, TrendingUp, Users, Star, Megaphone } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function MakerDashboardFloater() {
  const { user, loading: authLoading } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMaker, setIsMaker] = useState(false)
  const [makerName, setMakerName] = useState('')
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    earnings: 0,
    rating: 0
  })

  useEffect(() => {
    const checkMakerStatus = async () => {
      if (authLoading) return
      if (!user) {
        setIsVisible(false)
        return
      }

      const supabase = createClient()
      const { data: maker } = await supabase
        .from('makers')
        .select('id, name')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (maker) {
        setIsMaker(true)
        setMakerName(maker.name)
        setIsVisible(true)

        // Load quick stats
        const [{ count: productCount }, { data: orders }, { data: reviews }] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('maker_id', maker.id),
          supabase.from('order_items').select('price, quantity').eq('maker_id', maker.id),
          supabase.from('reviews').select('rating').eq('maker_id', maker.id)
        ])

        const earnings = orders?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
        const avgRating = reviews?.length 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0

        setStats({
          products: productCount || 0,
          orders: orders?.length || 0,
          earnings,
          rating: avgRating
        })
      } else {
        setIsMaker(false)
        setIsVisible(false)
      }
    }

    checkMakerStatus()
  }, [user, authLoading])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('floggers-dashboard-floater-dismissed', Date.now().toString())
  }

  // Don't render if not visible
  if (!isVisible || !isMaker) {
    return null
  }

  // Minimized / Compact View
  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="group bg-gradient-to-r from-violet to-violet-dark text-white px-5 py-3 rounded-full shadow-lg shadow-violet/30 hover:scale-105 hover:shadow-violet/50 transition-all duration-300 flex items-center gap-3"
        >
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm">Maker's Dashboard</span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </button>
      </div>
    )
  }

  // Expanded View with Marketing Info
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <div className="bg-noir-900/95 backdrop-blur-sm border border-violet/30 rounded-2xl shadow-2xl shadow-violet/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet to-violet-dark px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-white" />
            <span className="font-medium text-white text-sm">
              {makerName || 'Maker Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/70 hover:text-white p-1"
              title="Minimize"
            >
              <span className="text-xs">−</span>
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/70 hover:text-white p-1"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 p-3">
          <div className="bg-noir-800/50 rounded-lg p-2 text-center">
            <Package size={16} className="text-violet mx-auto mb-1" />
            <p className="text-lg font-bold text-noir-50">{stats.products}</p>
            <p className="text-[10px] text-noir-400">Products</p>
          </div>
          <div className="bg-noir-800/50 rounded-lg p-2 text-center">
            <DollarSign size={16} className="text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-noir-50">${stats.earnings.toFixed(0)}</p>
            <p className="text-[10px] text-noir-400">Earnings</p>
          </div>
          <div className="bg-noir-800/50 rounded-lg p-2 text-center">
            <TrendingUp size={16} className="text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-noir-50">{stats.orders}</p>
            <p className="text-[10px] text-noir-400">Orders</p>
          </div>
          <div className="bg-noir-800/50 rounded-lg p-2 text-center">
            <Star size={16} className="text-rose mx-auto mb-1" />
            <p className="text-lg font-bold text-noir-50">{stats.rating.toFixed(1)}</p>
            <p className="text-[10px] text-noir-400">Rating</p>
          </div>
        </div>

        {/* Marketing Tips */}
        <div className="px-3 pb-3">
          <div className="bg-violet/10 border border-violet/20 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone size={14} className="text-violet" />
              <p className="text-xs font-medium text-violet-light">Seller Tip</p>
            </div>
            <p className="text-[11px] text-noir-300 leading-relaxed">
              Products with high-quality photos get 3x more views. 
              Update your listings with detailed images.
            </p>
          </div>

          <div className="space-y-1.5 mb-3">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 text-xs text-noir-300 hover:text-noir-100 py-1.5 px-2 rounded-lg hover:bg-noir-800/50 transition-colors"
            >
              <Package size={14} className="text-violet" />
              Manage Products
              <ChevronRight size={12} className="ml-auto text-noir-500" />
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-2 text-xs text-noir-300 hover:text-noir-100 py-1.5 px-2 rounded-lg hover:bg-noir-800/50 transition-colors"
            >
              <TrendingUp size={14} className="text-emerald-400" />
              View Orders
              <ChevronRight size={12} className="ml-auto text-noir-500" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs text-noir-300 hover:text-noir-100 py-1.5 px-2 rounded-lg hover:bg-noir-800/50 transition-colors"
            >
              <LayoutDashboard size={14} className="text-amber-400" />
              Full Dashboard
              <ChevronRight size={12} className="ml-auto text-noir-500" />
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
          >
            Open Dashboard
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
