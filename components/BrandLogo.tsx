'use client'

import { AI_BOT_AVATAR } from '@/lib/ai'

interface BrandLogoProps {
  size?: number
  showText?: boolean
  className?: string
  animated?: boolean
}

export default function BrandLogo({ size = 32, showText = true, className = '', animated = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${animated ? 'avatar-loader' : ''}`}>
        {/* White circular background for visibility on dark header */}
        <div className="absolute inset-0 rounded-full bg-white" style={{ transform: 'scale(1.15)' }} />
        <img 
          src={AI_BOT_AVATAR} 
          alt="Floggers" 
          width={size} 
          height={size}
          className="rounded-full relative z-10"
        />
        {animated && (
          <div className="absolute inset-0 rounded-full border-2 border-violet/40 animate-ping z-20" style={{ animationDuration: '2s' }} />
        )}
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-serif italic tracking-wide text-noir-50 leading-none">
            Floggers
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-violet-muted">
            Marketplace
          </span>
        </div>
      )}
    </div>
  )
}
