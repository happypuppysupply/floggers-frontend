'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, LogOut, Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [favCount, setFavCount] = useState(0)
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      loadCounts()
    }
  }, [user])

  const loadCounts = async () => {
    const supabase = createClient()
    const [{ count: cartC }, { count: favC }] = await Promise.all([
      supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id),
      supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
    ])
    
    setCartCount(cartC || 0)
    setFavCount(favC || 0)
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 bg-noir-950/90 backdrop-blur-md border-b border-noir-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size={28} showText={true} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/category" className="text-sm text-noir-300 hover:text-noir-50 transition-colors">Browse</Link>
            <Link href="/makers" className="text-sm text-noir-300 hover:text-noir-50 transition-colors">Makers</Link>
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/favorites" className="flex items-center gap-1.5 text-sm text-noir-300 hover:text-noir-50 transition-colors relative">
                      <div className="relative">
                        <Heart size={16} />
                        {favCount > 0 && (
                          <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {favCount > 99 ? '99+' : favCount}
                          </span>
                        )}
                      </div>
                      <span>Favorites</span>
                    </Link>
                    <Link href="/chat" className="flex items-center gap-1.5 text-sm text-noir-300 hover:text-noir-50 transition-colors">
                      <MessageCircle size={16} /> Chat
                    </Link>
                    <Link href="/cart" className="flex items-center gap-2 text-sm text-noir-300 hover:text-noir-50 transition-colors relative">
                      <div className="relative">
                        <ShoppingBag size={18} />
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </div>
                      <span>Cart</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-sm text-rose hover:text-rose-light transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm text-violet hover:text-violet-light transition-colors">
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
          
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/favorites" onClick={() => setOpen(false)} className="flex items-center gap-2 text-noir-300 hover:text-noir-50 py-2 relative">
                    <div className="relative">
                      <Heart size={16} />
                      {favCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {favCount > 99 ? '99+' : favCount}
                        </span>
                      )}
                    </div>
                    Favorites
                  </Link>
                  <Link href="/chat" onClick={() => setOpen(false)} className="flex items-center gap-2 text-noir-300 hover:text-noir-50 py-2">
                    <MessageCircle size={16} /> Chat
                  </Link>
                  <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 text-noir-300 hover:text-noir-50 py-2 relative">
                    <div className="relative">
                      <ShoppingBag size={18} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </div>
                    Cart
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setOpen(false); }}
                    className="block text-rose hover:text-rose-light py-2 w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="block text-violet hover:text-violet-light py-2">Sign In</Link>
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
