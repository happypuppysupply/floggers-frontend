'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getCartItems, updateCartItem, removeFromCart } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

interface CartItem {
  id: string
  quantity: number
  variant_label: string | null
  product: {
    id: string
    name: string
    price: number
    image_url: string
    maker: {
      name: string
    }
  }
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const [localCart, setLocalCart] = useState<any[]>([])

  // Load cart - either from Supabase (logged in) or localStorage (guest)
  useEffect(() => {
    const loadCart = async () => {
      if (authLoading) return
      
      if (user) {
        // Load from Supabase
        const cartItems = await getCartItems(user.id)
        setItems(cartItems)
      } else {
        // Load from localStorage for guests
        const cart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
        // Fetch product details for local cart items
        const supabase = createClient()
        const productIds = cart.map((item: any) => item.id)
        
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price, image_url, maker:makers(name)')
            .in('id', productIds)
          
          const enrichedCart = cart.map((item: any) => {
            const product = products?.find(p => p.id === item.id)
            return {
              id: item.id, // This is the cart item ID for local
              product_id: item.id,
              quantity: item.quantity,
              variant_label: item.variant || null,
              product: product || {
                id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image,
                maker: { name: item.makerName }
              }
            }
          })
          setLocalCart(enrichedCart)
        }
      }
      setLoading(false)
    }
    
    loadCart()
  }, [user, authLoading])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (updating) return
    setUpdating(itemId)
    
    if (user) {
      // Update in Supabase
      await updateCartItem(itemId, newQuantity)
      const updatedItems = await getCartItems(user.id)
      setItems(updatedItems)
    } else {
      // Update localStorage
      const cart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
      const idx = cart.findIndex((i: any) => i.id === itemId)
      if (idx >= 0) {
        cart[idx].quantity = Math.max(1, newQuantity)
        localStorage.setItem('floggers-cart', JSON.stringify(cart))
        setLocalCart(cart)
      }
    }
    
    setUpdating(null)
  }

  const handleRemove = async (itemId: string) => {
    if (user) {
      await removeFromCart(itemId)
      const updatedItems = await getCartItems(user.id)
      setItems(updatedItems)
    } else {
      const cart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
      const updated = cart.filter((i: any) => i.id !== itemId)
      localStorage.setItem('floggers-cart', JSON.stringify(updated))
      setLocalCart(updated)
    }
  }

  const displayItems = user ? items : localCart
  const subtotal = displayItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
  const shipping = subtotal > 150 ? 0 : 12
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-rose animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif italic text-3xl text-noir-50 mb-8">Your Cart</h1>

      {displayItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-noir-700 mx-auto mb-4" />
          <h2 className="text-xl text-noir-200 mb-2">Your cart is empty</h2>
          <p className="text-noir-400 mb-6">Discover something crafted just for you.</p>
          <Link href="/category" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {displayItems.map((item) => (
              <div key={item.id} className="card-glass p-5 flex gap-5">
                <Link href={`/product/${item.product_id || item.product?.id}`} className="shrink-0">
                  <img 
                    src={item.product?.image_url || item.product?.image} 
                    alt={item.product?.name} 
                    className="w-24 h-24 rounded-lg object-cover" 
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link 
                        href={`/product/${item.product_id || item.product?.id}`} 
                        className="font-medium text-noir-100 hover:text-noir-50 transition-colors"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-xs text-rose-muted mt-0.5">{item.product?.maker?.name}</p>
                      {item.variant_label && (
                        <p className="text-xs text-noir-500 mt-0.5">{item.variant_label}</p>
                      )}
                    </div>
                    <p className="font-medium text-noir-50 whitespace-nowrap">
                      ${(item.product?.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-noir-700 rounded-lg">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} 
                        disabled={updating === item.id}
                        className="px-2.5 py-1.5 text-noir-400 hover:text-noir-100 disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm text-noir-100">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} 
                        disabled={updating === item.id}
                        className="px-2.5 py-1.5 text-noir-400 hover:text-noir-100 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)} 
                      className="text-noir-500 hover:text-rose transition-colors"
                    >
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-noir-300">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-noir-500">Free shipping on orders over $150</p>
                )}
                <div className="border-t border-noir-800 pt-3 flex justify-between font-medium text-noir-50">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link 
                href="/checkout" 
                className="btn-primary w-full text-center inline-flex justify-center items-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link 
                href="/category" 
                className="block text-center text-sm text-noir-400 hover:text-noir-200 mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
