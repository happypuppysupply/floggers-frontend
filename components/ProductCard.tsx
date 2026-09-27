'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import type { Product } from '@/lib/mockData'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-noir-900 mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-rose-dark/90 text-noir-50 text-xs font-medium px-2.5 py-1 rounded">
            {product.badge}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-rose-muted uppercase tracking-wider">{product.makerName}</p>
        <h3 className="text-sm font-medium text-noir-100 group-hover:text-noir-50 transition-colors leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <Star size={12} className="fill-rose text-rose" />
          <span className="text-xs text-noir-300">{product.rating}</span>
          <span className="text-xs text-noir-500">({product.reviews})</span>
        </div>
        <p className="text-sm font-medium text-noir-50">${product.price}</p>
      </div>
    </Link>
  )
}
