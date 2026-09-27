'use client'

import { useState } from 'react'
import { ExternalLink, Upload, CheckCircle, Loader2, ShoppingBag, Package } from 'lucide-react'

const platforms = [
  { id: 'etsy', name: 'Etsy', description: 'Import from your Etsy shop', icon: ShoppingBag },
  { id: 'shopify', name: 'Shopify', description: 'Import from your Shopify store', icon: Package },
  { id: 'csv', name: 'CSV Upload', description: 'Import via spreadsheet', icon: Upload },
]

export default function ImportPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const handleImport = () => {
    if (!selected) return
    setLoading(true)
    setProgress(0)

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setLoading(false)
          setCompleted(true)
          setImportedCount(47)
          return 100
        }
        return p + Math.random() * 15
      })
    }, 500)
  }

  if (completed) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto card-glass p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Import Complete!</h1>
          <p className="text-noir-300 mb-2">
            Successfully imported <span className="text-noir-100 font-medium">{importedCount} products</span> from {selected === 'csv' ? 'CSV' : selected === 'etsy' ? 'Etsy' : 'Shopify'}.
          </p>
          <p className="text-sm text-noir-400 mb-6">
            Your products are now in draft mode. Review and publish them when you're ready.
          </p>
          <div className="flex gap-3">
            <a href="/dashboard/products" className="btn-primary flex-1">
              Review Products
            </a>
            <button onClick={() => { setCompleted(false); setSelected(null); setProgress(0) }} className="btn-secondary flex-1">
              Import More
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Import Store</h1>
        <p className="text-sm text-noir-400">Import products from your existing store</p>
      </div>

      {!selected ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <button
                key={platform.id}
                onClick={() => setSelected(platform.id)}
                className="card-glass p-6 text-left hover:bg-noir-800/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-noir-800 flex items-center justify-center group-hover:bg-rose-dark/20 transition-colors">
                    <Icon size={24} className="text-noir-300 group-hover:text-rose transition-colors" />
                  </div>
                  <ExternalLink size={16} className="text-noir-500" />
                </div>
                <h3 className="font-medium text-noir-100 mb-1">{platform.name}</h3>
                <p className="text-sm text-noir-400">{platform.description}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="max-w-md">
          <button
            onClick={() => { setSelected(null); setProgress(0) }}
            className="text-sm text-rose hover:text-rose-light mb-4 transition-colors"
          >
            ← Back to platforms
          </button>

          <div className="card-glass p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-dark/20 flex items-center justify-center">
                {selected === 'etsy' ? <ShoppingBag size={20} className="text-rose" /> :
                 selected === 'shopify' ? <Package size={20} className="text-rose" /> :
                 <Upload size={20} className="text-rose" />}
              </div>
              <div>
                <h3 className="font-medium text-noir-100">
                  Connect {selected === 'csv' ? 'CSV File' : selected === 'etsy' ? 'Etsy' : 'Shopify'}
                </h3>
                <p className="text-xs text-noir-400">Step 1 of 2</p>
              </div>
            </div>

            {selected === 'csv' ? (
              <div className="border-2 border-dashed border-noir-700 rounded-xl p-8 text-center mb-6 hover:border-rose/50 transition-colors cursor-pointer">
                <Upload size={32} className="text-noir-500 mx-auto mb-3" />
                <p className="text-sm text-noir-300 mb-1">Drag and drop your CSV file here</p>
                <p className="text-xs text-noir-500">or click to browse</p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-noir-300 mb-1">
                    {selected === 'etsy' ? 'Etsy Shop URL' : 'Shopify Store URL'}
                  </label>
                  <input
                    type="text"
                    placeholder={selected === 'etsy' ? 'https://www.etsy.com/shop/...' : 'your-store.myshopify.com'}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">API Key</label>
                  <input
                    type="password"
                    placeholder="Enter your API key"
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  />
                </div>
              </div>
            )}

            {!loading ? (
              <button
                onClick={handleImport}
                className="btn-primary w-full"
              >
                Start Import
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-noir-300">Importing products...</span>
                  <span className="text-noir-100 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-noir-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-noir-500">This may take a few minutes...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
