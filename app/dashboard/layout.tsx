'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings,
  Store,
  MessageCircle,
  LogOut,
  ChevronRight,
  Wallet,
  Menu,
  X,
  Loader2
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/import', label: 'Import Store', icon: Store },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const [makerInfo, setMakerInfo] = useState<{ name: string; isVerified: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  // Load maker info
  useEffect(() => {
    const loadMaker = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      
      // Try to get maker record
      const { data: maker } = await supabase
        .from('makers')
        .select('name, is_verified')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (maker) {
        setMakerInfo({ name: maker.name, isVerified: maker.is_verified })
      } else {
        // Check for pending application
        const { data: app } = await supabase
          .from('maker_applications')
          .select('shop_name, status')
          .eq('user_id', user.id)
          .maybeSingle()

        if (app) {
          setMakerInfo({ name: app.shop_name, isVerified: app.status === 'approved' })
        }
      }

      setLoading(false)
    }

    loadMaker()
  }, [user])

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-noir-900 border-r border-noir-800/50 
        flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 border-b border-noir-800/50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-serif italic text-noir-50">Floggers</span>
            <span className="text-[10px] uppercase tracking-widest text-rose-muted border border-rose-muted/30 px-1.5 py-0.5 rounded">Maker</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-noir-400 hover:text-noir-200"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            // Fix: Only show as active if it's an exact match OR if it starts with the href (but not just /dashboard for sub-pages)
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-rose-dark/20 text-rose border border-rose/20' 
                    : 'text-noir-300 hover:bg-noir-800/50 hover:text-noir-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-noir-800/50">
          <div className="flex items-center gap-3 mb-4 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-noir-700 flex items-center justify-center">
              {loading ? (
                <Loader2 size={16} className="text-noir-200 animate-spin" />
              ) : (
                <span className="text-sm font-medium text-noir-200">
                  {(makerInfo?.name || user?.email?.[0] || 'M').toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-noir-200 truncate">
                {loading ? 'Loading...' : (makerInfo?.name || 'Your Shop')}
              </p>
              <div className="flex items-center gap-1">
                {makerInfo ? (
                  makerInfo.isVerified ? (
                    <span className="text-xs text-emerald-400">Verified Maker</span>
                  ) : (
                    <span className="text-xs text-amber-400">Pending Approval</span>
                  )
                ) : (
                  <span className="text-xs text-noir-500">Maker</span>
                )}
              </div>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-noir-400 hover:text-noir-200 transition-colors">
            <LogOut size={18} />
            Log Out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-noir-900/95 backdrop-blur border-b border-noir-800/50 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-serif italic text-noir-50">Floggers</span>
            <span className="text-[10px] uppercase tracking-widest text-rose-muted border border-rose-muted/30 px-1.5 py-0.5 rounded">Maker</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-noir-200 hover:text-rose transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
