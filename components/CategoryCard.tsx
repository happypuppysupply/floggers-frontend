'use client'

import Link from 'next/link'
import { Category } from '@/lib/data'

interface CategoryCardProps {
  category: Category
  large?: boolean
}

export default function CategoryCard({ category, large = false }: CategoryCardProps) {
  return (
    <Link 
      href={`/category/${category.id}`}
      className={`group relative overflow-hidden rounded-xl ${
        large ? 'aspect-[4/3]' : 'aspect-square'
      }`}
    >
      <img 
        src={category.image_url} 
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <h3 className="font-serif italic text-xl md:text-2xl text-white mb-1">
          {category.name}
        </h3>
        <p className="text-sm text-white/70">
          {category.product_count || 0} products
        </p>
      </div>
    </Link>
  )
}
