'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/lib/mockData'

interface Props {
  category: Category
  large?: boolean
}

export default function CategoryCard({ category, large }: Props) {
  return (
    <Link
      href={`/category?cat=${category.id}`}
      className={`group relative overflow-hidden rounded-xl block ${large ? 'aspect-[4/3]' : 'aspect-square'}`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-noir-950/90 via-noir-950/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className={`font-serif italic text-noir-50 mb-1 ${large ? 'text-2xl' : 'text-lg'}`}>{category.name}</h3>
        <p className="text-xs text-noir-300">{category.count} products</p>
        <span className="inline-flex items-center gap-1 text-xs text-rose mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Explore <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}
