'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Upload, CheckCircle, Loader2, Truck, DollarSign, Clock, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

const categories = [
  { id: 'floggers', name: 'Floggers' },
  { id: 'paddles', name: 'Paddles' },
  { id: 'crops-canes', name: 'Crops & Canes' },
  { id: 'restraints', name: 'Restraints & Cuffs' },
  { id: 'collars', name: 'Collars & Leashes' },
  { id: 'accessories', name: 'Accessories' }
]

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export default function AddProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newProductId, setNewProductId] = useState('')
  const [makerVerified, setMakerVerified] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    materials: [''],
    // Shipping fields
    shipping_cost: '',
    shipping_time_min: '',
    shipping_time_max: '',
    free_shipping_over: '',
    ships_from: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to add a product')
      return
    }

    setSubmitting(true)
    setError('')

    const supabase = createClient()

    // Get the maker ID for this user (works even if not yet verified)
    const { data: maker, error: makerError } = await supabase
      .from('makers')
      .select('id, is_verified')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (makerError) {
      console.error('Maker lookup error:', makerError)
      setError('Error looking up your seller account. Please try again.')
      setSubmitting(false)
      return
    }

    if (!maker) {
      // Check if they have a pending application
      const { data: application } = await supabase
        .from('maker_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (application) {
        // Create maker record from application so they can add products
        const slug = user.email?.split('@')[0] || `maker-${Date.now()}`
        const { data: newMaker, error: createError } = await supabase
          .from('makers')
          .insert({
            profile_id: user.id,
            name: 'Your Shop', // Will be updated in settings
            slug: slug,
            is_verified: false,
            is_active: true,
            rating: 0,
            products_count: 0,
          })
          .select()
          .single()
        
        if (createError || !newMaker) {
          setError('You must complete your shop setup in Settings before adding products.')
          setSubmitting(false)
          return
        }
        
        // Use the newly created maker
        setMakerVerified(false)
        
        // Continue with product creation using newMaker
        await createProduct(newMaker.id, newMaker.is_verified)
        return
      } else {
        setError('You must apply to be a seller before adding products. Apply at /maker/signup')
        setSubmitting(false)
        return
      }
    }

    await createProduct(maker.id, maker.is_verified)
  }

  const createProduct = async (makerId: string, isVerified: boolean) => {
    const supabase = createClient()
    setMakerVerified(isVerified)

    // Create slug
    const slug = generateSlug(form.name)
    
    // Filter out empty materials
    const materials = form.materials.filter(m => m.trim() !== '')

    // Insert product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        maker_id: makerId,
        category_id: form.category,
        name: form.name,
        slug: slug,
        description: form.description,
        price: parseFloat(form.price),
        stock_count: parseInt(form.stock),
        materials: materials,
        image_url: images[0] || null,
        images: images.slice(0, 5),
        is_active: maker.is_verified,
        // Shipping fields
        shipping_cost: form.shipping_cost ? parseFloat(form.shipping_cost) : 0,
        shipping_time_min: form.shipping_time_min ? parseInt(form.shipping_time_min) : null,
        shipping_time_max: form.shipping_time_max ? parseInt(form.shipping_time_max) : null,
        free_shipping_over: form.free_shipping_over ? parseFloat(form.free_shipping_over) : null,
        ships_from: form.ships_from || null,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    // Update category product count
    await supabase.rpc('update_category_counts')

    setNewProductId(product.id)
    setSubmitted(true)
    setSubmitting(false)
  }

  const addMaterial = () => setForm({ ...form, materials: [...form.materials, ''] })
  const removeMaterial = (i: number) => setForm({ ...form, materials: form.materials.filter((_, idx) => idx !== i) })
  const updateMaterial = (i: number, val: string) => {
    const updated = [...form.materials]
    updated[i] = val
    setForm({ ...form, materials: updated })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setError('Failed to upload image: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    setImages([...images, publicUrl])
    setUploading(false)
  }

  if (submitted) {
    return (
      <div className="p-8">
        <div className="max-w-xl mx-auto text-center card-glass p-8">
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-6" />
          <h1 className="font-serif italic text-2xl text-noir-50 mb-4">Product Saved!</h1>
          <p className="text-noir-300 mb-2">Your product has been added to your shop.</p>
          <p className="text-sm text-noir-400 mb-6">
            {makerVerified 
              ? 'It is now live and available for purchase.'
              : 'Your shop is pending approval — products will go live once verified.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/product/${newProductId}`} className="btn-primary">View Product</Link>
            <Link href="/dashboard/products/new" className="btn-secondary">Add Another</Link>
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

          {error && (
            <div className="bg-rose/20 border border-rose/30 text-rose-light px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-rose' : 'bg-noir-800'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-rose' : 'bg-noir-800'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 3 ? 'bg-rose' : 'bg-noir-800'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 4 ? 'bg-rose' : 'bg-noir-800'}`} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-2">Basic Info</h2>
                
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Product Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="e.g., The Sovereign Flogger"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Price ($) *</label>
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
                    <label className="block text-sm text-noir-300 mb-1">Stock Quantity *</label>
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
                
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-4">
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Description & Materials */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-2">Description & Materials</h2>
                
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Description *</label>
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

            {/* Step 3: Shipping */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-2 flex items-center gap-2">
                  <Truck size={20} /> Shipping Information
                </h2>
                <p className="text-xs text-noir-400 mb-4">Set shipping details for this product</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Shipping Cost ($)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.shipping_cost}
                        onChange={e => setForm({ ...form, shipping_cost: e.target.value })}
                        className="w-full bg-noir-950 border border-noir-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                        placeholder="12.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Free Shipping Over ($)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.free_shipping_over}
                        onChange={e => setForm({ ...form, free_shipping_over: e.target.value })}
                        className="w-full bg-noir-950 border border-noir-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                        placeholder="150.00"
                      />
                    </div>
                    <p className="text-xs text-noir-500 mt-1">Leave blank for no free shipping threshold</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Min Delivery Time (days)</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
                      <input
                        type="number"
                        min="1"
                        value={form.shipping_time_min}
                        onChange={e => setForm({ ...form, shipping_time_min: e.target.value })}
                        className="w-full bg-noir-950 border border-noir-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                        placeholder="3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Max Delivery Time (days)</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
                      <input
                        type="number"
                        min="1"
                        value={form.shipping_time_max}
                        onChange={e => setForm({ ...form, shipping_time_max: e.target.value })}
                        className="w-full bg-noir-950 border border-noir-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                        placeholder="7"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Ships From</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
                    <input
                      type="text"
                      value={form.ships_from}
                      onChange={e => setForm({ ...form, ships_from: e.target.value })}
                      className="w-full bg-noir-950 border border-noir-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                      placeholder="Portland, OR"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                  <button type="button" onClick={() => setStep(4)} className="btn-primary flex-1">Continue</button>
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-noir-100 mb-2">Photos</h2>
                <p className="text-xs text-noir-400">Upload up to 5 photos. First image will be the cover.</p>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-noir-700">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-[10px] bg-rose/80 text-noir-50 px-1.5 py-0.5 rounded">Cover</span>
                      )}
                      <button 
                        type="button" 
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))} 
                        className="absolute top-1 right-1 w-6 h-6 bg-noir-950/80 rounded-full flex items-center justify-center text-noir-300 hover:text-rose"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-noir-700 flex flex-col items-center justify-center gap-1 hover:border-rose/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="sr-only"
                      />
                      {uploading ? (
                        <Loader2 size={20} className="text-noir-500 animate-spin" />
                      ) : (
                        <>
                          <Upload size={20} className="text-noir-500" />
                          <span className="text-xs text-noir-500">Add Photo</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Publishing...
                      </span>
                    ) : (
                      'Publish Product'
                    )}
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
