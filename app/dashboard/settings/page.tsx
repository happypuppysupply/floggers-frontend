'use client'

import { useState, useEffect } from 'react'
import { Save, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    email: '',
    location: '',
    website: '',
    bio: '',
  })

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
        email: maker.email || user.email || '',
        location: maker.location || '',
        website: maker.website || '',
        bio: maker.bio || '',
      })
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
          email: application.applicant_email || user.email || '',
          location: application.location || '',
          website: application.website || '',
          bio: application.description || '',
        })
      } else {
        // Pre-fill email from user
        setForm(prev => ({ ...prev, email: user.email || '' }))
      }
    }
    
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    const supabase = createClient()
    
    // Check if maker exists first
    const { data: existingMaker } = await supabase
      .from('makers')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()
    
    let error;
    
    if (existingMaker) {
      // Update existing maker
      const { error: updateError } = await supabase
        .from('makers')
        .update({
          name: form.name,
          tagline: form.tagline,
          email: form.email,
          location: form.location,
          website: form.website,
          bio: form.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', user.id)
      error = updateError
    } else {
      // Create new maker record
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
      const { error: insertError } = await supabase
        .from('makers')
        .insert({
          profile_id: user.id,
          name: form.name,
          slug: slug || `maker-${Date.now()}`,
          tagline: form.tagline,
          email: form.email,
          location: form.location,
          website: form.website,
          bio: form.bio,
          is_verified: false,
          is_active: true,
          rating: 0,
          products_count: 0,
        })
      error = insertError
    }
    
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      console.error('Save error:', error)
      alert('Failed to save changes. Please try again.')
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-1">Shop Settings</h1>
        <p className="text-sm text-noir-400">Manage your shop profile</p>
      </div>

      <div className="card-glass p-6 max-w-2xl">
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
            <label className="block text-sm text-noir-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
            />
          </div>
          <div>
            <label className="block text-sm text-noir-300 mb-1">Location</label>
            <input
              type="text"
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

          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-primary flex items-center gap-2 ${saved ? 'bg-emerald-500' : ''}`}
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
