'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, X, Loader2, Eye, Pencil, Trash2, Circle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  price: number
  stock_count: number
  is_active: boolean
  image_url?: string
  category?: { name: string }
}

function StatusBadge({ isActive, stock }: { isActive: boolean; stock: number }) {
  let status = 'active'
  let label = 'Active'
  
  if (!isActive) {
    status = 'inactive'
    label = 'Inactive'
  } else if (stock === 0) {
    status = 'out_of_stock'
    label = 'Out of Stock'
  } else if (stock <= 5) {
    status = 'low_stock'
    label = 'Low Stock'
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded ${
      status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
      status === 'low_stock' ? 'bg-amber-500/20 text-amber-400' :
      status === 'out_of_stock' ? 'bg-rose-dark/20 text-rose' :
      'bg-noir-700 text-noir-400'
    }`}>
      {label}
    </span>
  )
}

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [user])

  const loadProducts = async () => {
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
    
    // Get products
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('maker_id', maker.id)
      .order('created_at', { ascending: false })
    
    setProducts(data || [])
    setLoading(false)
  }

  const handleToggleStatus = async (product: Product) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    
    if (!error) {
      await loadProducts()
    }
  }

  const handleDelete = async () => {
    if (!deleteProduct) return
    
    setDeleting(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteProduct.id)
    
    if (!error) {
      setDeleteProduct(null)
      await loadProducts()
    }
    
    setDeleting(false)
  }

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'active' && (!p.is_active || p.stock_count === 0)) return false
    if (filter === 'inactive' && p.is_active) return false
    if (filter === 'low' && p.stock_count > 5) return false
    return true
  })

  // Calculate stats
  const activeCount = products.filter(p => p.is_active && p.stock_count > 0).length
  const outOfStock = products.filter(p => p.stock_count === 0).length
  const lowStock = products.filter(p => p.stock_count > 0 && p.stock_count <= 5).length

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Products</h1>
          <p className="text-sm text-noir-400">
            {products.length} {products.length === 1 ? 'product' : 'products'} in your shop
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card-glass p-4 text-center">
          <p className="text-2xl font-medium text-noir-50">{products.length}</p>
          <p className="text-xs text-noir-400">Total</p>
        </div>
        <div className="card-glass p-4 text-center">
          <p className="text-2xl font-medium text-emerald-400">{activeCount}</p>
          <p className="text-xs text-noir-400">Active</p>
        </div>
        <div className="card-glass p-4 text-center">
          <p className="text-2xl font-medium text-amber-400">{lowStock}</p>
          <p className="text-xs text-noir-400">Low Stock</p>
        </div>
        <div className="card-glass p-4 text-center">
          <p className="text-2xl font-medium text-rose">{outOfStock}</p>
          <p className="text-xs text-noir-400">Out of Stock</p>
        </div>
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
          <option value="inactive">Inactive</option>
          <option value="low">Low Stock</option>
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
              <th className="text-left py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-noir-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-noir-400">
                  {products.length === 0 ? (
                    <div>
                      <p className="mb-4">No products yet</p>
                      <Link href="/dashboard/products/new" className="btn-primary text-sm">
                        Add Your First Product
                      </Link>
                    </div>
                  ) : (
                    'No products match your search'
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b border-noir-800/30 hover:bg-noir-800/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image_url || '/placeholder.jpg'} 
                        alt="" 
                        className="w-10 h-10 rounded object-cover bg-noir-800"
                      />
                      <div>
                        <p className="font-medium text-noir-200">{product.name}</p>
                        <p className="text-xs text-noir-500">{product.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-noir-300">${product.price}</td>
                  <td className="py-3 px-4 text-noir-300">{product.stock_count}</td>
                  <td className="py-3 px-4">
                    <StatusBadge isActive={product.is_active} stock={product.stock_count} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/product/${product.id}`} 
                        className="p-1.5 rounded hover:bg-noir-700 text-noir-400 hover:text-noir-200"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link 
                        href={`/dashboard/products/edit/${product.id}`}
                        className="p-1.5 rounded hover:bg-noir-700 text-noir-400 hover:text-noir-200"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button 
                        onClick={() => handleToggleStatus(product)} 
                        className="p-1.5 rounded hover:bg-noir-700 text-noir-400 hover:text-noir-200"
                        title={product.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Circle size={16} className={product.is_active ? 'text-emerald-400' : 'text-noir-500'} />
                      </button>
                      <button 
                        onClick={() => setDeleteProduct(product)} 
                        className="p-1.5 rounded hover:bg-rose-dark/20 text-noir-400 hover:text-rose"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card-glass w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-dark/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-rose" />
            </div>
            <h2 className="text-lg font-medium text-noir-100 mb-2">Delete Product?</h2>
            <p className="text-sm text-noir-400 mb-6">
              &quot;{deleteProduct.name}&quot; will be permanently removed from your shop.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteProduct(null)} 
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-dark hover:bg-rose text-noir-50 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
