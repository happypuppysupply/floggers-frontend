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
        {/* Stronger background behind icon for visibility on dark header */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-violet/40 to-violet/10 ring-2 ring-violet/30 ring-offset-2 ring-offset-noir-950"
          style={{ transform: 'scale(1.35)' }}
        />
        {/* Inner glow layer */}
        <div 
          className="absolute inset-0 rounded-full bg-violet/20 blur-sm"
          style={{ transform: 'scale(1.2)' }}
        />
        <img 
          src={AI_BOT_AVATAR} 
          alt="Floggers" 
          width={size} 
          height={size}
          className="rounded-full relative z-10"
          style={{ 
            filter: 'drop-shadow(0 0 16px rgba(155, 77, 202, 0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            border: '2px solid rgba(155, 77, 202, 0.4)',
          }}
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
