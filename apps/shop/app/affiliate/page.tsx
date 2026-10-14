'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { getMyAffiliate, registerAffiliate } from '@/lib/affiliate'

export default function AffiliatePage() {
  const { user } = useAuth()
  const [existing, setExisting] = useState<ReturnType<typeof getMyAffiliate>>(null)
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) setExisting(getMyAffiliate(user.id))
  }, [user])

  function handleJoin() {
    setError('')
    if (!user) { window.location.href = '/customer/login'; return }
    if (!phone) { setError('Phone number required'); return }
    if (!agreed) { setError('Please agree to the terms'); return }
    const aff = registerAffiliate(user.id, user.name, user.email, phone)
    setExisting(aff)
    setSubmitted(true)
  }

  const features = [
    { icon: '🔗', title: 'Unique Referral Link', desc: 'Get your own tracking link to share anywhere' },
    { icon: '💰', title: '10% Commission', desc: 'Earn 10% on every sale made through your link' },
    { icon: '📊', title: 'Real-time Dashboard', desc: 'Track clicks, conversions and earnings live' },
    { icon: '💸', title: 'Weekly Payouts', desc: 'Withdraw via bKash, Nagad or Bank Transfer' },
    { icon: '🎯', title: 'No Minimum Sales', desc: 'Start earning from your very first referral' },
    { icon: '🏆', title: 'Bonus Rewards', desc: 'Top affiliates get extra commission & gifts' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1d2129] via-[#2d333f] to-[#1d2129] py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#82b541]/20 text-[#82b541] text-xs font-bold px-4 py-2 rounded-full mb-5 border border-[#82b541]/30">
            💼 SI Shop Affiliate Program
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Earn Money by Sharing<br />
            <span className="text-[#82b541]">Digital Products</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of affiliates earning passive income. Share your unique link, get 10% commission on every sale — paid weekly via bKash or Nagad.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-white">
            {[['10%', 'Commission Rate'], ['৳500+', 'Avg Per Sale'], ['Weekly', 'Payouts'], ['500+', 'Products']].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-3xl font-black text-[#82b541]">{v}</p>
                <p className="text-gray-400 text-sm">{l}</p>
              </div>
            ))}
          </div>
          {existing ? (
            <Link href="/affiliate/dashboard" className="inline-flex items-center gap-2 bg-[#82b541] hover:bg-[#6fa033] text-white font-black px-8 py-4 rounded-xl transition shadow-lg text-lg">
              Go to My Affiliate Dashboard →
            </Link>
          ) : (
            <a href="#join" className="inline-flex items-center gap-2 bg-[#82b541] hover:bg-[#6fa033] text-white font-black px-8 py-4 rounded-xl transition shadow-lg text-lg">
              Join Free — Start Earning →
            </a>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Why Join SI Shop Affiliates?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '📝', title: 'Register', desc: 'Join for free with your customer account' },
              { step: '2', icon: '🔗', title: 'Get Link', desc: 'Receive your unique referral link instantly' },
              { step: '3', icon: '📣', title: 'Share', desc: 'Post on Facebook, YouTube, Blog, WhatsApp' },
              { step: '4', icon: '💰', title: 'Earn', desc: '10% commission paid weekly to your bKash' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0" />}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#82b541] rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-lg shadow-[#82b541]/20">
                    {s.icon}
                  </div>
                  <div className="w-6 h-6 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center mb-2">{s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Table */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Commission Structure</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1d2129] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Category</th>
                <th className="px-6 py-4 text-center font-bold">Commission</th>
                <th className="px-6 py-4 text-right font-bold">Avg Per Sale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ['Software & ERP', '10%', '৳750+'],
                ['Mobile Apps', '10%', '৳680+'],
                ['Templates & Themes', '10%', '৳120+'],
                ['Plugins & Scripts', '10%', '৳80+'],
                ['Graphic Design', '10%', '৳60+'],
                ['UI Kits', '10%', '৳120+'],
              ].map(([cat, rate, avg]) => (
                <tr key={cat} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3.5 font-medium text-gray-800">{cat}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="bg-[#82b541]/10 text-[#82b541] font-bold px-3 py-1 rounded-full text-xs">{rate}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-gray-700">{avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Join Form */}
      <section id="join" className="max-w-lg mx-auto px-4 pb-16">
        {existing ? (
          <div className="bg-white rounded-2xl border border-[#82b541]/30 p-8 text-center shadow-sm">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-black text-gray-900 text-xl mb-2">You're Already an Affiliate!</h3>
            <p className="text-gray-500 mb-2 text-sm">Your referral code: <strong className="text-[#82b541] font-mono text-base">{existing.refCode}</strong></p>
            <p className="text-xs text-gray-400 mb-5">Status: <span className={`font-bold ${existing.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>{existing.status.toUpperCase()}</span></p>
            <Link href="/affiliate/dashboard" className="block bg-[#82b541] hover:bg-[#6fa033] text-white font-black py-3.5 rounded-xl transition">
              Open Affiliate Dashboard →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="font-black text-gray-900 text-2xl mb-1 text-center">Join Free Today</h2>
            <p className="text-gray-500 text-sm text-center mb-6">No fees. No minimums. Start earning immediately.</p>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 text-sm text-yellow-800">
                ⚠️ You need a customer account to join. <Link href="/customer/login" className="font-bold underline">Login / Register →</Link>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="font-black text-gray-900 text-xl mb-2">Application Submitted!</h3>
                <p className="text-gray-500 text-sm mb-5">Your affiliate account is under review. We'll activate it within 24 hours.</p>
                <Link href="/affiliate/dashboard" className="block bg-[#82b541] hover:bg-[#6fa033] text-white font-black py-3.5 rounded-xl transition">
                  View My Dashboard →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <input value={user?.name || ''} readOnly
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input value={user?.email || ''} readOnly
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone / bKash Number *</label>
                  <div className="flex gap-2">
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50">🇧🇩 +880</div>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
                  </div>
                </div>
                <div className="bg-[#82b541]/5 border border-[#82b541]/20 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
                  <strong>Commission Structure:</strong> You earn 10% of each sale made through your unique referral link. Commissions are credited after 7-day refund window. Minimum withdrawal: ৳500. Weekly payouts every Friday.
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-[#82b541]" />
                  <span className="text-xs text-gray-600">I agree to the SI Shop Affiliate Terms & Conditions, including the 10% commission rate and payout schedule.</span>
                </label>
                {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
                <button onClick={handleJoin}
                  className="w-full bg-[#82b541] hover:bg-[#6fa033] text-white font-black py-3.5 rounded-xl transition shadow-sm text-base">
                  Join Affiliate Program →
                </button>
                <p className="text-center text-xs text-gray-400">Free to join • Instant referral link • Withdraw anytime</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
