'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  makerName: string
  price: number
  image: string
  variant: string | null
  quantity: number
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
    setItems(cart)
    setLoaded(true)
  }, [])

  const updateCart = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem('floggers-cart', JSON.stringify(newItems))
  }

  const changeQty = (idx: number, delta: number) => {
    const updated = [...items]
    updated[idx].quantity = Math.max(1, updated[idx].quantity + delta)
    updateCart(updated)
  }

  const remove = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx)
    updateCart(updated)
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal > 150 ? 0 : 12
  const total = subtotal + shipping

  if (!loaded) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif italic text-3xl text-noir-50 mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-noir-700 mx-auto mb-4" />
          <h2 className="text-xl text-noir-200 mb-2">Your cart is empty</h2>
          <p className="text-noir-400 mb-6">Discover something crafted just for you.</p>
          <Link href="/category" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="card-glass p-5 flex gap-5">
                <Link href={`/product/${item.id}`} className="shrink-0">
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-lg object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/product/${item.id}`} className="font-medium text-noir-100 hover:text-noir-50 transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-xs text-rose-muted mt-0.5">{item.makerName}</p>
                      {item.variant && <p className="text-xs text-noir-500 mt-0.5">{item.variant}</p>}
                    </div>
                    <p className="font-medium text-noir-50 whitespace-nowrap">${item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-noir-700 rounded-lg">
                      <button onClick={() => changeQty(idx, -1)} className="px-2.5 py-1.5 text-noir-400 hover:text-noir-100">
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm text-noir-100">{item.quantity}</span>
                      <button onClick={() => changeQty(idx, 1)} className="px-2.5 py-1.5 text-noir-400 hover:text-noir-100">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => remove(idx)} className="text-noir-500 hover:text-rose transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="card-glass p-6 sticky top-24">
              <h2 className="text-lg font-medium text-noir-100 mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-noir-300">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-noir-300">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-noir-500">Free shipping on orders over $150</p>
                )}
                <div className="border-t border-noir-800 pt-3 flex justify-between font-medium text-noir-50">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full text-center inline-flex justify-center items-center gap-2">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link href="/category" className="block text-center text-sm text-noir-400 hover:text-noir-200 mt-4 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
