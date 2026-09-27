import Link from 'next/link'
import { Star, MapPin, Calendar, ArrowLeft, Package } from 'lucide-react'
import { getMakerById, getProductsByMaker, makers } from '@/lib/mockData'
import ProductCard from '@/components/ProductCard'

export function generateStaticParams() {
  return makers.map(m => ({ id: m.id }))
}

export default function MakerPage({ params }: { params: { id: string } }) {
  const maker = getMakerById(params.id)
  const products = maker ? getProductsByMaker(maker.id) : []

  if (!maker) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl text-noir-200 mb-4">Maker not found</h1>
        <Link href="/makers" className="btn-primary">Explore Makers</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/makers" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Makers
      </Link>

      {/* Maker Header */}
      <div className="card-glass p-8 md:p-10 mb-12">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <img src={maker.image} alt={maker.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-noir-700" />
          <div className="flex-1">
            <h1 className="font-serif italic text-3xl md:text-4xl text-noir-50 mb-2">{maker.name}</h1>
            <p className="text-rose-muted text-sm mb-4">{maker.tagline}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-noir-400 mb-4">
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {maker.location}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Since {maker.since}</span>
              <span className="flex items-center gap-1.5"><Package size={14} /> {maker.products} products</span>
              <span className="flex items-center gap-1"><Star size={14} className="fill-rose text-rose" /> {maker.rating}</span>
            </div>
            <p className="text-noir-300 leading-relaxed max-w-2xl">{maker.bio}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="font-serif italic text-2xl text-noir-50 mb-2">Products by {maker.name}</h2>
        <p className="text-noir-400 mb-8">{products.length} items available</p>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-noir-400 py-12 text-center">No products listed yet.</p>
        )}
      </div>
    </div>
  )
}
