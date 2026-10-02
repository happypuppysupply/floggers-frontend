import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-noir-800/50 bg-noir-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif italic text-lg text-noir-50 mb-4">Floggers</h3>
            <p className="text-sm text-noir-400 leading-relaxed">
              The marketplace for independent BDSM artisans. Discover handcrafted gear from makers who live the lifestyle.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-noir-200 mb-4 uppercase tracking-wider">Discover</h4>
            <ul className="space-y-2">
              <li><Link href="/category" className="text-sm text-noir-400 hover:text-noir-200 transition-colors">All Categories</Link></li>
              <li><Link href="/makers" className="text-sm text-noir-400 hover:text-noir-200 transition-colors">Explore Makers</Link></li>
              <li><span className="text-sm text-noir-500">New Arrivals (coming soon)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-noir-200 mb-4 uppercase tracking-wider">Trust & Safety</h4>
            <ul className="space-y-2">
              <li><Link href="/age-verification" className="text-sm text-noir-400 hover:text-noir-200 transition-colors">Age-verified marketplace</Link></li>
              <li><Link href="/discreet-shipping" className="text-sm text-noir-400 hover:text-noir-200 transition-colors">Discreet shipping on all orders</Link></li>
              <li><Link href="/maker-verification" className="text-sm text-noir-400 hover:text-noir-200 transition-colors">Maker verification program</Link></li>
              <li><Link href="/community-guidelines" className="text-sm text-noir-400 hover:text-noir-200 transition-colors">Community guidelines</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-noir-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-noir-500">This is a design proposal. No actual transactions are processed.</p>
          <p className="text-xs text-noir-500">© 2024 Floggers Marketplace Proposal</p>
        </div>
      </div>
    </footer>
  )
}
