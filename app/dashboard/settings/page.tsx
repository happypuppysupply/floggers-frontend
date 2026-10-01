'use client'

import { useState, useEffect } from 'react'
import { Save, Check, Loader2, Upload, X, Camera, Image as ImageIcon, Copy, Link as LinkIcon, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

// These are the ONLY columns that exist in the makers table (before migration 007)
// id, profile_id, slug, name, tagline, bio, location, since, rating, products_count, 
// image_url, featured, is_verified, created_at, updated_at
// DO NOT add fields here unless the column exists in the database schema

export default function SettingsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    location: '',
    website: '',
    bio: '',
  })
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [makerSlug, setMakerSlug] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadMakerProfile()
  }, [user])

  const loadMakerProfile = async () => {
    if (!user) return
    
    setLoading(true)
    const supabase = createClient()
    
    // Try to get maker record first
    const { data: maker } = await supabase
      .from('makers')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()
    
    if (maker) {
      setForm({
        name: maker.name || '',
        tagline: maker.tagline || '',
        location: maker.location || '',
        website: maker.website || maker.website_url || '',
        bio: maker.bio || '',
      })
      setAvatarUrl(maker.avatar_url || maker.image_url || '')
      setCoverUrl(maker.cover_image_url || '')
      setMakerSlug(maker.slug || '')
    } else {
      // No maker yet - try to load from application
      const { data: application } = await supabase
        .from('maker_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (application) {
        setForm({
          name: application.shop_name || '',
          tagline: application.category || '',
          location: application.location || '',
          website: application.website || application.website_url || '',
          bio: application.description || '',
        })
      }
    }
    
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (type === 'avatar') setUploadingAvatar(true)
    else setUploadingCover(true)

    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = type === 'avatar' ? `shop-avatars/${fileName}` : `shop-covers/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setError('Failed to upload image. Please try again.')
      if (type === 'avatar') setUploadingAvatar(false)
      else setUploadingCover(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    if (type === 'avatar') {
      setAvatarUrl(publicUrl)
      setUploadingAvatar(false)
    } else {
      setCoverUrl(publicUrl)
      setUploadingCover(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    setError('')
    const supabase = createClient()
    
    // Check if maker exists first
    const { data: existingMaker } = await supabase
      .from('makers')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()
    
    let saveError;
    
    // Build maker data with only core columns that always exist
    // Migration 007 adds website, avatar_url, cover_image_url - handle gracefully
    const makerData: any = {
      name: form.name,
      tagline: form.tagline,
      location: form.location,
      bio: form.bio,
      updated_at: new Date().toISOString(),
    }
    
    // Only add optional columns if they have values
    // This prevents errors if migration 007 hasn't been run yet
    if (form.website) makerData.website = form.website
    if (avatarUrl) makerData.avatar_url = avatarUrl
    if (coverUrl) makerData.cover_image_url = coverUrl
    
    if (existingMaker) {
      // Update existing maker
      const { error: updateError } = await supabase
        .from('makers')
        .update(makerData)
        .eq('profile_id', user.id)
      saveError = updateError
    } else {
      // Create new maker record
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
      const { error: insertError } = await supabase
        .from('makers')
        .insert({
          profile_id: user.id,
          name: form.name,
          slug: slug || `maker-${Date.now()}`,
          ...makerData,
          is_verified: false,
          rating: 0,
          products_count: 0,
        })
      saveError = insertError
    }
    
    if (!saveError) {
      setSaved(true)
      setShowModal(true)
      // Refresh maker data to get updated slug
      const { data: updatedMaker } = await supabase
        .from('makers')
        .select('slug')
        .eq('profile_id', user.id)
        .single()
      if (updatedMaker?.slug) {
        setMakerSlug(updatedMaker.slug)
      }
      setTimeout(() => {
        setSaved(false)
      }, 2000)
    } else {
      console.error('Save error:', saveError)
      setError(saveError.message || 'Failed to save changes. Please try again.')
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-rose animate-spin" />
        </div>
      </div>
    )
  }

  const copyProfileLink = () => {
    if (makerSlug) {
      const link = `${window.location.origin}/maker/${makerSlug}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Shop Settings</h1>
        <p className="text-sm text-noir-400">Manage your shop profile and branding</p>
      </div>

      {/* Share Profile Link */}
      {makerSlug && (
        <div className="mb-6 p-4 bg-noir-900/50 border border-noir-800 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <LinkIcon size={18} className="text-rose" />
            <h3 className="text-sm font-medium text-noir-200">Share Your Profile</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-noir-950 border border-noir-800 rounded-lg px-3 py-2 text-sm text-noir-400 truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/maker/${makerSlug}` : `/maker/${makerSlug}`}
            </div>
            <button
              onClick={copyProfileLink}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                copied 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-dark hover:bg-rose text-noir-50'
              }`}
            >
              {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-rose/20 border border-rose/30 rounded-lg text-rose-light text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-rose-light/70 hover:text-rose-light">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowModal(false)}>
          <div className="bg-noir-900 border border-noir-700 rounded-2xl p-6 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-noir-100 mb-2">Changes Saved!</h3>
            <p className="text-sm text-noir-400 mb-4">Your shop profile has been updated successfully.</p>
            <button 
              onClick={() => setShowModal(false)}
              className="btn-primary w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-glass p-6">
            <h2 className="text-lg font-medium text-noir-100 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                />
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  placeholder="Brief description of your shop"
                />
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  placeholder="Tell customers about your shop and craft..."
                />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h2 className="text-lg font-medium text-noir-100 mb-4">Contact & Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  placeholder="City, State / Country"
                />
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Images */}
        <div className="space-y-6">
          {/* Shop Logo */}
          <div className="card-glass p-6">
            <h2 className="text-lg font-medium text-noir-100 mb-4 flex items-center gap-2">
              <Camera size={18} />
              Shop Logo
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Shop logo" 
                    className="w-full h-full rounded-full object-cover border-2 border-noir-700"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-noir-800 flex items-center justify-center border-2 border-noir-700 border-dashed">
                    <ImageIcon size={40} className="text-noir-600" />
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-noir-950/80 rounded-full flex items-center justify-center">
                    <Loader2 size={24} className="text-rose animate-spin" />
                  </div>
                )}
              </div>
              <label className="btn-secondary text-xs py-2 px-4 cursor-pointer">
                <Upload size={14} className="inline mr-1" />
                {avatarUrl ? 'Change Logo' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'avatar')}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-noir-500 mt-2 text-center">
                Recommended: 400x400px
              </p>
            </div>
          </div>

          {/* Cover Image */}
          <div className="card-glass p-6">
            <h2 className="text-lg font-medium text-noir-100 mb-4 flex items-center gap-2">
              <ImageIcon size={18} />
              Cover Photo
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                {coverUrl ? (
                  <img 
                    src={coverUrl} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-noir-800 flex items-center justify-center border border-noir-700 border-dashed rounded-lg">
                    <ImageIcon size={40} className="text-noir-600" />
                  </div>
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 bg-noir-950/80 flex items-center justify-center">
                    <Loader2 size={24} className="text-rose animate-spin" />
                  </div>
                )}
              </div>
              <label className="btn-secondary text-xs py-2 px-4 cursor-pointer">
                <Upload size={14} className="inline mr-1" />
                {coverUrl ? 'Change Cover' : 'Upload Cover'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'cover')}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-noir-500 mt-2 text-center">
                Recommended: 1200x400px
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500' : ''}`}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={16} /> Saved</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
