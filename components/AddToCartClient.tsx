'use client'

import { useState } from 'react'
import { Heart, Minus, Plus } from 'lucide-react'
import type { Product } from '@/lib/mockData'

export default function AddToCartClient({ product }: { product: Product }) {
  const [variant, setVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const currentPrice = product.variants ? product.variants[variant].price : product.price

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
    const existing = cart.find((item: any) => item.id === product.id && item.variant === variant)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        makerName: product.makerName,
        price: currentPrice,
        image: product.image,
        variant: product.variants ? product.variants[variant].label : null,
        quantity,
      })
    }
    localStorage.setItem('floggers-cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {product.variants && (
        <div className="mb-6">
          <p className="text-sm font-medium text-noir-200 mb-2">Variant</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <button
                key={i}
                onClick={() => { setVariant(i); setQuantity(1) }}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${variant === i ? 'border-rose text-rose bg-rose-dark/10' : 'border-noir-700 text-noir-300 hover:border-noir-500'}`}
              >
                {v.label} — ${v.price}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm font-medium text-noir-200 mb-2">Quantity</p>
        <div className="inline-flex items-center border border-noir-700 rounded-lg">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-noir-300 hover:text-noir-100">
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 text-sm text-noir-100 min-w-[40px] text-center">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-noir-300 hover:text-noir-100">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={addToCart} className={`btn-primary px-8 ${added ? 'bg-rose' : ''}`}>
          {added ? 'Added to Cart' : 'Add to Cart'}
        </button>
        <button className="btn-secondary flex items-center gap-2">
          <Heart size={18} /> Save
        </button>
      </div>
    </>
  )
}
