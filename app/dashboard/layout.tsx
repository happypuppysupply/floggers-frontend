'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings,
  Store,
  LogOut,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/import', label: 'Import Store', icon: Store },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-noir-900 border-r border-noir-800/50 flex flex-col fixed h-full">
        <div className="p-6 border-b border-noir-800/50">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-serif italic text-noir-50">Floggers</span>
            <span className="text-[10px] uppercase tracking-widest text-rose-muted border border-rose-muted/30 px-1.5 py-0.5 rounded">Maker</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
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
              <span className="text-sm font-medium text-noir-200">BR</span>
            </div>
            <div>
              <p className="text-sm font-medium text-noir-200">Black Raven</p>
              <p className="text-xs text-noir-500">Maker</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-noir-400 hover:text-noir-200 transition-colors">
            <LogOut size={18} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}
