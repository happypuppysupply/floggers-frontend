'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, Loader2, Users, Star, MapPin, UserCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getUserFavorites, getUserFollowedMakers, toggleFavorite, Product } from '@/lib/data'

interface Maker {
  id: string
  name: string
  slug?: string
  avatar_url?: string
  location?: string
  bio?: string
  rating?: number
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'products' | 'makers'>('products')
  const [favorites, setFavorites] = useState<Product[]>([])
  const [followedMakers, setFollowedMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    const [favData, makersData] = await Promise.all([
      getUserFavorites(user.id),
      getUserFollowedMakers(user.id)
    ])
    setFavorites(favData)
    setFollowedMakers(makersData)
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
        <p className="text-noir-400 mb-4">Save products you love and follow makers you trust</p>
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
      <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Your Favorites</h1>
      <p className="text-noir-400 text-sm mb-6">Saved products and followed makers</p>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-noir-800/50 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'products'
              ? 'text-rose'
              : 'text-noir-400 hover:text-noir-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={16} />
            Products
            {favorites.length > 0 && (
              <span className="bg-noir-800 text-noir-300 text-xs px-2 py-0.5 rounded-full">
                {favorites.length}
              </span>
            )}
          </span>
          {activeTab === 'products' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('makers')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'makers'
              ? 'text-rose'
              : 'text-noir-400 hover:text-noir-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <UserCheck size={16} />
            Makers
            {followedMakers.length > 0 && (
              <span className="bg-noir-800 text-noir-300 text-xs px-2 py-0.5 rounded-full">
                {followedMakers.length}
              </span>
            )}
          </span>
          {activeTab === 'makers' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose rounded-t-full" />
          )}
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
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
        </>
      )}

      {/* Makers Tab */}
      {activeTab === 'makers' && (
        <>
          {followedMakers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto mb-4 text-noir-600" />
              <h2 className="text-xl font-serif italic text-noir-100 mb-2">No followed makers yet</h2>
              <p className="text-noir-400 mb-6">Follow makers to see their latest products and updates</p>
              <Link href="/makers" className="btn-primary inline-flex items-center gap-2">
                <Users size={18} /> Browse Makers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedMakers.map(maker => (
                <Link
                  key={maker.id}
                  href={`/maker/${maker.slug || maker.id}`}
                  className="bg-noir-900/50 border border-noir-800/50 rounded-xl p-5 hover:border-noir-700 transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-full bg-noir-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {maker.avatar_url ? (
                        <img
                          src={maker.avatar_url}
                          alt={maker.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-serif italic text-rose">
                          {maker.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-noir-100 truncate group-hover:text-rose transition-colors">
                        {maker.name}
                      </h3>
                      {maker.location && (
                        <p className="text-xs text-noir-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} />
                          {maker.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {maker.bio && (
                    <p className="text-sm text-noir-400 line-clamp-2 mb-3">
                      {maker.bio}
                    </p>
                  )}
                  {maker.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm text-amber-400">{maker.rating.toFixed(1)}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
