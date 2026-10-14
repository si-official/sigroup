'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { getMyAffiliate, getWithdrawals, requestWithdrawal, AffiliateUser, AffiliateWithdrawal } from '@/lib/affiliate'
import Link from 'next/link'

const TABS = ['Overview', 'My Links', 'Earnings', 'Withdraw', 'Tools']

export default function AffiliateDashboard() {
  const { user } = useAuth()
  const [aff, setAff] = useState<AffiliateUser | null>(null)
  const [tab, setTab] = useState('Overview')
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawal[]>([])
  const [copied, setCopied] = useState(false)
  const [wdForm, setWdForm] = useState({ amount: '', method: 'bkash', account: '' })
  const [wdError, setWdError] = useState('')
  const [wdSuccess, setWdSuccess] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shop.sigroup.com.bd'
  const refLink = aff ? `${baseUrl}?ref=${aff.refCode}` : ''

  useEffect(() => {
    if (!user) { window.location.href = '/customer/login'; return }
    const a = getMyAffiliate(user.id)
    if (!a) { window.location.href = '/affiliate'; return }
    setAff(a)
    setWithdrawals(getWithdrawals(a.id))
    setWdForm(f => ({ ...f, account: a.paymentAccount || '' }))
  }, [user])

  function copyLink() {
    navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWithdraw() {
    setWdError('')
    const amt = parseInt(wdForm.amount)
    if (!amt || amt < 500) { setWdError('Minimum withdrawal is ৳500'); return }
    if (!aff || amt > aff.availableBalance) { setWdError('Insufficient available balance'); return }
    if (!wdForm.account) { setWdError('Enter your payment account number'); return }
    const wd = requestWithdrawal(aff.id, amt, wdForm.method, wdForm.account)
    setWithdrawals(prev => [wd, ...prev])
    setAff(prev => prev ? { ...prev, availableBalance: prev.availableBalance - amt, pendingBalance: prev.pendingBalance + amt } : prev)
    setWdSuccess(true)
    setWdForm(f => ({ ...f, amount: '' }))
    setTimeout(() => setWdSuccess(false), 3000)
  }

  if (!aff) return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  const monthlyData = [12, 18, 8, 25, 32, 19, 28, 41, 36, 22, 30, 45]

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1d2129] border-b border-[#3d4451]">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#82b541] rounded-xl flex items-center justify-center text-white font-black text-xl">
                {aff.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-white font-black text-lg">{aff.name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${aff.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {aff.status.toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-xs font-mono">Code: {aff.refCode}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-[#2d333f] rounded-xl px-4 py-2.5 border border-[#3d4451]">
              <span className="text-gray-400 text-xs font-mono truncate max-w-[240px]">{refLink}</span>
              <button onClick={copyLink} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${copied ? 'bg-green-500 text-white' : 'bg-[#82b541] hover:bg-[#6fa033] text-white'}`}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${tab === t ? 'border-[#82b541] text-[#82b541]' : 'border-transparent text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── OVERVIEW ── */}
        {tab === 'Overview' && (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Available Balance', value: `৳${aff.availableBalance.toLocaleString()}`, sub: 'Ready to withdraw', color: 'text-[#82b541]', bg: 'bg-[#82b541]/10', icon: '💰' },
                { label: 'Total Earned', value: `৳${aff.totalEarned.toLocaleString()}`, sub: 'All time', color: 'text-blue-600', bg: 'bg-blue-50', icon: '📈' },
                { label: 'Total Clicks', value: aff.totalClicks.toLocaleString(), sub: 'Link visits', color: 'text-purple-600', bg: 'bg-purple-50', icon: '👆' },
                { label: 'Conversions', value: aff.totalConversions.toString(), sub: `${aff.totalClicks > 0 ? ((aff.totalConversions / aff.totalClicks) * 100).toFixed(1) : 0}% rate`, color: 'text-orange-600', bg: 'bg-orange-50', icon: '🎯' },
              ].map(s => (
                <div key={s.label} className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm`}>
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-700 text-sm font-semibold mt-0.5">{s.label}</p>
                  <p className="text-gray-400 text-xs">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Pending balance */}
            {aff.pendingBalance > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⏳</span>
                  <div>
                    <p className="font-bold text-yellow-800 text-sm">৳{aff.pendingBalance.toLocaleString()} Pending</p>
                    <p className="text-yellow-600 text-xs">Withdrawal in processing</p>
                  </div>
                </div>
                <button onClick={() => setTab('Withdraw')} className="text-xs font-bold text-yellow-700 hover:underline">Track →</button>
              </div>
            )}

            {/* Status warning */}
            {aff.status === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-bold text-blue-800">Account Under Review</p>
                  <p className="text-blue-600 text-sm">Your affiliate account will be activated within 24 hours. You can still prepare your links.</p>
                </div>
              </div>
            )}

            {/* Earnings chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Monthly Clicks (2025)</h3>
              <div className="flex items-end gap-2 h-32">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <div key={m} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-[#82b541]/70 hover:bg-[#82b541] transition"
                      style={{ height: `${(monthlyData[i] / 45) * 100}%` }}
                    />
                    <span className="text-[8px] text-gray-400">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '🔗', label: 'Copy Referral Link', action: copyLink },
                { icon: '📊', label: 'View Earnings', action: () => setTab('Earnings') },
                { icon: '💸', label: 'Request Withdrawal', action: () => setTab('Withdraw') },
                { icon: '🛠️', label: 'Marketing Tools', action: () => setTab('Tools') },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-[#82b541] hover:shadow-sm transition group">
                  <div className="text-2xl mb-1.5">{a.icon}</div>
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-[#82b541]">{a.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MY LINKS ── */}
        {tab === 'My Links' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🔗 Your Referral Links</h3>
              <div className="space-y-4">
                {[
                  { label: 'Homepage Link', url: `${baseUrl}?ref=${aff.refCode}` },
                  { label: 'Software Category', url: `${baseUrl}/category/software?ref=${aff.refCode}` },
                  { label: 'Mobile Apps', url: `${baseUrl}/category/mobile-app?ref=${aff.refCode}` },
                  { label: 'Templates', url: `${baseUrl}/category/template?ref=${aff.refCode}` },
                  { label: 'Graphic Design', url: `${baseUrl}/category/graphic-design?ref=${aff.refCode}` },
                ].map(link => (
                  <div key={link.label} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">{link.label}</p>
                      <p className="text-xs font-mono text-gray-500 truncate">{link.url}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(link.url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="flex-shrink-0 bg-[#82b541] hover:bg-[#6fa033] text-white text-xs font-bold px-3 py-2 rounded-lg transition">
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">Custom Product Link</h3>
              <p className="text-gray-500 text-sm mb-4">Generate a referral link for any specific product</p>
              <div className="flex gap-2">
                <input placeholder="Paste product URL (e.g. /item/restaurant-pos-system)"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]"
                  id="custom-url"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('custom-url') as HTMLInputElement
                    const url = el.value.trim() || baseUrl
                    const final = url.includes('?') ? `${url}&ref=${aff.refCode}` : `${url}?ref=${aff.refCode}`
                    navigator.clipboard.writeText(final)
                    el.value = final
                  }}
                  className="bg-[#82b541] hover:bg-[#6fa033] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition">
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EARNINGS ── */}
        {tab === 'Earnings' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Earned', value: `৳${aff.totalEarned.toLocaleString()}` },
                { label: 'Available', value: `৳${aff.availableBalance.toLocaleString()}` },
                { label: 'Pending', value: `৳${aff.pendingBalance.toLocaleString()}` },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
                  <p className="text-2xl font-black text-[#82b541]">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-900">Commission History</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-center">Sale Amount</th>
                    <th className="px-6 py-3 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { date: '2025-07-01', product: 'Restaurant POS System', sale: 4500, comm: 450 },
                    { date: '2025-06-28', product: 'Flutter E-Commerce App', sale: 3800, comm: 380 },
                    { date: '2025-06-25', product: 'School ERP System', sale: 7500, comm: 750 },
                    { date: '2025-06-20', product: 'SaaS Dashboard Template', sale: 1200, comm: 120 },
                    { date: '2025-06-15', product: 'bKash Payment Plugin', sale: 800, comm: 80 },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3.5 text-gray-500">{r.date}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-800">{r.product}</td>
                      <td className="px-6 py-3.5 text-center text-gray-600">৳{r.sale.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-[#82b541]">+৳{r.comm.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── WITHDRAW ── */}
        {tab === 'Withdraw' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">💸 Request Withdrawal</h3>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-[#82b541]/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-[#82b541]">৳{aff.availableBalance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-yellow-600">৳{aff.pendingBalance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (min ৳500)</label>
                <input type="number" value={wdForm.amount} onChange={e => setWdForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bkash', label: 'bKash', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                    { id: 'nagad', label: 'Nagad', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                    { id: 'rocket', label: 'Rocket', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                    { id: 'bank', label: 'Bank', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  ].map(m => (
                    <button key={m.id} onClick={() => setWdForm(f => ({ ...f, method: m.id }))}
                      className={`py-2 rounded-lg text-sm font-bold border transition ${wdForm.method === m.id ? m.color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Number</label>
                <input value={wdForm.account} onChange={e => setWdForm(f => ({ ...f, account: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
              </div>
              {wdError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{wdError}</div>}
              {wdSuccess && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold">✅ Withdrawal request submitted! Processing within 1-3 business days.</div>}
              <button onClick={handleWithdraw}
                className="w-full bg-[#82b541] hover:bg-[#6fa033] text-white font-black py-3.5 rounded-xl transition">
                Request Withdrawal
              </button>
              <p className="text-xs text-gray-400 text-center">Processed every Friday • Minimum ৳500</p>
            </div>

            {/* Withdrawal history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-900">Withdrawal History</h3>
              </div>
              {withdrawals.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm">No withdrawals yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {withdrawals.map(w => (
                    <div key={w.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">৳{w.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{w.method.toUpperCase()} • {w.account}</p>
                        <p className="text-xs text-gray-400">{new Date(w.requestedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${w.status === 'paid' ? 'bg-green-100 text-green-700' : w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {w.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TOOLS ── */}
        {tab === 'Tools' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">🛠️ Marketing Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '🖼️', title: 'Banner Images', desc: '10+ ready-made banner ads for social media and websites', action: 'Download All' },
                  { icon: '📝', title: 'Email Templates', desc: 'Pre-written email templates to promote SI Shop products', action: 'Copy Template' },
                  { icon: '📱', title: 'Social Media Posts', desc: 'Ready Facebook, Instagram captions with your referral link', action: 'Copy Posts' },
                  { icon: '🎬', title: 'YouTube Script', desc: 'Video script template for promoting digital products', action: 'Download Script' },
                ].map(t => (
                  <div key={t.title} className="border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-[#82b541] transition">
                    <div className="text-3xl">{t.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t.title}</h4>
                      <p className="text-xs text-gray-500 mb-3">{t.desc}</p>
                      <button className="text-xs font-bold text-[#82b541] hover:underline">{t.action} →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">📣 Ready-to-Share Caption</h3>
              <p className="text-xs text-gray-500 mb-3">Copy and paste to Facebook, WhatsApp, or your blog</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                🚀 আপনি কি সফটওয়্যার বা মোবাইল অ্যাপ কিনতে চাইছেন? SI Shop এ পাচ্ছেন বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট — POS সিস্টেম, Flutter অ্যাপ, ওয়েবসাইট টেমপ্লেট এবং আরো অনেক কিছু।{'\n\n'}
                👉 এখনই দেখুন: {refLink}{'\n\n'}
                #SIShop #DigitalProducts #Bangladesh #Software
              </div>
              <button onClick={() => navigator.clipboard.writeText(`🚀 আপনি কি সফটওয়্যার বা মোবাইল অ্যাপ কিনতে চাইছেন? SI Shop এ পাচ্ছেন বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট। 👉 ${refLink}`)}
                className="mt-3 text-xs font-bold text-[#82b541] hover:underline">
                Copy Caption →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
