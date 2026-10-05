'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'

/**
 * Context-aware floater pill.
 *
 * When on the public marketplace → shows "Maker Dashboard" → goes to /dashboard
 * When inside the dashboard → shows "Buyer Marketplace" → goes to /
 */
export default function MakerDashboardFloater() {
  const { user } = useAuth()
  const pathname = usePathname()

  // Only show when logged in
  if (!user) return null

  const isInDashboard = pathname?.startsWith('/dashboard')

  if (isInDashboard) {
    return (
      <Link
        href="/"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-rose text-noir-950 rounded-full text-sm font-medium shadow-lg hover:bg-rose-light transition-colors"
      >
        <Store size={18} />
        <span>Buyer Marketplace</span>
      </Link>
    )
  }

  return (
    <Link
      href="/dashboard"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-rose text-noir-950 rounded-full text-sm font-medium shadow-lg hover:bg-rose-light transition-colors"
    >
      <LayoutDashboard size={18} />
      <span>Maker Dashboard</span>
    </Link>
  )
}
