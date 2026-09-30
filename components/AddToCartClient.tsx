'use client'

import { useState } from 'react'
import { Heart, Minus, Plus, Check, Loader2 } from 'lucide-react'
import { Product } from '@/lib/data'
import { useAuth } from '@/lib/auth/AuthProvider'
import { addToCart } from '@/lib/data'

interface AddToCartClientProps {
  product: Product
}

export default function AddToCartClient({ product }: AddToCartClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const addToCartHandler = async () => {
    setAnimating(true)
    setError('')

    if (user) {
      // Logged in - save to Supabase
      const result = await addToCart({
        user_id: user.id,
        product_id: product.id,
        quantity,
      })

      if (!result.success) {
        setError(result.error || 'Failed to add to cart')
        setAnimating(false)
        return
      }
    } else {
      // Guest - save to localStorage
      const cart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
      const existingIdx = cart.findIndex((item: any) => item.id === product.id)
      
      if (existingIdx >= 0) {
        cart[existingIdx].quantity += quantity
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url || product.images?.[0] || '/placeholder.jpg',
          makerName: product.maker?.name || 'Unknown',
          quantity
        })
      }
      
      localStorage.setItem('floggers-cart', JSON.stringify(cart))
    }

    setAdded(true)
    setTimeout(() => {
      setAnimating(false)
      setTimeout(() => setAdded(false), 1500)
    }, 600)
  }

  return (
    <div className="mb-8">
      {error && (
        <div className="bg-rose/20 border border-rose/30 text-rose-light px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm font-medium text-noir-200 mb-2">Quantity</p>
        <div className="inline-flex items-center border border-noir-700 rounded-lg">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
            className="px-3 py-2 text-noir-300 hover:text-noir-100"
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 text-sm text-noir-100 min-w-[40px] text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)} 
            className="px-3 py-2 text-noir-300 hover:text-noir-100"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={addToCartHandler}
          disabled={animating}
          className={`relative btn-primary px-8 transition-all duration-300 overflow-hidden ${added ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
        >
          {animating && (
            <span className="absolute inset-0 flex items-center justify-center bg-rose">
              <Loader2 size={20} className="animate-spin" />
            </span>
          )}
          <span className={`inline-flex items-center gap-2 transition-transform ${animating ? 'translate-y-10' : 'translate-y-0'}`}>
            {added ? <><Check size={18} /> Added</> : 'Add to Cart'}
          </span>
        </button>
        <button className="btn-secondary flex items-center gap-2">
          <Heart size={18} /> Save
        </button>
      </div>
      
      {!user && (
        <p className="text-xs text-noir-500 mt-4">
          You can checkout as a guest, or <a href="/signup" className="text-rose hover:underline">create an account</a> to save your cart
        </p>
      )}
    </div>
  )
}
