'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

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
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm text-noir-300 hover:text-noir-50 transition-colors">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-sm text-rose hover:text-rose-light transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                    <div className="flex items-center gap-2 text-sm text-noir-200">
                      <User size={16} />
                      <span className="max-w-[100px] truncate">
                        {profile?.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm text-rose hover:text-rose-light transition-colors">
                      Sign In
                    </Link>
                    <Link href="/maker/signup" className="btn-primary text-xs py-2 px-4">
                      Sell on Floggers
                    </Link>
                  </>
                )}
              </>
            )}
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
          
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-noir-300 hover:text-noir-50 py-2">Dashboard</Link>
                  <button
                    onClick={() => { handleSignOut(); setOpen(false); }}
                    className="block text-rose hover:text-rose-light py-2 w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="block text-rose hover:text-rose-light py-2">Sign In</Link>
                  <Link href="/maker/signup" onClick={() => setOpen(false)} className="block btn-primary text-center text-xs py-2.5 mt-2">Sell on Floggers</Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  )
}
