'use client'

import { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Building2, ArrowRight, Shield, AlertCircle, CheckCircle, Landmark, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

type PayoutMethod = 'bank' | 'debit' | 'stripe' | 'none'

interface Payout {
  id: string
  amount: number
  status: string
  created_at: string
}

export default function WalletPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [pending, setPending] = useState(0)
  const [lifetime, setLifetime] = useState(0)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [method, setMethod] = useState<PayoutMethod>('none')
  const [connected, setConnected] = useState(false)
  const [showConnect, setShowConnect] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const [bankForm, setBankForm] = useState({ 
    accountHolder: '', 
    routingNumber: '', 
    accountNumber: '', 
    confirmAccount: '' 
  })

  useEffect(() => {
    loadWalletData()
  }, [user])

  const loadWalletData = async () => {
    if (!user) return
    
    setLoading(true)
    const supabase = createClient()
    
    // Get maker ID
    const { data: maker } = await supabase
      .from('makers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    
    if (!maker) {
      setLoading(false)
      return
    }
    
    // Get total earnings from order_items
    const { data: earnings } = await supabase
      .from('order_items')
      .select('price, quantity')
      .eq('maker_id', maker.id)
    
    const totalEarnings = earnings?.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0) || 0
    
    setLifetime(totalEarnings)
    setBalance(totalEarnings * 0.8) // Simulate 80% available
    setPending(totalEarnings * 0.2) // Simulate 20% pending
    
    // Get payouts
    const { data: payoutData } = await supabase
      .from('payouts')
      .select('*')
      .eq('maker_id', maker.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    setPayouts(payoutData || [])
    setLoading(false)
  }

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      setShowConnect(false)
    }, 1500)
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
      <div className="mb-8">
        <h1 className="font-serif italic text-2xl text-noir-50 mb-2">Wallet & Payouts</h1>
        <p className="text-sm text-noir-400">Manage your earnings and payout methods</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign size={20} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Available</span>
          </div>
          <p className="text-3xl font-medium text-noir-50">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-noir-500 mt-1">Ready to withdraw</p>
        </div>
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-3">
            <Lock size={20} className="text-amber-400" />
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Pending</span>
          </div>
          <p className="text-3xl font-medium text-noir-50">
            ${pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-noir-500 mt-1">Clearing in 2-3 business days</p>
        </div>
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-3">
            <ArrowRight size={20} className="text-rose" />
            <span className="text-xs text-noir-500 bg-noir-800 px-2 py-0.5 rounded">Lifetime</span>
          </div>
          <p className="text-3xl font-medium text-noir-50">
            ${lifetime.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-noir-500 mt-1">Total earnings to date</p>
        </div>
      </div>

      {/* Payout Method */}
      <div className="card-glass p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-noir-100">Payout Method</h2>
            <p className="text-sm text-noir-400">How you receive your earnings</p>
          </div>
          {connected && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">
              <CheckCircle size={12} /> Connected
            </span>
          )}
        </div>

        {!connected && !showConnect ? (
          <div className="space-y-3">
            <button onClick={() => { setMethod('bank'); setShowConnect(true) }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-noir-700 hover:border-noir-500 transition-colors text-left">
              <div className="w-12 h-12 rounded-xl bg-noir-800 flex items-center justify-center">
                <Landmark size={24} className="text-noir-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-noir-200">Bank Account (ACH)</p>
                <p className="text-xs text-noir-400">Direct deposit to your checking or savings account. 1-2 business days.</p>
              </div>
              <ArrowRight size={18} className="text-noir-500" />
            </button>
            <button onClick={() => { setMethod('debit'); setShowConnect(true) }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-noir-700 hover:border-noir-500 transition-colors text-left">
              <div className="w-12 h-12 rounded-xl bg-noir-800 flex items-center justify-center">
                <CreditCard size={24} className="text-noir-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-noir-200">Debit Card (Instant)</p>
                <p className="text-xs text-noir-400">Instant payout to your debit card. Small fee may apply.</p>
              </div>
              <ArrowRight size={18} className="text-noir-500" />
            </button>
          </div>
        ) : showConnect ? (
          <form onSubmit={handleConnect} className="max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-emerald-400" />
              <span className="text-xs text-emerald-400">Bank-level encryption (AES-256)</span>
            </div>

            {method === 'bank' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Account Holder Name</label>
                  <input
                    required
                    value={bankForm.accountHolder}
                    onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="Full legal name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Routing Number</label>
                  <input
                    required
                    maxLength={9}
                    value={bankForm.routingNumber}
                    onChange={e => setBankForm({ ...bankForm, routingNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="012345678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Account Number</label>
                  <input
                    required
                    type="password"
                    value={bankForm.accountNumber}
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="••••••••••"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowConnect(false)} className="btn-secondary flex-1">Back</button>
              <button type="submit" disabled={connecting} className="btn-primary flex-1">
                {connecting ? 'Connecting...' : 'Connect Account'}
              </button>
            </div>

            <div className="flex items-start gap-2 mt-4">
              <AlertCircle size={14} className="text-noir-500 mt-0.5 shrink-0" />
              <p className="text-xs text-noir-500">
                Payment processing coming soon. For now, this is a placeholder. 
                Contact us to set up payouts manually.
              </p>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-noir-900/50 border border-noir-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Landmark size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-noir-200">Bank Account Connected</p>
                <p className="text-xs text-noir-400">****4521 · Chase Bank</p>
              </div>
              <button onClick={() => setConnected(false)} className="ml-auto text-xs text-rose hover:text-rose-light">Change</button>
            </div>
            <button className="btn-primary w-full mt-4">Request Payout</button>
          </div>
        )}
      </div>

      {/* Payout Schedule */}
      <div className="card-glass p-6">
        <h2 className="text-lg font-medium text-noir-100 mb-4">Payout History</h2>
        {payouts.length === 0 ? (
          <p className="text-noir-400 text-center py-8">No payouts yet</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-3 rounded-lg bg-noir-900/50">
                <div>
                  <p className="text-sm font-medium text-noir-200">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-noir-400">Payout</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-noir-50">+${payout.amount.toLocaleString()}</p>
                  <span className={`text-xs ${payout.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {payout.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
