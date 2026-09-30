'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowLeft, CreditCard, Truck, Package, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getCartItems, createOrder } from '@/lib/data'
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
    maker_id: string
    maker: {
      name: string
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping')
  const [orderId, setOrderId] = useState<string>('')
  
  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: ''
  })

  // Load cart
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const cartItems = await getCartItems(user.id)
        setItems(cartItems)
      } else {
        // Load guest cart from localStorage
        const localCart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
        if (localCart.length > 0) {
          const supabase = createClient()
          const productIds = localCart.map((item: any) => item.id)
          
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price, image_url, maker_id, maker:makers(name)')
            .in('id', productIds)
          
          const enriched = localCart.map((item: any) => {
            const product = products?.find(p => p.id === item.id)
            return {
              id: item.id,
              quantity: item.quantity,
              variant_label: item.variant || null,
              product: product || {
                id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image,
                maker_id: item.makerId,
                maker: { name: item.makerName }
              }
            }
          })
          setItems(enriched)
        }
      }
      setLoading(false)
    }
    
    loadCart()
  }, [user])

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping = subtotal > 150 ? 0 : 12
  const total = subtotal + shipping

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    
    setPlacingOrder(true)
    
    try {
      const shippingAddress = {
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        phone: form.phone
      }

      if (user) {
        // Logged in user - use their cart
        const result = await createOrder({
          user_id: user.id,
          items: items,
          shipping_address: shippingAddress,
          total: total,
          shipping: shipping
        })
        
        if (result.success && result.orderId) {
          setOrderId(result.orderId)
          setStep('success')
          localStorage.removeItem('floggers-cart')
        }
      } else {
        // Guest checkout - create order items directly
        const supabase = createClient()
        
        // Create a guest profile if needed or use a guest user ID
        // For now, we'll create the order with items directly
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            status: 'pending',
            shipping_address: shippingAddress,
            total_amount: total,
            shipping_cost: shipping,
            email: form.email,
            is_guest: true
          })
          .select()
          .single()
        
        if (!error && order) {
          // Create order items
          const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product.id,
            maker_id: item.product.maker_id,
            quantity: item.quantity,
            price: item.product.price
          }))
          
          await supabase.from('order_items').insert(orderItems)
          
          setOrderId(order.id)
          setStep('success')
          localStorage.removeItem('floggers-cart')
        }
      }
    } catch (err) {
      console.error('Order error:', err)
      alert('Failed to place order. Please try again.')
    }
    
    setPlacingOrder(false)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-center">
          <Loader2 size={32} className="text-rose animate-spin" />
        </div>
      </div>
    )
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl text-noir-200 mb-4">Your cart is empty</h2>
        <Link href="/category" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle size={64} className="text-emerald-400 mx-auto mb-6" />
        <h1 className="font-serif italic text-3xl text-noir-50 mb-4">Order Confirmed</h1>
        <p className="text-noir-300 mb-2">Thank you for your order!</p>
        <p className="text-noir-400 mb-2">Order #{orderId.slice(0, 8)}</p>
        <p className="text-noir-400 mb-8 text-sm">{form.email ? `Confirmation sent to ${form.email}` : 'You will receive an email confirmation shortly.'}</p>
        
        <div className="card-glass p-6 mb-8 text-left">
          <p className="text-sm text-noir-400 mb-1">Order total</p>
          <p className="text-2xl font-medium text-noir-50">${total.toFixed(2)}</p>
          <p className="text-xs text-noir-500 mt-2">Discreet shipping to your address • Estimated delivery 5–7 days</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping
          </Link>
          {!user && (
            <Link href="/signup" className="btn-secondary inline-flex items-center gap-2">
              Create Account
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <div className="flex items-center gap-2 mb-10">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${step === 'shipping' ? 'bg-rose-dark text-noir-50' : 'bg-noir-900 text-noir-400'}`}>
          <Truck size={16} /> Shipping
        </div>
        <div className="w-8 h-px bg-noir-800" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${step === 'payment' ? 'bg-rose-dark text-noir-50' : 'bg-noir-900 text-noir-400'}`}>
          <CreditCard size={16} /> Payment
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <div className="card-glass p-8">
              <h2 className="text-lg font-medium text-noir-100 mb-6">Shipping Information</h2>
              
              {!user && (
                <div className="mb-6 p-4 rounded-lg bg-noir-900/50 border border-noir-700">
                  <p className="text-sm text-noir-300 mb-2">Already have an account?</p>
                  <Link href="/login" className="text-rose hover:text-rose-light text-sm">
                    Sign in for faster checkout
                  </Link>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-noir-300 mb-1">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" 
                    placeholder="you@example.com" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-noir-300 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" 
                    placeholder="Jane Doe" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-noir-300 mb-1">Street Address *</label>
                  <input 
                    type="text" 
                    required
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" 
                    placeholder="123 Discreet Lane" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">City *</label>
                  <input 
                    type="text" 
                    required
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" 
                    placeholder="Portland" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">State/Province *</label>
                  <input 
                    type="text" 
                    required
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" 
                    placeholder="OR" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">ZIP Code *</label>
                  <input 
                    type="text" 
                    required
                    value={form.zip}
                    onChange={e => setForm({ ...form, zip: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" 
                    placeholder="97201" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Country *</label>
                  <select 
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Phone (optional)</label>
                  <input 
                    type="tel" 
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" 
                    placeholder="(555) 123-4567" 
                  />
                </div>
              </div>
              
              <button 
                onClick={() => setStep('payment')} 
                disabled={!form.email || !form.name || !form.address || !form.city || !form.state || !form.zip}
                className="btn-primary mt-8 inline-flex items-center gap-2 disabled:opacity-50"
              >
                Continue to Payment <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="card-glass p-8">
              <h2 className="text-lg font-medium text-noir-100 mb-4">Payment Method</h2>
              
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-400">
                  Payment processing coming soon. For now, orders will be placed and you'll be contacted for payment.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-rose bg-rose-dark/10">
                  <CreditCard size={20} className="text-rose" />
                  <span className="text-sm text-noir-200">Manual Payment (Contact for invoice)</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('shipping')} className="btn-secondary flex-1">Back</button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <><Loader2 size={16} className="animate-spin" /> Placing Order...</>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card-glass p-6 sticky top-24">
            <h2 className="text-sm font-medium text-noir-200 mb-4 uppercase tracking-wider">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.product.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-noir-200 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-noir-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs text-noir-200">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-noir-800 pt-4">
              <div className="flex justify-between text-noir-300">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-noir-300">
                <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-medium text-noir-50 pt-2">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-noir-500">
              <Package size={14} /> Discreet packaging guaranteed
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
