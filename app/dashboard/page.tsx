'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getDashboardStats } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users, ArrowUpRight, CheckCircle, Circle, Loader2 } from 'lucide-react'

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  productCount: number;
  customerCount: number;
}

interface OnboardingProgress {
  profile_complete: boolean;
  has_products: boolean;
  shipping_setup: boolean;
  shop_shared: boolean;
  progress_percent: number;
}

export default function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    productCount: 0,
    customerCount: 0
  })
  const [onboarding, setOnboarding] = useState<OnboardingProgress>({
    profile_complete: false,
    has_products: false,
    shipping_setup: false,
    shop_shared: false,
    progress_percent: 0
  })
  const [loading, setLoading] = useState(true)
  const [makerInfo, setMakerInfo] = useState<{ id: string; name: string; location?: string; is_verified: boolean; is_live: boolean } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      const supabase = createClient()
      
      // Get maker profile
      const { data: maker } = await supabase
        .from('makers')
        .select('id, name, location, is_verified, is_live')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (maker) {
        setMakerInfo({ ...maker, is_live: maker.is_live ?? false })
        const stats = await getDashboardStats(maker.id)
        setStats(stats)
        
        // Get onboarding progress
        const { data: progress } = await supabase
          .rpc('get_maker_onboarding_progress', { p_profile_id: user.id })
        
        if (progress) {
          setOnboarding(progress)
        }
      }

      setLoading(false)
    }

    loadData()
  }, [user])

  const statCards = [
    { 
      label: 'Total Sales', 
      value: `$${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign,
      change: '+12.5%',
      up: true
    },
    { 
      label: 'Orders', 
      value: stats.totalOrders.toString(), 
      icon: ShoppingBag,
      change: '+8.2%',
      up: true
    },
    { 
      label: 'Products', 
      value: stats.productCount.toString(), 
      icon: Package,
      change: '+' + stats.productCount,
      up: true
    },
    { 
      label: 'Customers', 
      value: stats.customerCount.toString(), 
      icon: Users,
      change: '+15.3%',
      up: true
    },
  ]

  const gettingStartedSteps = [
    { 
      step: 1, 
      label: 'Complete your shop profile', 
      href: '/dashboard/settings', 
      done: onboarding.profile_complete,
      description: 'Add your shop name, bio, and logo'
    },
    { 
      step: 2, 
      label: 'Add your first product', 
      href: '/dashboard/products/new', 
      done: onboarding.has_products,
      description: 'List your first item for sale'
    },
    { 
      step: 3, 
      label: 'Set up shipping details', 
      href: '/dashboard/settings', 
      done: onboarding.shipping_setup,
      description: 'Add your location and shipping preferences'
    },
    { 
      step: 4, 
      label: 'Share your shop link', 
      href: makerInfo ? `/maker/${makerInfo.id}` : '/', 
      done: onboarding.shop_shared,
      description: 'Start promoting your shop',
      external: true
    },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-rose animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Dashboard Overview</h1>
          <p className="text-sm text-noir-400">
            {makerInfo?.name ? `Welcome back, ${makerInfo.name}` : 'Welcome to your shop dashboard'}
          </p>
        </div>
        
        {/* Live / Sandbox Toggle */}
        {makerInfo && (
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs font-medium ${!makerInfo.is_live ? 'text-emerald-400' : 'text-noir-500'}`}>
              Sandbox
            </span>
            <button
              onClick={async () => {
                if (!makerInfo.is_verified) return
                const supabase = createClient()
                const newState = !makerInfo.is_live
                await supabase.from('makers').update({ is_live: newState }).eq('id', makerInfo.id)
                setMakerInfo({ ...makerInfo, is_live: newState })
              }}
              disabled={!makerInfo.is_verified}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                makerInfo.is_live ? 'bg-emerald-500' : 'bg-noir-700'
              } ${!makerInfo.is_verified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={!makerInfo.is_verified ? 'Go live unavailable until approved' : 'Toggle live/sandbox mode'}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-noir-50 transition-transform ${
                makerInfo.is_live ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-xs font-medium ${makerInfo.is_live ? 'text-emerald-400' : 'text-noir-500'}`}>
              Live
            </span>
            {!makerInfo.is_verified && (
              <span className="text-[10px] text-amber-400">(locked until approved)</span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card-glass p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className="text-rose-muted" />
                <span className={`text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-rose'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-medium text-noir-50">
                {stat.value}
              </p>
              <p className="text-xs text-noir-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card-glass p-6">
          <h2 className="text-lg font-medium text-noir-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/products/new" className="p-4 rounded-xl bg-noir-900/50 hover:bg-noir-800/50 transition-colors text-center group">
              <Package size={24} className="text-rose mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-noir-200">Add Product</p>
              <p className="text-xs text-noir-400">Create new listing</p>
            </Link>
            <Link href="/dashboard/orders" className="p-4 rounded-xl bg-noir-900/50 hover:bg-noir-800/50 transition-colors text-center group">
              <ShoppingBag size={24} className="text-rose mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-noir-200">View Orders</p>
              <p className="text-xs text-noir-400">{stats.totalOrders} total</p>
            </Link>
            <Link href="/dashboard/products" className="p-4 rounded-xl bg-noir-900/50 hover:bg-noir-800/50 transition-colors text-center group">
              <ArrowUpRight size={24} className="text-rose mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-noir-200">Manage Products</p>
              <p className="text-xs text-noir-400">{stats.productCount} listings</p>
            </Link>
            <Link href="/dashboard/messages" className="p-4 rounded-xl bg-noir-900/50 hover:bg-noir-800/50 transition-colors text-center group">
              <Users size={24} className="text-rose mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-noir-200">Messages</p>
              <p className="text-xs text-noir-400">Customer support</p>
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-noir-100">Getting Started</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-noir-400">{onboarding.progress_percent}% complete</span>
              <div className="w-24 h-2 bg-noir-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose to-emerald-400 transition-all duration-500"
                  style={{ width: `${onboarding.progress_percent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {gettingStartedSteps.map((item) => (
              <Link 
                key={item.step}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  item.done ? 'bg-emerald-500/10' : 'bg-noir-900/50 hover:bg-noir-800/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.done ? 'bg-emerald-500 text-noir-50' : 'bg-noir-800 text-noir-400'
                }`}>
                  {item.done ? <CheckCircle size={16} /> : item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${item.done ? 'text-emerald-400' : 'text-noir-200'}`}>
                      {item.label}
                    </span>
                    {item.done && <CheckCircle size={12} className="text-emerald-400" />}
                  </div>
                  <p className="text-xs text-noir-500 mt-0.5">{item.description}</p>
                </div>
                {!item.done && <ArrowUpRight size={14} className="text-noir-500 shrink-0" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
