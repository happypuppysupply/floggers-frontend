'use client'

import { useState } from 'react'
import { Search, CheckCircle, Truck, Package, X, MessageSquare, MapPin, Calendar, DollarSign } from 'lucide-react'

const orders = [
  { id: '#FL-7829', customer: 'Raven_K', email: 'raven@example.com', items: [
    { name: 'The Penumbra Harness', qty: 1, price: 185 },
    { name: 'Abyss Wrist Cuffs', qty: 1, price: 72 }
  ], total: 257, status: 'fulfilled', date: '2024-09-27', address: '123 Maple St, Portland, OR 97201', payment: 'Visa ending in 4521' },
  { id: '#FL-7828', customer: 'MistressV', email: 'mv@example.com', items: [
    { name: 'Phoenix Tail Flogger', qty: 1, price: 95 },
    { name: 'The Courtier Paddle', qty: 1, price: 45 }
  ], total: 140, status: 'processing', date: '2024-09-27', address: '456 Oak Ave, San Francisco, CA 94102', payment: 'Mastercard ending in 8892' },
  { id: '#FL-7827', customer: 'LeatherLover', email: 'll@example.com', items: [
    { name: 'The Sovereign Collar', qty: 1, price: 68 }
  ], total: 68, status: 'shipped', date: '2024-09-26', address: '789 Pine Rd, Seattle, WA 98101', payment: 'PayPal' },
  { id: '#FL-7826', customer: 'Kitten_J', email: 'kj@example.com', items: [
    { name: 'The Iron Spreader Bar', qty: 1, price: 120 }
  ], total: 120, status: 'pending', date: '2024-09-26', address: '321 Elm Dr, Austin, TX 78701', payment: 'Apple Pay' },
  { id: '#FL-7825', customer: 'Dom_Darius', email: 'dd@example.com', items: [
    { name: 'The Penumbra Harness', qty: 2, price: 370 }
  ], total: 370, status: 'fulfilled', date: '2024-09-25', address: '654 Birch Ln, Chicago, IL 60601', payment: 'Visa ending in 1204' },
]

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  fulfilled: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle size={12} /> },
  shipped: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Truck size={12} /> },
  processing: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Package size={12} /> },
  pending: { bg: 'bg-noir-700', text: 'text-noir-300', icon: <div className="w-2 h-2 rounded-full bg-noir-400" /> },
}

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null)

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
              <tr
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="border-b border-noir-800/30 hover:bg-noir-800/20 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-medium text-noir-200">{order.id}</td>
                <td className="py-3 px-4">
                  <p className="text-noir-200">{order.customer}</p>
                  <p className="text-xs text-noir-500">{order.email}</p>
                </td>
                <td className="py-3 px-4 text-noir-300">{order.items.length}</td>
                <td className="py-3 px-4 text-noir-200">${order.total}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                    {statusConfig[order.status].icon}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-noir-400 text-sm">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="card-glass w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-noir-400 hover:text-noir-200">
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-medium text-noir-50">{selectedOrder.id}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].text}`}>
                {statusConfig[selectedOrder.status].icon}
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4">
              {/* Customer */}
              <div className="p-3 rounded-lg bg-noir-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="text-sm font-medium text-noir-200">{selectedOrder.customer}</span>
                </div>
                <p className="text-xs text-noir-400 ml-5">{selectedOrder.email}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium text-noir-100 mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-noir-900/50">
                      <div>
                        <p className="text-sm text-noir-200">{item.name}</p>
                        <p className="text-xs text-noir-500">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-medium text-noir-50">${item.price}</p>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-noir-800/50">
                    <span className="text-sm text-noir-300">Total</span>
                    <span className="text-lg font-medium text-noir-50">${selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-noir-900/50">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-noir-500" />
                    <span className="text-xs text-noir-400">Shipping</span>
                  </div>
                  <p className="text-xs text-noir-300 ml-5">{selectedOrder.address}</p>
                </div>
                <div className="p-3 rounded-lg bg-noir-900/50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-noir-500" />
                    <span className="text-xs text-noir-400">Payment</span>
                  </div>
                  <p className="text-xs text-noir-300 ml-5">{selectedOrder.payment}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Message Buyer
                </button>
                {selectedOrder.status === 'pending' && (
                  <button className="flex-1 btn-secondary">Mark Processing</button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button className="flex-1 btn-secondary">Mark Shipped</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
