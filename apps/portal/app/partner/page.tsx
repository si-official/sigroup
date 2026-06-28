'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { api, PartnerStats, Referral, Commission } from '@/lib/portalApi'

const mockStats: PartnerStats = { total_referrals: 12, active_clients: 8, total_commission: 145000, pending_commission: 35000, tier: 'gold' }
const mockReferrals: Referral[] = [
  { id: 1, client_name: 'ABC Traders Ltd', status: 'converted', commission: 15000, referred_at: '2024-05-10' },
  { id: 2, client_name: 'XYZ Corp', status: 'pending', commission: 12000, referred_at: '2024-06-01' },
  { id: 3, client_name: 'Delta Solutions', status: 'converted', commission: 20000, referred_at: '2024-04-15' },
]
const mockCommissions: Commission[] = [
  { id: 1, amount: 15000, status: 'paid', description: 'ABC Traders - Website Project', created_at: '2024-05-20' },
  { id: 2, amount: 20000, status: 'paid', description: 'Delta Solutions - ERP Setup', created_at: '2024-05-01' },
  { id: 3, amount: 35000, status: 'pending', description: 'Q2 Commission Pool', created_at: '2024-06-30' },
]

const tierColors: Record<string, string> = { silver: 'text-gray-300', gold: 'text-yellow-300', platinum: 'text-blue-300' }
const tierBg: Record<string, string> = { silver: 'from-gray-700 to-gray-800', gold: 'from-yellow-700 to-yellow-900', platinum: 'from-blue-700 to-blue-900' }

export default function PartnerPage() {
  const { user, token, loading, isLoggedIn } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<PartnerStats>(mockStats)
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals)
  const [commissions, setCommissions] = useState<Commission[]>(mockCommissions)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/')
    if (!loading && isLoggedIn && user?.role !== 'partner' && user?.role !== 'admin') router.push('/dashboard')
  }, [loading, isLoggedIn, user, router])

  useEffect(() => {
    if (token) {
      api.partnerStats(token).then(setStats).catch(() => {})
      api.referrals(token).then(setReferrals).catch(() => {})
      api.commissions(token).then(setCommissions).catch(() => {})
    }
  }, [token])

  const tier = stats.tier || 'silver'

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        {/* Partner tier card */}
        <div className={`bg-gradient-to-r ${tierBg[tier]} rounded-3xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-widest ${tierColors[tier]}`}>Partner Tier</p>
              <h1 className={`text-4xl font-black capitalize mt-1 ${tierColors[tier]}`}>{tier} Partner</h1>
              <p className="text-gray-300 mt-2">Welcome, {user?.name}</p>
            </div>
            <div className="text-6xl">🤝</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Referrals', value: stats.total_referrals, icon: '👥' },
            { label: 'Active Clients', value: stats.active_clients, icon: '✅' },
            { label: 'Total Commission', value: `৳${stats.total_commission.toLocaleString()}`, icon: '💰' },
            { label: 'Pending Payment', value: `৳${stats.pending_commission.toLocaleString()}`, icon: '⏳' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrals */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">My Referrals</h2>
            <div className="space-y-3">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div>
                    <p className="text-white text-sm font-semibold">{r.client_name}</p>
                    <p className="text-gray-500 text-xs">{new Date(r.referred_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${r.status === 'converted' ? 'bg-green-900 text-green-300' : r.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-800 text-gray-400'}`}>
                      {r.status}
                    </span>
                    <p className="text-white text-sm font-bold mt-1">৳{r.commission.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commissions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Commission History</h2>
            <div className="space-y-3">
              {commissions.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div>
                    <p className="text-white text-sm font-semibold">{c.description}</p>
                    <p className="text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black">৳{c.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.status === 'paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
