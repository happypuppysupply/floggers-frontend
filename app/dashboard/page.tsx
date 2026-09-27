'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users } from 'lucide-react'

const stats = [
  { label: 'Total Sales', value: '$8,245', change: '+12.5%', up: true, icon: DollarSign },
  { label: 'Orders', value: '127', change: '+8.2%', up: true, icon: ShoppingBag },
  { label: 'Products', value: '34', change: '+2', up: true, icon: Package },
  { label: 'Customers', value: '89', change: '+15.3%', up: true, icon: Users },
]

const recentOrders = [
  { id: '#FL-7829', customer: 'Raven_K', product: 'The Penumbra Harness', total: 185, status: 'fulfilled', date: '2 hours ago' },
  { id: '#FL-7828', customer: 'MistressV', product: 'Abyss Wrist Cuffs', total: 144, status: 'processing', date: '5 hours ago' },
  { id: '#FL-7827', customer: 'LeatherLover', product: 'Phoenix Tail Flogger', total: 95, status: 'fulfilled', date: '1 day ago' },
  { id: '#FL-7826', customer: 'Kitten_J', product: 'The Sovereign Collar', total: 68, status: 'pending', date: '1 day ago' },
  { id: '#FL-7825', customer: 'Dom_Darius', product: 'The Penumbra Harness', total: 205, status: 'fulfilled', date: '2 days ago' },
]

const topProducts = [
  { name: 'The Penumbra Harness', sales: 47, revenue: 8695 },
  { name: 'Abyss Wrist Cuffs', sales: 38, revenue: 2736 },
  { name: 'The Sovereign Collar', sales: 32, revenue: 2176 },
  { name: 'Phoenix Tail Flogger', sales: 28, revenue: 2660 },
]

export default function DashboardOverview() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Dashboard Overview</h1>
        <p className="text-sm text-noir-400">Welcome back, Black Raven Leather</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card-glass p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className="text-rose-muted" />
                <span className={`text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-rose'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-medium text-noir-50">{stat.value}</p>
              <p className="text-xs text-noir-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-noir-100">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-rose hover:text-rose-light transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-noir-900/50">
                <div>
                  <p className="text-sm font-medium text-noir-200">{order.id}</p>
                  <p className="text-xs text-noir-400">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-noir-200">${order.total}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    order.status === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-400' :
                    order.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-noir-700 text-noir-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-noir-100">Top Products</h2>
            <Link href="/dashboard/products" className="text-xs text-rose hover:text-rose-light transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3 p-3 rounded-lg bg-noir-900/50">
                <span className="text-sm font-medium text-noir-500 w-6">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-noir-200">{product.name}</p>
                  <p className="text-xs text-noir-400">{product.sales} sold</p>
                </div>
                <p className="text-sm font-medium text-noir-200">${product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/products/new" className="card-glass p-4 hover:bg-noir-800/40 transition-colors text-center">
          <p className="text-sm font-medium text-noir-200">Add Product</p>
          <p className="text-xs text-noir-400">Create new listing</p>
        </Link>
        <Link href="/dashboard/import" className="card-glass p-4 hover:bg-noir-800/40 transition-colors text-center">
          <p className="text-sm font-medium text-noir-200">Import Products</p>
          <p className="text-xs text-noir-400">From Etsy or Shopify</p>
        </Link>
        <Link href="/dashboard/orders" className="card-glass p-4 hover:bg-noir-800/40 transition-colors text-center">
          <p className="text-sm font-medium text-noir-200">View Orders</p>
          <p className="text-xs text-noir-400">2 pending</p>
        </Link>
        <Link href="/dashboard/settings" className="card-glass p-4 hover:bg-noir-800/40 transition-colors text-center">
          <p className="text-sm font-medium text-noir-200">Shop Settings</p>
          <p className="text-xs text-noir-400">Update profile</p>
        </Link>
      </div>
    </div>
  )
}
