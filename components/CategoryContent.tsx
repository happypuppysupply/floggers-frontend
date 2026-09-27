'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Star, Search } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { products, categories } from '@/lib/mockData'

export default function CategoryContent() {
  const params = useSearchParams()
  const initialCat = params.get('cat') || ''

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = [...products]
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.makerName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    if (sortBy === 'reviews') list.sort((a, b) => b.reviews - a.reviews)
    return list
  }, [selectedCategory, search, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-2">Browse</h1>
        <p className="text-noir-400">{filtered.length} products from independent makers</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
          <input
            type="text"
            placeholder="Search products, makers, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-noir-900 border border-noir-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 placeholder:text-noir-500 focus:outline-none focus:border-rose/50"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-noir-900 border border-noir-800 rounded-lg px-4 py-2.5 text-sm text-noir-200 focus:outline-none focus:border-rose/50"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviewed</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${showFilters ? 'border-rose text-rose bg-rose-dark/10' : 'border-noir-800 text-noir-300'}`}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-noir-800/50">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedCategory ? 'bg-rose-dark text-noir-50' : 'bg-noir-900 text-noir-400 hover:text-noir-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === cat.id ? 'bg-rose-dark text-noir-50' : 'bg-noir-900 text-noir-400 hover:text-noir-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-noir-400 mb-2">No products found</p>
          <p className="text-sm text-noir-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
