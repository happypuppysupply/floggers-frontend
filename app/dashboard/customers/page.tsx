'use client'

import { useState, useEffect } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface Customer {
  user_id: string
  name: string
  email: string
  orders: number
  spent: number
  last_order: string
}

export default function CustomersPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [user])

  const loadCustomers = async () => {
    if (!user) return
    
    setLoading(true)
    const supabase = createClient()
    
    // Get maker ID
    const { data: maker } = await supabase
      .from('makers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    
    if (!maker) {
      setLoading(false)
      return
    }
    
    // Get orders for this maker
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        price,
        quantity,
        order:orders(
          user_id,
          user:profiles(email, full_name),
          created_at
        )
      `)
      .eq('maker_id', maker.id)
      .not('order.user_id', 'is', null)
    
    // Aggregate by customer
    const customerMap = new Map<string, Customer>()
    
    orderItems?.forEach((item: any) => {
      const userId = item.order.user_id
      const userData = item.order.user
      const amount = item.price * item.quantity
      
      if (customerMap.has(userId)) {
        const existing = customerMap.get(userId)!
        existing.orders += 1
        existing.spent += amount
        if (new Date(item.order.created_at) > new Date(existing.last_order)) {
          existing.last_order = item.order.created_at
        }
      } else {
        customerMap.set(userId, {
          user_id: userId,
          name: userData?.full_name 
            ? userData.full_name
            : userData?.email?.split('@')[0] || 'Unknown',
          email: userData?.email || 'Unknown',
          orders: 1,
          spent: amount,
          last_order: item.order.created_at
        })
      }
    })
    
    setCustomers(Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent))
    setLoading(false)
  }

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
        <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Customers</h1>
        <p className="text-sm text-noir-400">
          {customers.length} {customers.length === 1 ? 'customer' : 'customers'} total
        </p>
      </div>

      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-noir-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Customer</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Orders</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Total Spent</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-noir-400">
                  No customers yet
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.user_id} className="border-b border-noir-800/30 hover:bg-noir-800/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-noir-800 flex items-center justify-center">
                        <span className="text-sm text-noir-300">{c.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-noir-200">{c.name}</p>
                        <p className="text-xs text-noir-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-noir-300">{c.orders}</td>
                  <td className="py-3 px-4 text-noir-200">${c.spent.toFixed(2)}</td>
                  <td className="py-3 px-4 text-noir-400 text-sm">
                    {new Date(c.last_order).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
