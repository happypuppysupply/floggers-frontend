import Link from 'next/link'
import { Star, ArrowLeft, Truck, Shield, Package } from 'lucide-react'
import { getProductById, getMakerById, getReviewsByProduct, products } from '@/lib/mockData'
import ProductCard from '@/components/ProductCard'
import AddToCartClient from '@/components/AddToCartClient'

export function generateStaticParams() {
  return products.map(p => ({ id: p.id }))
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id)
  const maker = product ? getMakerById(product.makerId) : null
  const reviews = product ? getReviewsByProduct(product.id) : []
  const related = product ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4) : []

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl text-noir-200 mb-4">Product not found</h1>
        <Link href="/category" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/category" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-noir-900">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            {[product.image, ...product.images].map((img, i) => (
              <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-noir-800">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-wider text-rose-muted mb-2">{product.makerName}</p>
          <h1 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-rose text-rose" />
              <span className="text-noir-200 font-medium">{product.rating}</span>
            </div>
            <span className="text-noir-500 text-sm">{product.reviews} reviews</span>
            {product.badge && (
              <span className="bg-rose-dark/20 text-rose text-xs font-medium px-2 py-0.5 rounded">{product.badge}</span>
            )}
          </div>

          <p className="text-2xl font-medium text-noir-50 mb-6">${product.price}</p>

          <p className="text-noir-300 leading-relaxed mb-6">{product.description}</p>

          <AddToCartClient product={product} />

          {maker && (
            <Link href={`/maker/${maker.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-noir-900/50 border border-noir-800/50 hover:border-noir-700 transition-colors">
              <img src={maker.image} alt={maker.name} className="w-12 h-12 rounded-full object-cover" />
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

      {/* Reviews */}
      <div className="mb-16">
        <h2 className="font-serif italic text-2xl text-noir-50 mb-6">Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.map(r => (
              <div key={r.id} className="card-glass p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-noir-200">{r.author}</span>
                    {r.verified && <span className="text-[10px] bg-rose-dark/20 text-rose px-1.5 py-0.5 rounded">Verified Purchase</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? 'fill-rose text-rose' : 'text-noir-700'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-noir-300 leading-relaxed">{r.text}</p>
                <p className="text-xs text-noir-500 mt-3">{r.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-noir-400">No reviews yet. Be the first to review this product.</p>
        )}
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
