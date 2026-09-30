'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Store, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function BecomeSellerFloater() {
  const { user, profile, loading: authLoading } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaker, setIsMaker] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const checkMakerStatus = async () => {
      // Don't show if still loading auth
      if (authLoading) return
      
      // Show to guests AND non-makers
      if (!user) {
        // Guest - show floater with sign up message
        const dismissed = localStorage.getItem('floggers-seller-floater-dismissed')
        const dismissedTime = dismissed ? parseInt(dismissed) : 0
        const oneWeek = 7 * 24 * 60 * 60 * 1000
        
        if (!dismissed || Date.now() - dismissedTime > oneWeek) {
          setIsVisible(true)
        }
        setChecked(true)
        return
      }

      // Check if user is already a maker
      const supabase = createClient()
      const { data: maker } = await supabase
        .from('makers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle()

      setIsMaker(!!maker)
      
      // Show floater if user is logged in and not a maker
      if (!maker) {
        // Check if user has dismissed it before (using localStorage)
        const dismissed = localStorage.getItem('floggers-seller-floater-dismissed')
        const dismissedTime = dismissed ? parseInt(dismissed) : 0
        const oneWeek = 7 * 24 * 60 * 60 * 1000
        
        if (!dismissed || Date.now() - dismissedTime > oneWeek) {
          setIsVisible(true)
        }
      }
      
      setChecked(true)
    }

    checkMakerStatus()
  }, [user, authLoading])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('floggers-seller-floater-dismissed', Date.now().toString())
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Don't render if still checking or shouldn't show
  if (!checked || !isVisible || isMaker) {
    return null
  }

  const isGuest = !user
  const buttonText = isGuest ? 'Join & Start Selling' : 'Apply to Sell'
  const buttonHref = isGuest ? '/signup' : '/maker/signup'
  const subtitle = isGuest 
    ? 'Create an account and join hundreds of makers selling handcrafted BDSM gear.'
    : 'Join hundreds of independent makers selling handcrafted floggers, paddles, and BDSM gear.'

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleMinimize}
          className="bg-gradient-to-r from-rose to-rose-dark text-white p-4 rounded-full shadow-lg shadow-rose/30 hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Store size={20} />
          <span className="font-medium text-sm">Sell on Floggers</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="bg-noir-900/95 backdrop-blur-sm border border-rose/30 rounded-2xl shadow-2xl shadow-rose/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose to-rose-dark px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-white" />
            <span className="font-medium text-white text-sm">Become a Seller</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMinimize}
              className="text-white/70 hover:text-white p-1"
              title="Minimize"
            >
              <span className="text-xs">−</span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white p-1"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-serif italic text-lg text-noir-50 mb-2">
            Turn your craft into income
          </h3>
          <p className="text-sm text-noir-400 mb-4">
            {subtitle}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-noir-300">
              <div className="w-1.5 h-1.5 bg-rose rounded-full" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-noir-300">
              <div className="w-1.5 h-1.5 bg-rose rounded-full" />
              <span>Keep 90% of every sale</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-noir-300">
              <div className="w-1.5 h-1.5 bg-rose rounded-full" />
              <span>Discreet shipping tools included</span>
            </div>
          </div>

          <Link
            href={buttonHref}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            onClick={() => setIsVisible(false)}
          >
            {buttonText}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
