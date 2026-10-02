import Link from 'next/link'
import { Package, Truck, ShieldCheck, Box } from 'lucide-react'

export const metadata = {
  title: 'Discreet Shipping — Floggers',
  description: 'Your privacy matters. Learn how we ship orders discreetly.',
}

export default function DiscreetShippingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center mx-auto mb-6">
          <Package size={32} className="text-rose" />
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl text-noir-50 mb-4">
          Discreet Shipping
        </h1>
        <p className="text-lg text-noir-300 max-w-2xl mx-auto">
          Every order ships in plain, unmarked packaging. No logos, no product names, no indication of contents. Your privacy is guaranteed.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <Box size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Plain Packaging</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            All orders are packed in neutral boxes or padded mailers with no branding, return address labels only showing our fulfillment center — never "Floggers" or adult content references.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <Truck size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Generic Shipping Labels</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            Shipping labels use a generic sender name. The contents are described only as "novelty items" or "leather goods" on customs forms where required.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <ShieldCheck size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">Secure Fulfillment Centers</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            Products are shipped from professional warehouses. Staff are trained in handling adult products with discretion and respect.
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="w-12 h-12 rounded-lg bg-rose/10 flex items-center justify-center mb-4">
            <Package size={24} className="text-rose" />
          </div>
          <h3 className="text-lg font-medium text-noir-50 mb-2">No Marketing Inserts</h3>
          <p className="text-sm text-noir-400 leading-relaxed">
            We never include promotional materials, catalogs, or branded stickers inside packages. What you receive is exactly what you ordered — nothing more.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="card-glass p-8 md:p-12 mb-16">
        <h2 className="font-serif italic text-2xl text-noir-50 mb-8">Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-noir-200 mb-1">What does the package look like?</h4>
            <p className="text-sm text-noir-400">A plain brown box or padded mailer with a generic return address. No logos, no branding of any kind.</p>
          </div>
          <div>
            <h4 className="font-medium text-noir-200 mb-1">What appears on my credit card statement?</h4>
            <p className="text-sm text-noir-400">Billing appears under our parent company name, not "Floggers."</p>
          </div>
          <div>
            <h4 className="font-medium text-noir-200 mb-1">Do you ship to PO boxes?</h4>
            <p className="text-sm text-noir-400">Yes. We ship to PO boxes, apartments, offices, and private mailboxes with the same discretion.</p>
          </div>
          <div>
            <h4 className="font-medium text-noir-200 mb-1">Is international shipping discreet too?</h4>
            <p className="text-sm text-noir-400">Yes. International orders use the same plain packaging. Customs declarations list generic descriptions like "leather accessories."</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    </div>
  )
}
