'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, CreditCard, Truck, Package } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  makerName: string
  price: number
  image: string
  variant: string | null
  quantity: number
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping')
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '', country: 'US' })

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('floggers-cart') || '[]')
    setItems(cart)
  }, [])

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal > 150 ? 0 : 12
  const total = subtotal + shipping

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
        <CheckCircle size={64} className="text-rose mx-auto mb-6" />
        <h1 className="font-serif italic text-3xl text-noir-50 mb-4">Order Confirmed</h1>
        <p className="text-noir-300 mb-2">Thank you for your order! This is a design proposal — no actual transaction has occurred.</p>
        <p className="text-noir-400 mb-8 text-sm">In a real marketplace, you would receive an email confirmation with tracking details.</p>
        <div className="card-glass p-6 mb-8 text-left">
          <p className="text-sm text-noir-400 mb-1">Order total</p>
          <p className="text-2xl font-medium text-noir-50">${total}</p>
          <p className="text-xs text-noir-500 mt-2">Discreet shipping to your address • Estimated delivery 5–7 days</p>
        </div>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          Continue Shopping
        </Link>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-noir-300 mb-1">Full Name</label>
                  <input type="text" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-noir-300 mb-1">Email</label>
                  <input type="email" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="jane@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-noir-300 mb-1">Street Address</label>
                  <input type="text" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="123 Discreet Lane" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">City</label>
                  <input type="text" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="Portland" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">ZIP Code</label>
                  <input type="text" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="97201" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
                </div>
              </div>
              <button onClick={() => setStep('payment')} className="btn-primary mt-8 inline-flex items-center gap-2">
                Continue to Payment <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="card-glass p-8">
              <h2 className="text-lg font-medium text-noir-100 mb-6">Payment Method</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-rose bg-rose-dark/10">
                  <CreditCard size={20} className="text-rose" />
                  <span className="text-sm text-noir-200">Credit / Debit Card (mock)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-noir-300 mb-1">Card Number</label>
                    <input type="text" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Expiry</label>
                    <input type="text" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="MM / YY" />
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">CVC</label>
                    <input type="text" className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50" placeholder="123" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('shipping')} className="btn-secondary">Back</button>
                <button onClick={() => { localStorage.removeItem('floggers-cart'); setStep('success') }} className="btn-primary">Place Order</button>
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
                  <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-noir-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-noir-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs text-noir-200">${item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-noir-800 pt-4">
              <div className="flex justify-between text-noir-300">
                <span>Subtotal</span><span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-noir-300">
                <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between font-medium text-noir-50 pt-2">
                <span>Total</span><span>${total}</span>
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
