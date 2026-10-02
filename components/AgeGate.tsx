'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const AGE_GATE_KEY = 'floggers_age_verified'

export default function AgeGate() {
  const [showGate, setShowGate] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if user has already verified age
    const verified = localStorage.getItem(AGE_GATE_KEY)
    if (!verified) {
      setShowGate(true)
      setIsAnimating(true)
    }
  }, [])

  const handleEnter = () => {
    localStorage.setItem(AGE_GATE_KEY, 'true')
    setIsAnimating(false)
    setTimeout(() => setShowGate(false), 300)
  }

  const handleExit = () => {
    window.location.href = 'https://www.google.com'
  }

  if (!showGate) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="font-serif italic text-4xl text-noir-50">
            Floggers
            <span className="inline-block ml-2 px-2 py-0.5 bg-rose text-black text-xs font-sans not-italic rounded">
              18+
            </span>
          </h1>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-medium text-noir-50 mb-4">
          This is an adult website
        </h2>

        {/* Notice to Users */}
        <div className="mb-6">
          <span className="inline-block px-4 py-1.5 border border-noir-600 rounded-full text-sm text-noir-300 mb-4">
            Notice to Users
          </span>
          <p className="text-sm text-noir-300 leading-relaxed px-4">
            This website is an adults-only marketplace for BDSM & kink products.
            By entering, you affirm that you are at least 18 years of age or the 
            age of majority in the jurisdiction you are accessing the website from.
            All products sold here are intended for consenting adults.
          </p>
        </div>

        {/* Notice to Law Enforcement */}
        <p className="text-sm text-rose mb-8">
          Notice to Law Enforcement
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleEnter}
            className="w-full max-w-xs mx-auto block px-6 py-3 border border-noir-500 rounded-full text-sm text-noir-100 hover:bg-noir-800 hover:border-noir-400 transition-colors"
          >
            I am 18 or older - Enter
          </button>
          <button
            onClick={handleExit}
            className="w-full max-w-xs mx-auto block px-6 py-3 border border-noir-500 rounded-full text-sm text-noir-100 hover:bg-noir-800 hover:border-noir-400 transition-colors"
          >
            I am under 18 - Exit
          </button>
        </div>

        {/* Parental Controls */}
        <div className="border-t border-noir-800 pt-6">
          <h3 className="text-sm font-medium text-noir-200 mb-2">Parental Controls</h3>
          <p className="text-xs text-noir-400 mb-1">
            Visit our{' '}
            <Link href="/parental-controls" className="text-rose hover:underline">
              Parental Controls page
            </Link>
            {' '}for step-by-step guidance on blocking access to this website.
          </p>
        </div>

        {/* Terms of Service */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-rose mb-2">Terms of Service</h3>
          <p className="text-xs text-noir-400">
            By entering, you agree to our{' '}
            <Link href="/terms" className="text-rose hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-rose hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
