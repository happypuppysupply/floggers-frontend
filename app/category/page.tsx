import { Suspense } from 'react'
import CategoryContent from '@/components/CategoryContent'

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-noir-400">Loading...</div>
    }>
      <CategoryContent />
    </Suspense>
  )
}
