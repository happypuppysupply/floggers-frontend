'use client'

import { useState } from 'react'
import { DollarSign, CreditCard, Building2, ArrowRight, Shield, AlertCircle, CheckCircle, Landmark, Lock } from 'lucide-react'

type PayoutMethod = 'bank' | 'debit' | 'stripe' | 'none'

export default function WalletPage() {
  const [balance, setBalance] = useState(8245.00)
  const [pending, setPending] = useState(1230.50)
  const [method, setMethod] = useState<PayoutMethod>('none')
  const [connected, setConnected] = useState(false)
  const [showConnect, setShowConnect] = useState(false)

  const [bankForm, setBankForm] = useState({ accountHolder: '', routingNumber: '', accountNumber: '', confirmAccount: '' })
  const [debitForm, setDebitForm] = useState({ cardHolder: '', cardNumber: '', expiry: '', cvc: '', zip: '' })
  const [connecting, setConnecting] = useState(false)

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      setShowConnect(false)
    }, 1500)
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
          <p className="text-3xl font-medium text-noir-50">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-noir-500 mt-1">Ready to withdraw</p>
        </div>
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-3">
            <Lock size={20} className="text-amber-400" />
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Pending</span>
          </div>
          <p className="text-3xl font-medium text-noir-50">${pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-noir-500 mt-1">Clearing in 2-3 business days</p>
        </div>
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-3">
            <ArrowRight size={20} className="text-rose" />
            <span className="text-xs text-noir-500 bg-noir-800 px-2 py-0.5 rounded">Lifetime</span>
          </div>
          <p className="text-3xl font-medium text-noir-50">$47,230.00</p>
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
            <button onClick={() => { setMethod('stripe'); setShowConnect(true) }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-noir-700 hover:border-noir-500 transition-colors text-left">
              <div className="w-12 h-12 rounded-xl bg-noir-800 flex items-center justify-center">
                <Building2 size={24} className="text-noir-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-noir-200">Stripe Connect</p>
                <p className="text-xs text-noir-400">Connect your existing Stripe account for global payouts.</p>
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
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Confirm Account Number</label>
                  <input
                    required
                    type="password"
                    value={bankForm.confirmAccount}
                    onChange={e => setBankForm({ ...bankForm, confirmAccount: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="••••••••••"
                  />
                </div>
              </div>
            )}

            {method === 'debit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Card Holder Name</label>
                  <input
                    required
                    value={debitForm.cardHolder}
                    onChange={e => setDebitForm({ ...debitForm, cardHolder: e.target.value })}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="Full name on card"
                  />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1">Card Number</label>
                  <input
                    required
                    maxLength={19}
                    value={debitForm.cardNumber}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
                      setDebitForm({ ...debitForm, cardNumber: v })
                    }}
                    className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">Expiry</label>
                    <input
                      required
                      maxLength={5}
                      value={debitForm.expiry}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
                        setDebitForm({ ...debitForm, expiry: v })
                      }}
                      className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">CVC</label>
                    <input
                      required
                      maxLength={4}
                      value={debitForm.cvc}
                      onChange={e => setDebitForm({ ...debitForm, cvc: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1">ZIP</label>
                    <input
                      required
                      maxLength={5}
                      value={debitForm.zip}
                      onChange={e => setDebitForm({ ...debitForm, zip: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-noir-950 border border-noir-700 rounded-lg px-4 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-rose/50"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'stripe' && (
              <div className="text-center py-8">
                <Building2 size={48} className="text-noir-500 mx-auto mb-4" />
                <p className="text-noir-200 mb-2">Stripe Connect Integration</p>
                <p className="text-sm text-noir-400 mb-4">In production, this would redirect to Stripe OAuth to connect your existing account.</p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#635BFF] hover:bg-[#574fd8] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Connect with Stripe
                </button>
              </div>
            )}

            {method !== 'stripe' && (
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowConnect(false)} className="btn-secondary flex-1">Back</button>
                <button type="submit" disabled={connecting} className="btn-primary flex-1">
                  {connecting ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            )}

            <div className="flex items-start gap-2 mt-4">
              <AlertCircle size={14} className="text-noir-500 mt-0.5 shrink-0" />
              <p className="text-xs text-noir-500">Your financial information is encrypted and never stored on our servers. We use PCI-compliant tokenization.</p>
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
        <h2 className="text-lg font-medium text-noir-100 mb-4">Payout Schedule</h2>
        <div className="space-y-3">
          {[
            { date: 'Sep 27, 2024', amount: 1245.00, status: 'deposited' },
            { date: 'Sep 20, 2024', amount: 892.50, status: 'deposited' },
            { date: 'Sep 13, 2024', amount: 1560.00, status: 'deposited' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-noir-900/50">
              <div>
                <p className="text-sm font-medium text-noir-200">{tx.date}</p>
                <p className="text-xs text-noir-400">Automatic weekly payout</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-noir-50">+${tx.amount.toLocaleString()}</p>
                <span className="text-xs text-emerald-400">{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
