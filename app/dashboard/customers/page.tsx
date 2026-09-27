'use client'

import { Users, Mail, ShoppingBag } from 'lucide-react'

const customers = [
  { name: 'Raven_K', email: 'raven@example.com', orders: 5, spent: 647, lastOrder: '2 hours ago' },
  { name: 'MistressV', email: 'mv@example.com', orders: 12, spent: 1845, lastOrder: '5 hours ago' },
  { name: 'LeatherLover', email: 'll@example.com', orders: 3, spent: 285, lastOrder: '1 day ago' },
  { name: 'Kitten_J', email: 'kj@example.com', orders: 8, spent: 892, lastOrder: '1 day ago' },
  { name: 'Dom_Darius', email: 'dd@example.com', orders: 7, spent: 1240, lastOrder: '2 days ago' },
]

export default function CustomersPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Customers</h1>
        <p className="text-sm text-noir-400">View your customer base</p>
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
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-noir-800/30 hover:bg-noir-800/20">
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
                <td className="py-3 px-4 text-noir-200">${c.spent}</td>
                <td className="py-3 px-4 text-noir-400 text-sm">{c.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
