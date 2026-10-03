'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, MapPin, Users } from 'lucide-react'
import { getSimilarMakers } from '@/lib/data'
import { formatLastActive, isOnline } from '@/lib/time'

interface Maker {
  id: string
  name: string
  slug?: string
  avatar_url?: string
  location?: string
  bio?: string
  rating?: number
  sales_count?: number
  profile?: {
    last_active?: string
  }
}

interface SimilarMakersProps {
  currentMakerId: string
}

export default function SimilarMakers({ currentMakerId }: SimilarMakersProps) {
  const [makers, setMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    loadSimilarMakers()
  }, [currentMakerId])

  const loadSimilarMakers = async () => {
    setLoading(true)
    const data = await getSimilarMakers(currentMakerId, 8)
    setMakers(data)
    setLoading(false)
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('similar-makers-scroll')
    if (!container) return
    
    const scrollAmount = 300
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  if (loading) return null
  if (makers.length === 0) return null

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif italic text-xl text-noir-50">
          Similar Makers
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-lg bg-noir-800/50 text-noir-400 hover:text-noir-200 hover:bg-noir-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-lg bg-noir-800/50 text-noir-400 hover:text-noir-200 hover:bg-noir-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div 
        id="similar-makers-scroll"
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {makers.map(maker => (
          <Link
            key={maker.id}
            href={`/maker/${maker.slug || maker.id}`}
            className="flex-shrink-0 w-64 bg-noir-900 border border-noir-800/50 rounded-xl p-4 hover:border-noir-700 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-noir-800 flex items-center justify-center overflow-hidden">
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
                {/* Online indicator */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-noir-900 ${
                    isOnline(maker.profile?.last_active) ? 'bg-emerald-400' : 'bg-noir-600'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-noir-100 truncate group-hover:text-rose transition-colors">
                  {maker.name}
                </h3>
                <p className={`text-xs mt-0.5 ${isOnline(maker.profile?.last_active) ? 'text-emerald-400' : 'text-noir-500'}`}>
                  {formatLastActive(maker.profile?.last_active)}
                </p>
              </div>
            </div>
            
            {maker.bio && (
              <p className="text-xs text-noir-400 line-clamp-2 mb-3">
                {maker.bio}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-xs">
              {maker.rating && (
                <span className="text-amber-400 flex items-center gap-1">
                  <Star size={12} className="fill-amber-400" />
                  {maker.rating.toFixed(1)}
                </span>
              )}
              {maker.sales_count && maker.sales_count > 0 && (
                <span className="text-noir-400 flex items-center gap-1">
                  <Users size={12} />
                  {maker.sales_count} sales
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
