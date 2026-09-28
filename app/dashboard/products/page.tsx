'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, MoreHorizontal, X } from 'lucide-react'

const products = [
  { id: 'harness-01', name: 'The Penumbra Harness', price: 185, stock: 12, sold: 47, status: 'active' },
  { id: 'cuffs-01', name: 'Abyss Wrist Cuffs', price: 72, stock: 8, sold: 38, status: 'active' },
  { id: 'flogger-01', name: 'Phoenix Tail Flogger', price: 95, stock: 15, sold: 28, status: 'active' },
  { id: 'collar-01', name: 'The Sovereign Collar', price: 68, stock: 5, sold: 32, status: 'low_stock' },
  { id: 'paddle-01', name: 'The Courtier Paddle', price: 45, stock: 20, sold: 19, status: 'active' },
  { id: 'spreader-01', name: 'The Iron Spreader Bar', price: 120, stock: 0, sold: 12, status: 'out_of_stock' },
]

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded ${
      status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
      status === 'low_stock' ? 'bg-amber-500/20 text-amber-400' :
      'bg-rose-dark/20 text-rose'
    }`}>
      {status === 'active' ? 'Active' : status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
    </span>
  )
}

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editProduct, setEditProduct] = useState<typeof products[0] | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<typeof products[0] | null>(null)

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
                <td className="py-3 px-4"><StatusBadge status={product.status} /></td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/product/${product.id}`} className="p-1.5 rounded hover:bg-noir-700 text-noir-400 hover:text-noir-200" title="View">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </Link>
                    <button onClick={() => setEditProduct(product)} className="p-1.5 rounded hover:bg-noir-700 text-noir-400 hover:text-noir-200" title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => setDeleteProduct(product)} className="p-1.5 rounded hover:bg-rose-dark/20 text-noir-400 hover:text-rose" title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card-glass w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-noir-100">Edit Product</h2>
              <button onClick={() => setEditProduct(null)} className="text-noir-400 hover:text-noir-200"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1">Name</label>
                <input defaultValue={editProduct.name} className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Price</label>
                  <input defaultValue={editProduct.price} type="number" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Stock</label>
                  <input defaultValue={editProduct.stock} type="number" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEditProduct(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => setEditProduct(null)} className="btn-primary flex-1">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card-glass w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-dark/20 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <h2 className="text-lg font-medium text-noir-100 mb-2">Delete Product?</h2>
            <p className="text-sm text-noir-400 mb-6">"{deleteProduct.name}" will be permanently removed from your shop.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteProduct(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => setDeleteProduct(null)} className="flex-1 bg-rose-dark hover:bg-rose text-noir-50 px-6 py-3 rounded-lg font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
