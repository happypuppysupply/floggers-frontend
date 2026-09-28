'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Upload, CheckCircle } from 'lucide-react'

const categories = ['Floggers', 'Paddles', 'Crops & Canes', 'Restraints & Cuffs', 'Collars & Leashes', 'Accessories']

export default function AddProductPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    materials: [''],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  const addMaterial = () => setForm({ ...form, materials: [...form.materials, ''] })
  const removeMaterial = (i: number) => setForm({ ...form, materials: form.materials.filter((_, idx) => idx !== i) })
  const updateMaterial = (i: number, val: string) => {
    const updated = [...form.materials]
    updated[i] = val
    setForm({ ...form, materials: updated })
  }

  if (submitted) {
    return (
      <div className="p-8">
        <div className="max-w-xl mx-auto text-center card-glass p-8">
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-6" />
          <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Product Listed!</h1>
          <p className="text-noir-300 mb-2">Your product has been added to your shop.</p>
          <p className="text-sm text-noir-400 mb-6">It is now live and available for purchase.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/products/new" className="btn-secondary">Add Another</Link>
            <Link href="/dashboard/products" className="btn-primary">View Products</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-noir-200 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="card-glass p-8">
          <div className="mb-6">
            <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Add New Product</h1>
            <p className="text-sm text-noir-400">List a new item in your shop</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-rose' : 'bg-noir-800'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-rose' : 'bg-noir-800'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 3 ? 'bg-rose' : 'bg-noir-800'}`} />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-2">Basic Info</h2>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Product Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="e.g., The Sovereign Flogger"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Category</label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Price ($)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                      placeholder="185.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={e => setForm({ ...form, stock: e.target.value })}
                      className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                      placeholder="10"
                    />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-4">Continue</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-2">Description & Materials</h2>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50 resize-none"
                    placeholder="Describe your product, materials, and craftsmanship..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Materials</label>
                  <div className="space-y-2">
                    {form.materials.map((m, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={m}
                          onChange={e => updateMaterial(i, e.target.value)}
                          className="flex-1 bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                          placeholder={i === 0 ? 'e.g., Full-grain Italian leather' : `Material ${i + 1}`}
                        />
                        {form.materials.length > 1 && (
                          <button type="button" onClick={() => removeMaterial(i)} className="p-2 text-noir-500 hover:text-rose transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addMaterial} className="flex items-center gap-1 text-xs text-rose hover:text-rose-light mt-2 transition-colors">
                    <Plus size={14} /> Add Material
                  </button>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-2">Photos</h2>
                <p className="text-xs text-noir-400">Upload up to 5 photos. First image will be the cover.</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-noir-700">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-noir-950/80 rounded-full flex items-center justify-center text-noir-300 hover:text-rose">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        // Mock image upload — in production this would open a file picker
                        const mockImage = `https://images.unsplash.com/photo-${[1615460549969, 1589829085413, 1516975080664, 1523275335684, 1559563362][images.length]}?w=300&h=300&fit=crop`
                        setImages([...images, mockImage])
                      }}
                      className="aspect-square rounded-lg border-2 border-dashed border-noir-700 flex flex-col items-center justify-center gap-1 hover:border-rose/50 transition-colors"
                    >
                      <Upload size={20} className="text-noir-500" />
                      <span className="text-xs text-noir-500">Add Photo</span>
                    </button>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Publishing...' : 'Publish Product'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
