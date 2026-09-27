'use client'

import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react'

const stats = [
  { label: 'Revenue', value: '$8,245', change: '+12.5%', icon: DollarSign },
  { label: 'Orders', value: '127', change: '+8.2%', icon: ShoppingBag },
  { label: 'Visitors', value: '1,429', change: '+24.1%', icon: Users },
  { label: 'Conversion', value: '8.9%', change: '+1.2%', icon: TrendingUp },
]

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Analytics</h1>
        <p className="text-sm text-noir-400">Track your shop performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card-glass p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className="text-rose-muted" />
                <span className="text-xs font-medium text-emerald-400">{s.change}</span>
              </div>
              <p className="text-2xl font-medium text-noir-50">{s.value}</p>
              <p className="text-xs text-noir-400">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="card-glass p-6">
        <h3 className="font-medium text-noir-100 mb-4">Sales Overview</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 88].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-rose-dark/40 rounded-t"
                style={{ height: `${h}%` }}
              />
              <span className="text-xs text-noir-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
