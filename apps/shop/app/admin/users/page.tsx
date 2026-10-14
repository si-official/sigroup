'use client'
import { useState, useEffect } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { DEFAULT_USERS, getUsers, saveUsers, User, Role, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import { Search, Plus, Edit2, Trash2, Shield } from 'lucide-react'

const ROLES: Role[] = ['super_admin', 'admin', 'vendor', 'customer']

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer' as Role })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setUsers(getUsers())
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    return matchSearch && matchRole
  })

  function updateUserRole(id: string, role: Role) {
    const updated = users.map(u => u.id === id ? { ...u, role } : u)
    setUsers(updated)
    saveUsers(updated)
  }

  function toggleStatus(id: string) {
    const updated = users.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' as const : 'active' as const } : u
    )
    setUsers(updated)
    saveUsers(updated)
  }

  function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return
    const updated = users.filter(u => u.id !== id)
    setUsers(updated)
    saveUsers(updated)
  }

  function addUser() {
    if (!newUser.name || !newUser.email) return
    const user: User = {
      id: 'u' + Date.now(),
      ...newUser,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    }
    const updated = [...users, user]
    setUsers(updated)
    saveUsers(updated)
    setNewUser({ name: '', email: '', password: '', role: 'customer' })
    setShowAdd(false)
  }

  return (
    <ShopAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{users.length} Users</h2>
          <p className="text-sm text-gray-500">Manage all platform users</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#82b541]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#82b541] bg-white"
        >
          <option value="All">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#82b541] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.avatar ?? u.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{u.name}</div>
                        {u.shopName && <div className="text-xs text-gray-400">{u.shopName}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3.5">
                    {editingId === u.id ? (
                      <select
                        value={u.role}
                        onChange={e => { updateUserRole(u.id, e.target.value as Role); setEditingId(null) }}
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        className="text-xs border border-[#82b541] rounded px-2 py-1 bg-white focus:outline-none"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingId(u.id)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium hover:opacity-80 transition-opacity ${ROLE_COLORS[u.role]}`}
                      >
                        <Shield size={10} />
                        {ROLE_LABELS[u.role]}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-opacity hover:opacity-80 ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{u.createdAt}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingId(u.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#82b541] hover:bg-[#82b541]/10 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        disabled={u.role === 'super_admin'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-semibold text-gray-900 text-lg mb-5">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" placeholder="Password" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as Role }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] bg-white">
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={addUser} className="flex-1 py-2 bg-[#82b541] text-white rounded-lg text-sm font-medium hover:bg-[#6ea032]">Add User</button>
            </div>
          </div>
        </div>
      )}
    </ShopAdminLayout>
  )
}
