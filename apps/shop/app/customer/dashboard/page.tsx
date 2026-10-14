'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { getMyAffiliate, AffiliateUser } from '@/lib/affiliate'

const mockOrders = [
  { id: 'ORD-2025-001', product: 'Restaurant POS System', seller: 'TechBD Solutions', amount: 4500, date: '2025-07-01', status: 'paid', downloadReady: true, license: 'Regular', slug: 'restaurant-pos-system' },
  { id: 'ORD-2025-002', product: 'SaaS Admin Dashboard Template', seller: 'DesignHut BD', amount: 1200, date: '2025-06-28', status: 'paid', downloadReady: true, license: 'Regular', slug: 'saas-admin-dashboard' },
  { id: 'ORD-2025-003', product: 'WooCommerce bKash Plugin', seller: 'PluginPro BD', amount: 800, date: '2025-06-15', status: 'paid', downloadReady: true, license: 'Extended', slug: 'woocommerce-bkash-plugin' },
]

const defaultWishlist = [
  { id: 'p2', name: 'E-Commerce Flutter App', price: 3800, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&q=80', slug: 'ecommerce-flutter-app', seller: 'FlutterBD' },
  { id: 'p8', name: 'Food Delivery App (Flutter)', price: 6800, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80', slug: 'food-delivery-flutter', seller: 'AppStudio BD' },
]

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
}

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
  seller: string
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'downloads' | 'wishlist' | 'affiliate' | 'profile'>('overview')
  const [myAffiliate, setMyAffiliate] = useState<AffiliateUser | null>(null)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(defaultWishlist)
  const [connectedAccounts, setConnectedAccounts] = useState({ google: false, facebook: false, whatsapp: false })
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('si_wishlist')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.length) setWishlist(parsed)
      }
      const wa = localStorage.getItem('si_customer_whatsapp')
      if (wa) setWhatsappNumber(wa)
      const conn = localStorage.getItem('si_connected_accounts')
      if (conn) setConnectedAccounts(JSON.parse(conn))
    } catch {}
    if (user) setMyAffiliate(getMyAffiliate(user.id))
  }, [user])

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: '' })
      // detect social login from email pattern
      if (user.email?.startsWith('google@')) setConnectedAccounts(c => ({ ...c, google: true }))
      if (user.email?.startsWith('facebook@')) setConnectedAccounts(c => ({ ...c, facebook: true }))
      if (user.email?.startsWith('wa_')) setConnectedAccounts(c => ({ ...c, whatsapp: true }))
    }
  }, [user])

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter(w => w.id !== id)
    setWishlist(updated)
    localStorage.setItem('si_wishlist', JSON.stringify(updated))
  }

  const saveConnectedAccounts = (updated: typeof connectedAccounts) => {
    setConnectedAccounts(updated)
    localStorage.setItem('si_connected_accounts', JSON.stringify(updated))
  }

  const saveProfile = () => {
    localStorage.setItem('si_customer_whatsapp', whatsappNumber)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const displayName = user?.name || 'Alam Khan'
  const displayEmail = user?.email || 'alam@example.com'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-lg">{initial}</div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{displayName}</p>
                  <p className="text-xs text-gray-500">Customer</p>
                  <span className="inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold mt-0.5">{mockOrders.length} purchases</span>
                </div>
              </div>
              <nav className="space-y-1">
                {[
                  { tab: 'overview', icon: '🏠', label: 'Overview' },
                  { tab: 'orders', icon: '📦', label: 'My Orders' },
                  { tab: 'downloads', icon: '⬇️', label: 'Downloads' },
                  { tab: 'wishlist', icon: '❤️', label: `Wishlist (${wishlist.length})` },
                  { tab: 'affiliate', icon: '🤝', label: 'Affiliate' },
                  { tab: 'profile', icon: '👤', label: 'Profile' },
                ].map(item => (
                  <button key={item.tab} onClick={() => setActiveTab(item.tab as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === item.tab ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span>{item.icon}</span>{item.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition">🛒 Back to Shop</Link>
                  <button onClick={() => { logout(); window.location.href = '/customer/login' }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition">
                    🚪 Logout
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">My Dashboard</h1>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Orders', value: String(mockOrders.length), icon: '📦', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'Total Spent', value: `৳${mockOrders.reduce((s, o) => s + o.amount, 0).toLocaleString()}`, icon: '💳', color: 'bg-green-50 border-green-200 text-green-700' },
                    { label: 'Downloads', value: String(mockOrders.filter(o => o.downloadReady).length), icon: '⬇️', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                    { label: 'Wishlist', value: String(wishlist.length), icon: '❤️', color: 'bg-red-50 border-red-200 text-red-700' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} border rounded-2xl p-5`}>
                      <p className="text-2xl mb-2">{s.icon}</p>
                      <p className="font-black text-xl leading-none">{s.value}</p>
                      <p className="text-sm opacity-70 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Purchases</h3>
                  <div className="space-y-3">
                    {mockOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">💾</div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{o.product}</p>
                            <p className="text-xs text-gray-500">{o.date} · {o.license} License</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">৳{o.amount.toLocaleString()}</p>
                          {o.downloadReady && (
                            <button className="text-red-600 text-xs font-semibold hover:underline mt-0.5">⬇ Download</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ORDERS ── */}
            {activeTab === 'orders' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">My Orders</h1>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50"><tr>
                        {['Order ID', 'Product', 'Seller', 'License', 'Date', 'Amount', 'Status', ''].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-gray-500 font-semibold whitespace-nowrap text-xs">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {mockOrders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50 transition">
                            <td className="py-3.5 px-4 font-mono text-xs text-gray-500">{o.id}</td>
                            <td className="py-3.5 px-4 font-medium text-gray-900 max-w-[130px] truncate">{o.product}</td>
                            <td className="py-3.5 px-4 text-gray-500 text-xs">{o.seller}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${o.license === 'Extended' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{o.license}</span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-xs">{o.date}</td>
                            <td className="py-3.5 px-4 font-bold text-gray-900">৳{o.amount.toLocaleString()}</td>
                            <td className="py-3.5 px-4"><span className={`${statusColors[o.status]} text-xs font-semibold px-2.5 py-1 rounded-full`}>{o.status}</span></td>
                            <td className="py-3.5 px-4">{o.downloadReady && <button className="text-red-600 text-xs font-bold hover:underline whitespace-nowrap">⬇ Download</button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── DOWNLOADS ── */}
            {activeTab === 'downloads' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">My Downloads</h1>
                <div className="space-y-3">
                  {mockOrders.filter(o => o.downloadReady).map(o => (
                    <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">💾</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900">{o.product}</p>
                          <p className="text-xs text-gray-500 mt-0.5">by {o.seller}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span>📅 Purchased: {o.date}</span>
                            <span>🔑 {o.license} License</span>
                            <span>🆔 {o.id}</span>
                          </div>
                          <p className="text-xs text-green-600 font-semibold mt-2">✓ Download available — no expiry</p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition whitespace-nowrap">
                            ⬇ Download Files
                          </button>
                          <button className="border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                            Get Support
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {mockOrders.filter(o => o.downloadReady).length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-5xl mb-3">📭</div>
                      <p className="font-semibold">No downloads yet</p>
                      <p className="text-sm mt-1">Purchase a product to access downloads.</p>
                      <Link href="/" className="mt-4 inline-block bg-red-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition">Browse Products</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── WISHLIST ── */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-black text-gray-900">My Wishlist</h1>
                  <span className="text-sm text-gray-500">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</span>
                </div>
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-5xl mb-3">💔</div>
                    <p className="font-bold text-gray-900 text-lg">Your wishlist is empty</p>
                    <p className="text-sm text-gray-500 mt-1">Save products you like for later.</p>
                    <Link href="/" className="mt-5 inline-block bg-red-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition">Browse Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map(item => (
                      <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
                        <img src={item.image} alt={item.name} className="w-28 h-28 object-cover flex-shrink-0" />
                        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-snug truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">by {item.seller}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-red-600 font-black text-lg">৳{item.price.toLocaleString()}</span>
                            <div className="flex gap-2">
                              <Link href={`/item/${item.slug}`} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
                                Buy Now
                              </Link>
                              <button onClick={() => removeFromWishlist(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 text-sm px-2 rounded-xl transition" title="Remove">✕</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── AFFILIATE ── */}
            {activeTab === 'affiliate' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">🤝 Affiliate Program</h1>
                {myAffiliate ? (
                  <div className="space-y-5">
                    {/* Status card */}
                    <div className={`rounded-2xl p-6 border-2 ${myAffiliate.status === 'active' ? 'bg-[#82b541]/5 border-[#82b541]/30' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${myAffiliate.status === 'active' ? 'bg-[#82b541] text-white' : 'bg-yellow-500 text-white'}`}>
                              {myAffiliate.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">Your referral code: <strong className="font-mono text-[#82b541] text-base">{myAffiliate.refCode}</strong></p>
                          <p className="text-gray-500 text-xs mt-0.5">{myAffiliate.commissionRate}% commission on every sale</p>
                        </div>
                        <Link href="/affiliate/dashboard"
                          className="bg-[#82b541] hover:bg-[#6fa033] text-white font-black px-6 py-3 rounded-xl transition text-sm">
                          Open Full Dashboard →
                        </Link>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Available Balance', value: `৳${myAffiliate.availableBalance.toLocaleString()}`, icon: '💰', color: 'text-[#82b541]' },
                        { label: 'Total Earned', value: `৳${myAffiliate.totalEarned.toLocaleString()}`, icon: '📈', color: 'text-blue-600' },
                        { label: 'Total Clicks', value: myAffiliate.totalClicks.toString(), icon: '👆', color: 'text-purple-600' },
                        { label: 'Conversions', value: myAffiliate.totalConversions.toString(), icon: '🎯', color: 'text-orange-600' },
                      ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Referral link */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-sm font-bold text-gray-700 mb-2">🔗 Your Referral Link</p>
                      <div className="flex gap-2">
                        <input readOnly
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${myAffiliate.refCode}`}
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono bg-gray-50 text-gray-600 focus:outline-none" />
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}?ref=${myAffiliate.refCode}`)}
                          className="bg-[#82b541] hover:bg-[#6fa033] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition flex-shrink-0">
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link href="/affiliate/dashboard"
                        className="inline-flex items-center gap-2 text-[#82b541] font-bold hover:underline text-sm">
                        View full dashboard with earnings, withdrawals & tools →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div className="max-w-md mx-auto text-center">
                      <div className="text-6xl mb-4">🤝</div>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Join Our Affiliate Program</h2>
                      <p className="text-gray-500 mb-2">Earn <strong className="text-[#82b541]">10% commission</strong> on every sale you refer.</p>
                      <p className="text-gray-400 text-sm mb-6">Share your unique link on Facebook, YouTube, WhatsApp and earn money every time someone buys!</p>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {[['🔗', 'Get Unique Link'], ['📣', 'Share Products'], ['💰', 'Earn 10%']].map(([icon, label]) => (
                          <div key={label} className="text-center">
                            <div className="text-3xl mb-1">{icon}</div>
                            <p className="text-xs text-gray-600 font-semibold">{label}</p>
                          </div>
                        ))}
                      </div>
                      <Link href="/affiliate"
                        className="block w-full bg-[#82b541] hover:bg-[#6fa033] text-white font-black py-4 rounded-xl transition shadow-sm text-base">
                        Join Affiliate Program — Free →
                      </Link>
                      <p className="text-xs text-gray-400 mt-3">Free to join • No minimums • Weekly payouts via bKash</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE ── */}
            {activeTab === 'profile' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">My Profile</h1>
                <div className="space-y-5">
                  {/* Personal info */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                        <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="01XXXXXXXXX"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input value={profileForm.email} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500" />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        WhatsApp Number <span className="text-gray-400 font-normal">(for order notifications)</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-600 bg-gray-50 flex-shrink-0">🇧🇩 +880</div>
                        <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="01XXXXXXXXX"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                      <input type="password" placeholder="Min. 6 characters"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <button onClick={saveProfile} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition text-sm">
                        Save Changes
                      </button>
                      {profileSaved && <span className="text-green-600 text-sm font-semibold">✓ Saved!</span>}
                    </div>
                  </div>

                  {/* Connected accounts */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-1">Connected Accounts</h3>
                    <p className="text-sm text-gray-500 mb-5">Link social accounts for faster login</p>
                    <div className="space-y-3">
                      {/* Google */}
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Google</p>
                            <p className="text-xs text-gray-500">{connectedAccounts.google ? 'google@demo.com' : 'Not connected'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {connectedAccounts.google && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">✓ Connected</span>}
                          <button
                            onClick={() => saveConnectedAccounts({ ...connectedAccounts, google: !connectedAccounts.google })}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition ${connectedAccounts.google ? 'border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >
                            {connectedAccounts.google ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>

                      {/* Facebook */}
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Facebook</p>
                            <p className="text-xs text-gray-500">{connectedAccounts.facebook ? 'facebook@demo.com' : 'Not connected'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {connectedAccounts.facebook && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">✓ Connected</span>}
                          <button
                            onClick={() => saveConnectedAccounts({ ...connectedAccounts, facebook: !connectedAccounts.facebook })}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition ${connectedAccounts.facebook ? 'border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-[#1877F2] text-white hover:bg-[#1464d2]'}`}
                          >
                            {connectedAccounts.facebook ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">WhatsApp</p>
                            <p className="text-xs text-gray-500">{connectedAccounts.whatsapp ? `+880 ${whatsappNumber || 'Connected'}` : 'Not connected'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {connectedAccounts.whatsapp && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">✓ Connected</span>}
                          <button
                            onClick={() => saveConnectedAccounts({ ...connectedAccounts, whatsapp: !connectedAccounts.whatsapp })}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition ${connectedAccounts.whatsapp ? 'border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-[#25D366] text-white hover:bg-[#1ea855]'}`}
                          >
                            {connectedAccounts.whatsapp ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
