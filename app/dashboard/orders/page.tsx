'use client'

import { useState, useEffect } from 'react'
import { Search, CheckCircle, Truck, Package, X, MessageSquare, MapPin, Calendar, DollarSign, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getMakerOrders, updateOrderStatus } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  created_at: string;
  shipping_address: any;
  user: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image_url: string;
    }
  }[];
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <div className="w-2 h-2 rounded-full bg-amber-400" /> },
  paid: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle size={12} /> },
  processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Package size={12} /> },
  shipped: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Truck size={12} /> },
  delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle size={12} /> },
  cancelled: { bg: 'bg-rose/20', text: 'text-rose', icon: <X size={12} /> },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [user])

  const loadOrders = async () => {
    if (!user) return
    
    setLoading(true)
    
    // Get maker ID
    const supabase = createClient()
    const { data: maker } = await supabase
      .from('makers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (maker) {
      const data = await getMakerOrders(maker.id)
      setOrders(data)
    }
    
    setLoading(false)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      await loadOrders()
      setSelectedOrder(null)
    }
    setUpdatingStatus(false)
  }

  const getCustomerName = (order: Order) => {
    if (order.user?.first_name) {
      return `${order.user.first_name} ${order.user.last_name?.[0] || ''}`.trim()
    }
    return order.user?.email?.split('@')[0] || 'Guest'
  }

  const filtered = orders.filter(o => {
    if (search && !getCustomerName(o).toLowerCase().includes(search.toLowerCase()) && !o.id.includes(search)) return false
    if (filter !== 'all' && o.status !== filter) return false
    return true
  })

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
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['pending', 'processing', 'shipped', 'delivered'].map(status => {
          const count = orders.filter(o => o.status === status).length
          return (
            <div key={status} className="card-glass p-4 text-center">
              <p className="text-2xl font-medium text-noir-50">{count}</p>
              <p className="text-xs text-noir-400 capitalize">{status}</p>
            </div>
          )
        })}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-noir-400">
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="border-b border-noir-800/30 hover:bg-noir-800/20 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-noir-200">#{order.id.slice(0, 8)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-noir-200">{getCustomerName(order)}</p>
                    <p className="text-xs text-noir-500">{order.user?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-noir-300">
                    {order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0} items
                  </td>
                  <td className="py-3 px-4 text-noir-200">
                    ${(order.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.text}`}>
                      {statusConfig[order.status]?.icon}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-noir-400 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
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
              <span className="text-xl font-medium text-noir-50">#{selectedOrder.id.slice(0, 8)}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded ${statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.text}`}>
                {statusConfig[selectedOrder.status]?.icon}
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4">
              {/* Customer */}
              <div className="p-3 rounded-lg bg-noir-900/50">
                <p className="text-sm font-medium text-noir-200 mb-1">{getCustomerName(selectedOrder)}</p>
                <p className="text-xs text-noir-400">{selectedOrder.user?.email || 'Guest checkout'}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium text-noir-100 mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-noir-900/50">
                      <img src={item.product?.image_url || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm text-noir-200">{item.product?.name}</p>
                        <p className="text-xs text-noir-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-noir-50">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-noir-900/50">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-noir-500" />
                    <span className="text-xs text-noir-400">Shipping</span>
                  </div>
                  <p className="text-xs text-noir-300 ml-5">
                    {selectedOrder.shipping_address ? 
                      `${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.state}` 
                      : 'Not provided'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-noir-900/50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-noir-500" />
                    <span className="text-xs text-noir-400">Total</span>
                  </div>
                  <p className="text-xs text-noir-300 ml-5">
                    ${(selectedOrder.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.status === 'pending' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                    disabled={updatingStatus}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                    Mark Processing
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                    disabled={updatingStatus}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
                    Mark Shipped
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                    disabled={updatingStatus}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Mark Delivered
                  </button>
                )}
                <button className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Message Buyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
