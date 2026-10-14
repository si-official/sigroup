'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const categories = ['Software', 'Mobile Apps', 'Templates', 'Plugins', 'UI Kits', 'Scripts', 'Themes', 'Other']

export default function SellerRegister() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', shopName: '', shopDesc: '', category: '', nid: '', bankName: '', bankAccount: '', bkash: '' })
  const [agreed, setAgreed] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
              <div className="text-xs font-medium text-gray-500 hidden sm:block">
                {s === 1 ? 'Personal Info' : s === 2 ? 'Shop Details' : 'Payment Info'}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-red-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900">
              {step === 1 ? 'Personal Information' : step === 2 ? 'Shop Details' : 'Payment & Payout'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 ? 'Create your seller account' : step === 2 ? 'Set up your shop profile' : 'How you want to receive payments'}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">NID Number *</label>
                <input value={form.nid} onChange={e => set('nid', e.target.value)} placeholder="National ID number for verification" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                <p className="text-xs text-gray-400 mt-1">Required for seller verification. Will not be shared publicly.</p>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition shadow-sm mt-2">
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shop Name *</label>
                <input value={form.shopName} onChange={e => set('shopName', e.target.value)} placeholder="e.g., TechBD Solutions" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shop Description *</label>
                <textarea value={form.shopDesc} onChange={e => set('shopDesc', e.target.value)} rows={3} placeholder="Tell buyers what you sell and your expertise..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white">
                  <option value="">Select main product category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-blue-800 font-semibold text-sm mb-1">📋 Seller Commission</p>
                <p className="text-blue-700 text-xs leading-relaxed">SI Shop takes a <strong>15% commission</strong> on each sale. You keep 85% of every transaction. Payouts are processed weekly every Sunday.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition shadow-sm">Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">bKash Number (preferred)</label>
                <input value={form.bkash} onChange={e => set('bkash', e.target.value)} placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Or Bank Transfer</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                    <input value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="e.g., Dutch-Bangla Bank" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                    <input value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} placeholder="Account number" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} id="agree" className="mt-0.5 accent-red-600" />
                <label htmlFor="agree" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  I agree to the <span className="text-red-600 font-semibold">SI Shop Seller Terms & Conditions</span> and understand the 15% commission policy. I confirm all information provided is accurate.
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition">← Back</button>
                <button
                  disabled={!agreed}
                  onClick={() => alert('Registration submitted! You will be verified within 24 hours and receive an email confirmation.')}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl transition shadow-sm"
                >
                  Submit Application ✓
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already a seller? <Link href="/seller/login" className="text-red-600 font-semibold hover:underline">Login to your panel</Link>
        </p>
      </div>
    </div>
  )
}
