'use client'
import { useState, useEffect } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { getAffiliates, saveAffiliates, getAllWithdrawals, AffiliateUser, AffiliateWithdrawal } from '@/lib/affiliate'
import { Users, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, MousePointer, RefreshCw } from 'lucide-react'

const TABS = ['All Affiliates', 'Pending Approval', 'Withdrawals', 'Analytics']

export default function AffiliatesAdminPage() {
  const [affiliates, setAffiliates] = useState<AffiliateUser[]>([])
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawal[]>([])
  const [tab, setTab] = useState('All Affiliates')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setAffiliates(getAffiliates())
    setWithdrawals(getAllWithdrawals())
  }, [])

  function updateStatus(id: string, status: AffiliateUser['status']) {
    const updated = affiliates.map(a => a.id === id ? { ...a, status } : a)
    setAffiliates(updated)
    saveAffiliates(updated)
  }

  function updateWithdrawalStatus(wdId: string, status: AffiliateWithdrawal['status']) {
    const all = getAllWithdrawals()
    const updated = all.map(w => w.id === wdId ? { ...w, status, processedAt: new Date().toISOString() } : w)
    localStorage.setItem('si_aff_withdrawals', JSON.stringify(updated))
    setWithdrawals(updated)
  }

  const pending = affiliates.filter(a => a.status === 'pending')
  const active = affiliates.filter(a => a.status === 'active')
  const filtered = affiliates.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.refCode.toLowerCase().includes(search.toLowerCase())
  )

  const totalEarned = affiliates.reduce((s, a) => s + a.totalEarned, 0)
  const totalClicks = affiliates.reduce((s, a) => s + a.totalClicks, 0)
  const totalConversions = affiliates.reduce((s, a) => s + a.totalConversions, 0)

  const statusBadge = (s: string) => ({
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600')

  return (
    <ShopAdminLayout title="Affiliate Management" breadcrumb={[{ label: 'Affiliates' }]}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Affiliates', value: affiliates.length, sub: `${active.length} active`, icon: Users, color: 'text-[#82b541]', bg: 'bg-[#82b541]/10' },
          { label: 'Total Commissions', value: `৳${totalEarned.toLocaleString()}`, sub: 'All time paid', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), sub: 'Referral visits', icon: MousePointer, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Conversions', value: totalConversions, sub: `${totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0}% rate`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={s.color} />
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-700 text-sm font-semibold">{s.label}</p>
              <p className="text-gray-400 text-xs">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Pending alert */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3.5 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-yellow-600" />
            <p className="text-yellow-800 font-semibold text-sm">{pending.length} affiliate{pending.length > 1 ? 's' : ''} waiting for approval</p>
          </div>
          <button onClick={() => setTab('Pending Approval')} className="text-xs font-bold text-yellow-700 hover:underline">Review →</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
            {t === 'Pending Approval' && pending.length > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-white text-[10px] font-black w-4 h-4 rounded-full inline-flex items-center justify-center">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ALL AFFILIATES ── */}
      {tab === 'All Affiliates' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, code..."
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#82b541] w-64" />
            <span className="text-gray-400 text-sm">{filtered.length} affiliates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Affiliate</th>
                  <th className="px-6 py-3 text-left">Ref Code</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Clicks</th>
                  <th className="px-6 py-3 text-center">Sales</th>
                  <th className="px-6 py-3 text-right">Earned</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#82b541]/20 rounded-xl flex items-center justify-center text-[#82b541] font-black text-sm">
                          {a.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-400">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-bold">{a.refCode}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge(a.status)}`}>{a.status.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{a.totalClicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{a.totalConversions}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#82b541]">৳{a.totalEarned.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status !== 'active' && (
                          <button onClick={() => updateStatus(a.id, 'active')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {a.status !== 'suspended' && (
                          <button onClick={() => updateStatus(a.id, 'suspended')}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Suspend">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PENDING APPROVAL ── */}
      {tab === 'Pending Approval' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-bold text-gray-700">All caught up! No pending affiliates.</p>
            </div>
          ) : pending.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-yellow-200 p-5 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-700 font-black text-xl">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{a.name}</p>
                    <p className="text-sm text-gray-500">{a.email} • {a.phone}</p>
                    <p className="text-xs text-gray-400">Applied: {a.joinedAt}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(a.id, 'active')}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition">
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button onClick={() => updateStatus(a.id, 'suspended')}
                    className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold px-4 py-2.5 rounded-xl text-sm transition">
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WITHDRAWALS ── */}
      {tab === 'Withdrawals' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Withdrawal Requests</h3>
          </div>
          {withdrawals.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p><p className="text-sm">No withdrawal requests</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Affiliate</th>
                  <th className="px-6 py-3 text-center">Amount</th>
                  <th className="px-6 py-3 text-center">Method</th>
                  <th className="px-6 py-3 text-center">Account</th>
                  <th className="px-6 py-3 text-center">Date</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {withdrawals.map(w => {
                  const aff = affiliates.find(a => a.id === w.affiliateId)
                  return (
                    <tr key={w.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3.5 font-medium text-gray-800">{aff?.name || 'Unknown'}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-[#82b541]">৳{w.amount.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-center uppercase text-xs font-bold text-gray-600">{w.method}</td>
                      <td className="px-6 py-3.5 text-center font-mono text-xs text-gray-500">{w.account}</td>
                      <td className="px-6 py-3.5 text-center text-gray-400 text-xs">{new Date(w.requestedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${w.status === 'paid' ? 'bg-green-100 text-green-700' : w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {w.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => updateWithdrawalStatus(w.id, 'paid')}
                              className="text-xs font-bold bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition">
                              Mark Paid
                            </button>
                            <button onClick={() => updateWithdrawalStatus(w.id, 'rejected')}
                              className="text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab === 'Analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Avg Commission/Sale', value: '৳507', icon: '💰' },
              { label: 'Conversion Rate', value: `${totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0}%`, icon: '🎯' },
              { label: 'Active This Month', value: active.length, icon: '👥' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Top Performing Affiliates</h3>
            <div className="space-y-3">
              {[...affiliates].sort((a, b) => b.totalEarned - a.totalEarned).slice(0, 5).map((a, i) => (
                <div key={a.id} className="flex items-center gap-4">
                  <span className="text-lg font-black text-gray-300 w-6">#{i + 1}</span>
                  <div className="w-8 h-8 bg-[#82b541]/20 rounded-xl flex items-center justify-center text-[#82b541] font-black text-sm">
                    {a.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.totalConversions} sales • {a.totalClicks} clicks</p>
                  </div>
                  <p className="font-black text-[#82b541]">৳{a.totalEarned.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ShopAdminLayout>
  )
}
