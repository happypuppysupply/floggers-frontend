'use client'

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const image = product.image_url || product.images?.[0] || '/placeholder.jpg';

  if (compact) {
    return (
      <Link 
        href={`/product/${product.slug || product.id}`} 
        className="group"
      >
        <div className="relative overflow-hidden rounded-xl mb-3">
          <img
            src={image}
            alt={product.name}
            className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button 
            className="absolute top-2 right-2 p-2 rounded-full bg-noir-950/60 text-noir-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart size={16} />
          </button>
        </div>
        <h3 className="text-sm text-noir-200 truncate group-hover:text-rose transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-noir-500 truncate mb-1">{product.maker?.name}</p>
        <p className="text-sm font-medium text-noir-50">${product.price}</p>
      </Link>
    );
  }

  return (
    <Link 
      href={`/product/${product.slug || product.id}`} 
      className="group card-glass rounded-2xl overflow-hidden block"
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button 
          className="absolute top-3 right-3 p-2.5 rounded-full bg-noir-950/60 text-noir-400 hover:text-rose transition-colors"
        >
          <Heart size={18} />
        </button>
      </div>
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-rose-muted mb-1.5">
          {product.category?.name || 'Flogger'}
        </p>
        <h3 className="text-lg font-serif italic text-noir-50 mb-1 group-hover:text-rose transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-noir-400 mb-3">{product.maker?.name}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium text-noir-50">${product.price}</p>
          {product.rating && (
            <div className="flex items-center gap-1 text-sm text-noir-400">
              <span className="text-amber-400">★</span>
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-noir-600">({product.sales_count || 0})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
