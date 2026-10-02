'use client'

import Link from 'next/link'
import { Package, Truck, Shield, Clock } from 'lucide-react'

interface ProductMessageCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    materials?: string[];
    shipping_cost?: number;
    shipping_time_min?: number;
    shipping_time_max?: number;
    free_shipping_over?: number;
    maker?: {
      name?: string;
    };
  };
}

export default function ProductMessageCard({ product }: ProductMessageCardProps) {
  return (
    <div className="bg-noir-800/70 rounded-xl overflow-hidden border border-noir-700/50 max-w-sm">
      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className="aspect-video bg-noir-700 relative overflow-hidden">
          <img
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-3">
        <Link href={`/product/${product.id}`}>
          <h4 className="text-sm font-medium text-noir-100 hover:text-rose transition-colors line-clamp-1">
            {product.name}
          </h4>
        </Link>
        <p className="text-xs text-noir-400 mt-0.5">{product.maker?.name || 'Unknown'}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-serif italic text-noir-50">${product.price}</span>
          {product.free_shipping_over && product.price >= product.free_shipping_over ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Truck size={12} /> Free shipping
            </span>
          ) : (
            <span className="text-xs text-noir-400">
              ${product.shipping_cost || 0} shipping
            </span>
          )}
        </div>

        {/* Materials */}
        {product.materials && product.materials.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.materials.slice(0, 3).map((material) => (
              <span 
                key={material}
                className="px-1.5 py-0.5 text-[10px] bg-noir-700 rounded text-noir-300"
              >
                {material}
              </span>
            ))}
          </div>
        )}

        {/* Shipping Info */}
        {(product.shipping_time_min || product.shipping_time_max) && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-noir-400">
            <Clock size={10} />
            <span>
              Ships in {product.shipping_time_min || product.shipping_time_max} {product.shipping_time_max && product.shipping_time_min !== product.shipping_time_max ? `- ${product.shipping_time_max}` : ''} days
            </span>
          </div>
        )}

        {/* Link to product */}
        <Link 
          href={`/product/${product.id}`}
          className="mt-2 block text-xs text-rose hover:text-rose-light text-center py-1.5 rounded-lg bg-rose/10 hover:bg-rose/20 transition-colors"
        >
          View Product Details
        </Link>
      </div>
    </div>
  )
}
