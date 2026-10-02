'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2, Loader2, ChevronLeft, Package, Users, Star, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getUserFavorites, getUserFollowedMakers, toggleFavorite, Product } from '@/lib/data'

type Tab = 'products' | 'makers'

interface Maker {
  id: string
  name: string
  slug?: string
  avatar_url?: string
  location?: string
  bio?: string
  rating?: number
  sales_count?: number
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('products')
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Heart size={48} className="mx-auto mb-4 text-noir-600" />
          <h2 className="text-xl font-serif italic text-noir-100 mb-2">Sign in to view favorites</h2>
          <p className="text-noir-400 mb-6">Save products you love and makers you follow</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header */}
      <div className="border-b border-noir-800/50 bg-noir-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-noir-400 hover:text-noir-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-serif italic text-xl text-noir-50">My Favorites</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-noir-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'products' ? 'text-rose' : 'text-noir-400 hover:text-noir-200'
              }`}
            >
              <Package size={18} />
              Products
              {favorites.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-noir-800 rounded text-xs text-noir-300">
                  {favorites.length}
                </span>
              )}
              {activeTab === 'products' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('makers')}
              className={`flex items-center gap-2 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'makers' ? 'text-rose' : 'text-noir-400 hover:text-noir-200'
              }`}
            >
              <Users size={18} />
              Makers
              {followedMakers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-noir-800 rounded text-xs text-noir-300">
                  {followedMakers.length}
                </span>
              )}
              {activeTab === 'makers' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="text-rose animate-spin" />
          </div>
        ) : activeTab === 'products' ? (
          // Products Tab
          favorites.length === 0 ? (
            <div className="text-center py-16">
              <Package size={48} className="mx-auto mb-4 text-noir-600" />
              <h2 className="text-xl font-serif italic text-noir-100 mb-2">No favorite products</h2>
              <p className="text-noir-400 mb-6">Save products you love while browsing</p>
              <Link href="/" className="btn-primary inline-flex items-center gap-2">
                <ShoppingBag size={18} /> Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map(product => (
                <div key={product.id} className="bg-noir-900 border border-noir-800/50 rounded-xl overflow-hidden group hover:border-noir-700 transition-colors">
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
          )
        ) : (
          // Makers Tab
          followedMakers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto mb-4 text-noir-600" />
              <h2 className="text-xl font-serif italic text-noir-100 mb-2">No followed makers</h2>
              <p className="text-noir-400 mb-6">Follow makers to see their latest products</p>
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
                  className="bg-noir-900 border border-noir-800/50 rounded-xl p-6 group hover:border-noir-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-noir-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {maker.avatar_url ? (
                        <img
                          src={maker.avatar_url}
                          alt={maker.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-serif italic text-rose">
                          {maker.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-noir-100 group-hover:text-rose transition-colors truncate">
                        {maker.name}
                      </h3>
                      {maker.location && (
                        <p className="text-xs text-noir-400 mt-1 flex items-center gap-1">
                          <MapPin size={12} />
                          {maker.location}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {maker.rating && (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <Star size={12} className="fill-amber-400" />
                            {maker.rating.toFixed(1)}
                          </span>
                        )}
                        {maker.sales_count && maker.sales_count > 0 && (
                          <span className="text-xs text-noir-400">
                            {maker.sales_count} sales
                          </span>
                        )}
                      </div>
                      {maker.bio && (
                        <p className="text-xs text-noir-400 mt-2 line-clamp-2">
                          {maker.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
