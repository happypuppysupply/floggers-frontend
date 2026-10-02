'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Star, Search, ChevronDown, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { createClient } from '@/lib/supabase/client'
import { getCategories } from '@/lib/data'

interface Product {
  id: string
  name: string
  slug?: string
  description?: string
  price: number
  image_url?: string
  images?: string[]
  category_id?: string
  maker_id?: string
  category?: { name: string; slug: string }
  maker?: { name: string; slug?: string }
  rating?: number
  sales_count?: number
}

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
]

export default function CategoryContent() {
  const params = useSearchParams()
  const initialCat = params.get('cat') || ''
  const searchRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Load products
    const { data: productsData } = await supabase
      .from('products')
      .select(`
        *,
        maker:makers(name, slug),
        category:categories(name, slug)
      `)
      .eq('is_active', true)
    
    if (productsData) {
      setProducts(productsData)
    }
    
    // Load categories
    const cats = await getCategories()
    setCategories(cats)
    
    setLoading(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (selectedCategory) list = list.filter(p => p.category_id === selectedCategory || p.category?.slug === selectedCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.maker?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    return list
  }, [selectedCategory, search, sortBy, products])

  const searchSuggestions = [
    { type: 'category', label: 'Floggers', icon: '🔥' },
    { type: 'category', label: 'Paddles', icon: '🎯' },
    { type: 'category', label: 'Crops & Canes', icon: '🎋' },
    { type: 'category', label: 'Restraints', icon: '⛓️' },
    { type: 'category', label: 'Collars', icon: '📿' },
    { type: 'maker', label: 'Black Raven Leather', icon: '👤' },
    { type: 'maker', label: 'Iron Heart Forge', icon: '👤' },
    { type: 'maker', label: 'Crimson Crest', icon: '👤' },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-rose border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-2">Browse</h1>
        <p className="text-noir-400">{filtered.length} products from independent makers</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search with Dropdown */}
        <div className="relative flex-1" ref={searchRef}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500 z-10" />
          <input
            type="text"
            placeholder="Search products, makers, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-noir-900 border border-noir-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 placeholder:text-noir-500 focus:outline-none focus:border-rose/50"
          />
          
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-noir-900 border border-noir-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-2">
                <p className="text-xs text-noir-500 px-2 py-1">Popular Searches</p>
                {searchSuggestions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearch(item.label)
                      setShowSearchDropdown(false)
                      if (item.type === 'category') {
                        const cat = categories.find((c: any) => c.name.includes(item.label))?.id
                        if (cat) setSelectedCategory(cat)
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-noir-300 hover:bg-noir-800 rounded-md transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="text-xs text-noir-500 ml-auto capitalize">{item.type}</span>
                  </button>
                ))}
              </div>
              {search.trim() && (
                <div className="border-t border-noir-800 p-2">
                  <button
                    onClick={() => setShowSearchDropdown(false)}
                    className="w-full text-left px-3 py-2 text-sm text-rose hover:bg-rose-dark/10 rounded-md transition-colors"
                  >
                    Search for &quot;{search}&quot;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-noir-900 border border-noir-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-noir-200 focus:outline-none focus:border-rose/50 cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 pointer-events-none" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${showFilters ? 'border-rose text-rose bg-rose-dark/10' : 'border-noir-800 text-noir-300'}`}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory || search) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 bg-rose-dark/20 text-rose text-xs px-3 py-1.5 rounded-full">
              {categories.find((c: any) => c.id === selectedCategory || c.slug === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory('')} className="hover:text-noir-50"><X size={12} /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 bg-noir-800 text-noir-200 text-xs px-3 py-1.5 rounded-full">
              &quot;{search}&quot;
              <button onClick={() => setSearch('')} className="hover:text-noir-50"><X size={12} /></button>
            </span>
          )}
        </div>
      )}

      {/* Category Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-noir-800/50">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedCategory ? 'bg-rose-dark text-noir-50' : 'bg-noir-900 text-noir-400 hover:text-noir-200'}`}
          >
            All
          </button>
          {categories.map((cat: any) => (
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

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product as any} />
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
