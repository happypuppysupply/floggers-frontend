'use client'

import { useState } from 'react'
import { Save, Check } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    shopName: 'Black Raven Leather',
    tagline: 'Artisan leather goods hand-crafted in Portland',
    email: 'hello@blackravenleather.com',
    location: 'Portland, OR',
    bio: 'Founded in 2018, Black Raven Leather specializes in premium BDSM gear crafted from full-grain Italian leather.',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
            <label className="block text-sm text-noir-300 mb-1">Shop Name</label>
            <input
              type="text"
              value={form.shopName}
              onChange={e => setForm({ ...form, shopName: e.target.value })}
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
            />
          </div>
          <div>
            <label className="block text-sm text-noir-300 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
            />
          </div>

          <button
            onClick={handleSave}
            className={`btn-primary flex items-center gap-2 ${saved ? 'bg-emerald-500' : ''}`}
          >
            {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}
