'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getDashboardStats, getMakerById } from '@/lib/data'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users, ArrowUpRight } from 'lucide-react'

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  productCount: number;
  customerCount: number;
}

export default function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    productCount: 0,
    customerCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [makerName, setMakerName] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      // Get maker profile
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data: maker } = await supabase
        .from('makers')
        .select('id, name')
        .eq('profile_id', user.id)
        .single()

      if (maker) {
        setMakerName(maker.name)
        const stats = await getDashboardStats(maker.id)
        setStats(stats)
      }

      setLoading(false)
    }

    loadStats()
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Dashboard Overview</h1>
        <p className="text-sm text-noir-400">
          {makerName ? `Welcome back, ${makerName}` : 'Loading...'}
        </p>
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
                {loading ? '—' : stat.value}
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
          <h2 className="text-lg font-medium text-noir-100 mb-6">Getting Started</h2>
          <div className="space-y-3">
            {[
              { step: 1, label: 'Complete your shop profile', href: '/dashboard/settings', done: makerName !== '' },
              { step: 2, label: 'Add your first product', href: '/dashboard/products/new', done: stats.productCount > 0 },
              { step: 3, label: 'Set up shipping details', href: '/dashboard/settings', done: false },
              { step: 4, label: 'Share your shop link', href: '/', done: false },
            ].map((item) => (
              <Link 
                key={item.step}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  item.done ? 'bg-emerald-500/10' : 'bg-noir-900/50 hover:bg-noir-800/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  item.done ? 'bg-emerald-500 text-noir-50' : 'bg-noir-800 text-noir-400'
                }`}>
                  {item.done ? '✓' : item.step}
                </div>
                <span className={`text-sm ${item.done ? 'text-emerald-400' : 'text-noir-200'}`}>
                  {item.label}
                </span>
                {item.done && <ArrowUpRight size={14} className="ml-auto text-emerald-400" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
