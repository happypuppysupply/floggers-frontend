'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getUserFavorites, toggleFavorite, Product } from '@/lib/data'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return
    setLoading(true)
    const data = await getUserFavorites(user.id)
    setFavorites(data)
    setLoading(false)
  }

  const removeFavorite = async (productId: string) => {
    if (!user) return
    setRemoving(productId)
    const result = await toggleFavorite(user.id, productId)
    if (result.success) {
      setFavorites(prev => prev.filter(f => f.id !== productId))
    }
    setRemoving(null)
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <Heart size={48} className="mx-auto mb-4 text-noir-600" />
        <h2 className="text-xl font-serif italic text-noir-100 mb-2">Sign in to view favorites</h2>
        <p className="text-noir-400 mb-4">Save products you love and access them anytime</p>
        <Link href="/login" className="btn-primary">Sign In</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-rose animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="font-serif italic text-2xl text-noir-50 mb-6">Your Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto mb-4 text-noir-600" />
          <h2 className="text-xl font-serif italic text-noir-100 mb-2">No favorites yet</h2>
          <p className="text-noir-400 mb-6">Start saving products you love</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map(product => (
            <div key={product.id} className="bg-noir-900/50 border border-noir-800/50 rounded-xl overflow-hidden group">
              <Link href={`/product/${product.slug || product.id}`} className="block">
                <div className="aspect-square bg-noir-800/50 relative overflow-hidden">
                  <img
                    src={product.image_url || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/product/${product.slug || product.id}`}>
                  <h3 className="text-sm font-medium text-noir-100 truncate hover:text-rose transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-noir-400 mt-1">{product.maker?.name || 'Unknown'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-serif italic text-noir-50">${product.price}</span>
                  <button
                    onClick={() => removeFavorite(product.id)}
                    disabled={removing === product.id}
                    className="p-2 rounded-lg hover:bg-rose/20 text-rose transition-colors"
                    title="Remove from favorites"
                  >
                    {removing === product.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
