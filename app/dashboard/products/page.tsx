'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'

const products = [
  { id: 'harness-01', name: 'The Penumbra Harness', price: 185, stock: 12, sold: 47, status: 'active' },
  { id: 'cuffs-01', name: 'Abyss Wrist Cuffs', price: 72, stock: 8, sold: 38, status: 'active' },
  { id: 'flogger-01', name: 'Phoenix Tail Flogger', price: 95, stock: 15, sold: 28, status: 'active' },
  { id: 'collar-01', name: 'The Sovereign Collar', price: 68, stock: 5, sold: 32, status: 'low_stock' },
  { id: 'paddle-01', name: 'The Courtier Paddle', price: 45, stock: 20, sold: 19, status: 'active' },
  { id: 'spreader-01', name: 'The Iron Spreader Bar', price: 120, stock: 0, sold: 12, status: 'out_of_stock' },
]

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'active' && p.status !== 'active') return false
    if (filter === 'low' && p.status !== 'low_stock') return false
    if (filter === 'out' && p.status !== 'out_of_stock') return false
    return true
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Products</h1>
          <p className="text-sm text-noir-400">Manage your product listings</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
          <input
            type="text"
            placeholder="Search products..."
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
          <option value="all">All Products</option>
          <option value="active">Active</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-noir-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Price</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Stock</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Sold</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-noir-800/30 hover:bg-noir-800/20">
                <td className="py-3 px-4">
                  <p className="font-medium text-noir-200">{product.name}</p>
                </td>
                <td className="py-3 px-4 text-noir-300">${product.price}</td>
                <td className="py-3 px-4 text-noir-300">{product.stock}</td>
                <td className="py-3 px-4 text-noir-300">{product.sold}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    product.status === 'low_stock' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-dark/20 text-rose'
                  }`}>
                    {product.status === 'active' ? 'Active' :
                     product.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/product/${product.id}`} className="p-1.5 rounded hover:bg-noir-700 text-noir-400 hover:text-noir-200">
                      <Eye size={16} />
                    </Link>
                    <button className="p-1.5 rounded hover:bg-noir-700 text-noir-400 hover:text-noir-200">
                      <Edit size={16} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-rose-dark/20 text-noir-400 hover:text-rose">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
