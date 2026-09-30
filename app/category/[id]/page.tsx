import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { getProductsByCategory, getCategories } from '@/lib/data'

export default async function CategoryBySlugPage({ params }: { params: { id: string } }) {
  const categoryId = params.id
  const [products, categories] = await Promise.all([
    getProductsByCategory(categoryId),
    getCategories()
  ])

  const category = categories.find((c: any) => c.id === categoryId || c.slug === categoryId)
  const categoryName = category?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/category" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-4 transition-colors">
          <ArrowLeft size={16} /> All categories
        </Link>
        <h1 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-2 capitalize">
          {categoryName}
        </h1>
        <p className="text-noir-400">{products.length} products from independent makers</p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search size={48} className="text-noir-700 mx-auto mb-4" />
          <h3 className="text-xl text-noir-300 mb-2">No products found</h3>
          <p className="text-noir-500 mb-6">This category is empty right now.</p>
          <Link href="/category" className="btn-primary">
            Browse All Categories
          </Link>
        </div>
      )}
    </div>
  )
}
