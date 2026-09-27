'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-noir-950/90 backdrop-blur-md border-b border-noir-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-serif italic tracking-wide text-noir-50">Floggers</span>
            <span className="text-[10px] uppercase tracking-widest text-rose-muted border border-rose-muted/30 px-1.5 py-0.5 rounded">Marketplace</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/category" className="text-sm text-noir-300 hover:text-noir-50 transition-colors">Browse</Link>
            <Link href="/makers" className="text-sm text-noir-300 hover:text-noir-50 transition-colors">Makers</Link>
            <Link href="/cart" className="flex items-center gap-2 text-sm text-noir-300 hover:text-noir-50 transition-colors">
              <ShoppingBag size={18} />
              <span>Cart</span>
            </Link>
            <Link href="/login" className="text-sm text-rose hover:text-rose-light transition-colors">
              Sign In
            </Link>
            <Link href="/maker/signup" className="btn-primary text-xs py-2 px-4">
              Sell on Floggers
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-noir-300 hover:text-noir-50">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-noir-800/50 bg-noir-950 px-4 pb-4 space-y-3">
          <Link href="/category" onClick={() => setOpen(false)} className="block text-noir-300 hover:text-noir-50 py-2">Browse</Link>
          <Link href="/makers" onClick={() => setOpen(false)} className="block text-noir-300 hover:text-noir-50 py-2">Makers</Link>
          <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 text-noir-300 hover:text-noir-50 py-2">
            <ShoppingBag size={18} /> Cart
          </Link>
        </div>
      )}
    </nav>
  )
}
