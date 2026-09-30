'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { Product } from '@/lib/data'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0] || '/placeholder.jpg'
  const makerName = product.maker?.name || 'Unknown Maker'
  
  return (
    <Link 
      href={`/product/${product.slug || product.id}`}
      className="group card-glass overflow-hidden hover:border-rose/30 transition-colors"
    >
      <div className="aspect-square overflow-hidden bg-noir-900">
        <img 
          src={image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-rose-muted mb-1">{makerName}</p>
        <h3 className="font-medium text-noir-100 group-hover:text-noir-50 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-rose text-rose" />
            <span className="text-sm text-noir-300">{product.rating}</span>
          </div>
          <span className="text-xs text-noir-500">({product.review_count})</span>
        </div>
        <p className="text-lg font-medium text-noir-50 mt-2">${product.price}</p>
        {product.badge && (
          <span className="inline-block mt-2 bg-rose-dark/20 text-rose text-xs px-2 py-0.5 rounded">
            {product.badge}
          </span>
        )}
      </div>
    </Link>
  )
}
