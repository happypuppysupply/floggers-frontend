import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star, ArrowLeft, Truck, Shield, Package } from 'lucide-react'
import { getProductBySlug, getProducts, getReviewsByProduct } from '@/lib/data'
import ProductCard from '@/components/ProductCard'
import AddToCartClient from '@/components/AddToCartClient'
import ReviewFormClient from '@/components/ReviewFormClient'

interface ProductPageProps {
  params: { id: string }
}

export async function generateStaticParams() {
  const products = await getProducts({ limit: 100 })
  return products.map(p => ({ id: p.slug || p.id }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.id)
  if (!product) return { title: 'Product Not Found' }
  
  return {
    title: `${product.name} | Floggers`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.id)
  
  if (!product) {
    notFound()
  }

  const reviews = await getReviewsByProduct(product.id)
  const relatedProducts = await getProducts({ 
    category: product.category_id,
    limit: 4 
  })
  const related = relatedProducts.filter(p => p.id !== product.id).slice(0, 4)

  const maker = product.maker
  const category = product.category

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/category" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-noir-900">
            <img 
              src={product.images?.[0] || '/placeholder.jpg'} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-noir-800">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {maker && (
            <p className="text-xs uppercase tracking-wider text-rose-muted mb-2">{maker.name}</p>
          )}
          <h1 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-rose text-rose" />
              <span className="text-noir-200 font-medium">{product.rating}</span>
            </div>
            <span className="text-noir-500 text-sm">{product.review_count} reviews</span>
            {product.badge && (
              <span className="bg-rose-dark/20 text-rose text-xs font-medium px-2 py-0.5 rounded">{product.badge}</span>
            )}
          </div>

          <p className="text-2xl font-medium text-noir-50 mb-6">${product.price}</p>

          <p className="text-noir-300 leading-relaxed mb-6">{product.description}</p>

          <AddToCartClient product={product} />

          {maker && (
            <Link 
              href={`/maker/${maker.slug || maker.id}`} 
              className="flex items-center gap-4 p-4 rounded-xl bg-noir-900/50 border border-noir-800/50 hover:border-noir-700 transition-colors"
            >
              <img src={maker.image_url} alt={maker.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-noir-200">Sold by {maker.name}</p>
                <p className="text-xs text-noir-400">{maker.location} · {maker.rating} ★</p>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 text-sm text-noir-400">
              <Truck size={18} className="text-rose-muted" />
              <span>Discreet shipping</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-noir-400">
              <Shield size={18} className="text-rose-muted" />
              <span>Verified maker</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-noir-400">
              <Package size={18} className="text-rose-muted" />
              <span>Secure packaging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Materials */}
      {product.materials && product.materials.length > 0 && (
        <div className="mb-16">
          <h2 className="font-serif italic text-2xl text-noir-50 mb-4">Materials & Craft</h2>
          <div className="card-glass p-6">
            <ul className="space-y-2">
              {product.materials.map((m, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-noir-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif italic text-2xl text-noir-50">Reviews ({reviews.length})</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {reviews.length > 0 ? (
              reviews.map(r => (
                <div key={r.id} className="card-glass p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-noir-200">
                        {r.user?.email?.split('@')[0] || 'Anonymous'}
                      </span>
                      {r.verified && <span className="text-[10px] bg-rose-dark/20 text-rose px-1.5 py-0.5 rounded">Verified Purchase</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? 'fill-rose text-rose' : 'text-noir-700'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-noir-300 leading-relaxed">{r.text}</p>
                  <p className="text-xs text-noir-500 mt-3">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-noir-400">No reviews yet. Be the first to review this product.</p>
            )}
          </div>

          <div>
            <ReviewFormClient productId={product.id} />
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="font-serif italic text-2xl text-noir-50 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
