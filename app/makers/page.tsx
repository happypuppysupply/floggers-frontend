'use client'

import Link from 'next/link'
import { Star, MapPin, Package, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getMakers } from '@/lib/data'

interface Maker {
  id: string;
  name: string;
  slug?: string;
  tagline?: string;
  bio?: string;
  location?: string;
  rating?: number;
  products_count?: number;
  avatar_url?: string;
  cover_image_url?: string;
}

export default function MakersPage() {
  const [makers, setMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMakers()
  }, [])

  const loadMakers = async () => {
    const data = await getMakers()
    setMakers(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-rose border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-2">Explore Makers</h1>
        <p className="text-noir-400">{makers.length} verified independent artisans crafting gear for the lifestyle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {makers.map(maker => (
          <Link key={maker.id} href={`/maker/${maker.slug || maker.id}`} className="group card-glass overflow-hidden hover:bg-noir-800/40 transition-colors">
            <div className="relative h-40 overflow-hidden">
              <img 
                src={maker.cover_image_url || maker.avatar_url || '/placeholder.jpg'} 
                alt={maker.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="font-serif italic text-xl text-noir-50">{maker.name}</h2>
                <p className="text-xs text-noir-300 mt-1">{maker.tagline || ''}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-noir-300 line-clamp-2 mb-4">{maker.bio || ''}</p>
              <div className="flex items-center justify-between text-xs text-noir-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {maker.location || 'Unknown'}</span>
                  <span className="flex items-center gap-1"><Package size={12} /> {maker.products_count || 0} products</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-rose text-rose" />
                  <span className="text-noir-200">{maker.rating?.toFixed(1) || '—'}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-rose opacity-0 group-hover:opacity-100 transition-opacity">
                View Storefront <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
