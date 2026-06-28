'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { api, AdminStats, User } from '@/lib/portalApi'

const mockStats: AdminStats = { total_users: 48, total_clients: 32, total_partners: 8, monthly_revenue: 850000, open_tickets: 5, active_projects: 14 }
const mockUsers: User[] = [
  { id: 1, name: 'Rahim Uddin', email: 'rahim@abc.com', role: 'client', company: 'ABC Traders Ltd' },
  { id: 2, name: 'Nadia Haque', email: 'nadia@delta.com', role: 'partner', company: 'Delta Solutions' },
  { id: 3, name: 'Karim Ahmed', email: 'karim@xyz.com', role: 'client', company: 'XYZ Corp' },
  { id: 4, name: 'Sara Islam', email: 'sara@company.com', role: 'employee' },
  { id: 5, name: 'Ali Hassan', email: 'ali@bizco.com', role: 'client', company: 'BizCo Ltd' },
]

const roleColors: Record<string, string> = {
  admin: 'bg-red-900 text-red-300', client: 'bg-purple-900 text-purple-300',
  partner: 'bg-yellow-900 text-yellow-300', employee: 'bg-blue-900 text-blue-300',
}

export default function AdminPage() {
  const { user, token, loading, isLoggedIn } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>(mockStats)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/')
    if (!loading && isLoggedIn && user?.role !== 'admin') router.push('/dashboard')
  }, [loading, isLoggedIn, user, router])

  useEffect(() => {
    if (token) {
      api.adminStats(token).then(setStats).catch(() => {})
      api.users(token).then(setUsers).catch(() => {})
    }
  }, [token])

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || u.role === filterRole
    return matchSearch && matchRole
  })

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">SI Group system overview</p>
          </div>
          <span className="bg-red-900 text-red-300 text-xs px-3 py-1.5 rounded-full font-semibold">Admin Access</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'border-purple-800' },
            { label: 'Active Clients', value: stats.total_clients, icon: '🏢', color: 'border-blue-800' },
            { label: 'Partners', value: stats.total_partners, icon: '🤝', color: 'border-yellow-800' },
            { label: 'Monthly Revenue', value: `৳${stats.monthly_revenue.toLocaleString()}`, icon: '💰', color: 'border-green-800' },
            { label: 'Open Tickets', value: stats.open_tickets, icon: '🎫', color: 'border-orange-800' },
            { label: 'Active Projects', value: stats.active_projects, icon: '🚀', color: 'border-pink-800' },
          ].map((s) => (
            <div key={s.label} className={`bg-gray-900 border ${s.color} rounded-2xl p-5`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-white">Users</h2>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..."
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" />
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                <option value="all">All Roles</option>
                <option value="client">Client</option>
                <option value="partner">Partner</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Company</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4 text-gray-500">{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {u.name[0]}
                        </div>
                        <span className="text-white font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleColors[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{u.company || '—'}</td>
                    <td className="px-6 py-4">
                      <button className="text-purple-400 hover:text-purple-300 text-xs font-semibold mr-3">Edit</button>
                      <button className="text-red-500 hover:text-red-400 text-xs font-semibold">Suspend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-gray-600 py-12">No users found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
