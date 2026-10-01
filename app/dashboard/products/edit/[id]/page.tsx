'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    if (!user) return
    const loadProduct = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      
      if (error || !data) {
        setError('Product not found')
        setLoading(false)
        return
      }
      
      setForm({
        name: data.name || '',
        price: String(data.price || ''),
        stock: String(data.stock_count || ''),
        description: data.description || '',
        is_active: data.is_active ?? true,
      })
      setLoading(false)
    }
    loadProduct()
  }, [user, productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    setError('')
    
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: form.name,
        price: parseFloat(form.price),
        stock_count: parseInt(form.stock),
        description: form.description,
        is_active: form.is_active,
      })
      .eq('id', productId)
    
    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }
    
    setSaved(true)
    setSaving(false)
    setTimeout(() => router.push('/dashboard/products'), 1000)
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

  if (saved) {
    return (
      <div className="p-8">
        <div className="max-w-xl mx-auto text-center card-glass p-8">
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-6" />
          <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Product Updated!</h1>
          <p className="text-noir-300">Redirecting to products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="card-glass p-8">
          <h1 className="font-serif italic text-2xl text-noir-50 mb-6">Edit Product</h1>
          
          {error && (
            <div className="bg-rose/20 border border-rose/30 text-rose-light px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-noir-300 mb-1">Product Name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1">Price ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                />
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1">Stock</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-noir-300 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50 resize-none"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-noir-700 bg-noir-950 text-rose focus:ring-rose/50"
              />
              <label htmlFor="is_active" className="text-sm text-noir-300">
                Active (visible to buyers)
              </label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Link href="/dashboard/products" className="btn-secondary flex-1 text-center">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
