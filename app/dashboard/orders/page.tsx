'use client'

import { useState } from 'react'
import { Search, Filter, Package, Truck, CheckCircle } from 'lucide-react'

const orders = [
  { id: '#FL-7829', customer: 'Raven_K', email: 'raven@example.com', items: 2, total: 185, status: 'fulfilled', date: '2024-09-27' },
  { id: '#FL-7828', customer: 'MistressV', email: 'mv@example.com', items: 1, total: 144, status: 'processing', date: '2024-09-27' },
  { id: '#FL-7827', customer: 'LeatherLover', email: 'll@example.com', items: 1, total: 95, status: 'shipped', date: '2024-09-26' },
  { id: '#FL-7826', customer: 'Kitten_J', email: 'kj@example.com', items: 1, total: 68, status: 'pending', date: '2024-09-26' },
  { id: '#FL-7825', customer: 'Dom_Darius', email: 'dd@example.com', items: 2, total: 205, status: 'fulfilled', date: '2024-09-25' },
  { id: '#FL-7824', customer: 'RopeTopSF', email: 'rt@example.com', items: 1, total: 245, status: 'shipped', date: '2024-09-25' },
]

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = orders.filter(o => {
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.includes(search)) return false
    if (filter === 'pending' && o.status !== 'pending') return false
    if (filter === 'processing' && o.status !== 'processing') return false
    if (filter === 'shipped' && o.status !== 'shipped') return false
    if (filter === 'fulfilled' && o.status !== 'fulfilled') return false
    return true
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Orders</h1>
        <p className="text-sm text-noir-400">Manage and fulfill customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-noir-900 border border-noir-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 placeholder:text-noir-500 focus:outline-none focus:border-rose/50"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-noir-900 border border-noir-800 rounded-lg px-4 py-2.5 text-sm text-noir-200 focus:outline-none focus:border-rose/50"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>

      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-noir-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Order</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Customer</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Items</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-noir-800/30 hover:bg-noir-800/20">
                <td className="py-3 px-4">
                  <p className="font-medium text-noir-200">{order.id}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-noir-200">{order.customer}</p>
                  <p className="text-xs text-noir-500">{order.email}</p>
                </td>
                <td className="py-3 px-4 text-noir-300">{order.items}</td>
                <td className="py-3 px-4 text-noir-200">${order.total}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                    order.status === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-400' :
                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-noir-700 text-noir-300'
                  }`}>
                    {order.status === 'fulfilled' && <CheckCircle size={12} />}
                    {order.status === 'shipped' && <Truck size={12} />}
                    {order.status === 'processing' && <Package size={12} />}
                    {order.status === 'pending' && <Filter size={12} />}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-noir-400 text-sm">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
