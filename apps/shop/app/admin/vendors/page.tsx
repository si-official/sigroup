'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { sellers as defaultSellers } from '@/lib/data'
import { Seller } from '@/lib/types'
import { Search, Plus, CheckCircle, XCircle, Trash2, Star, Package, ShoppingCart } from 'lucide-react'

interface VendorData extends Seller {
  status: 'active' | 'suspended'
  badge: string
  email: string
  earnings: number
  totalSales: number
}

const vendorData: VendorData[] = defaultSellers.map((s, i) => ({
  ...s,
  email: s.email,
  status: 'active' as const,
  badge: ['Power Elite Author', 'Elite Author', 'Author', 'Author', 'Author'][i] ?? 'Author',
  earnings: [2808600, 4254000, 1284000, 589000, 2100000][i] ?? 0,
  totalSales: s.totalSales,
}))

export default function VendorsPage() {
  const [vendors, setVendors] = useState(vendorData)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newVendor, setNewVendor] = useState({ name: '', shopName: '', email: '', bio: '' })

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.shopName.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  )

  function toggleStatus(id: string) {
    setVendors(prev => prev.map(v =>
      v.id === id ? { ...v, status: v.status === 'active' ? 'suspended' : 'active' } : v
    ))
  }

  function deleteVendor(id: string) {
    if (!confirm('Remove this vendor?')) return
    setVendors(prev => prev.filter(v => v.id !== id))
  }

  function addVendor() {
    if (!newVendor.name || !newVendor.email) return
    const vendor: VendorData = {
      id: 'v' + Date.now(),
      name: newVendor.name,
      shopName: newVendor.shopName || newVendor.name + ' Shop',
      email: newVendor.email,
      bio: newVendor.bio,
      totalProducts: 0,
      totalSales: 0,
      rating: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      verified: false,
      categories: [],
      avatar: newVendor.name[0].toUpperCase(),
      status: 'active',
      badge: 'Author',
      earnings: 0,
    }
    setVendors(prev => [...prev, vendor])
    setNewVendor({ name: '', shopName: '', email: '', bio: '' })
    setShowAdd(false)
  }

  const badgeColor: Record<string, string> = {
    'Power Elite Author': 'bg-yellow-100 text-yellow-700',
    'Elite Author': 'bg-purple-100 text-purple-700',
    'Author': 'bg-blue-100 text-blue-700',
  }

  return (
    <ShopAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{vendors.length} Vendors</h2>
          <p className="text-sm text-gray-500">Manage marketplace vendors</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vendors..."
          className="w-full max-w-sm pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#82b541] bg-white"
        />
      </div>

      {/* Vendor cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(v => (
          <div key={v.id} className={`bg-white rounded-xl border p-5 transition-all ${v.status === 'suspended' ? 'border-red-200 opacity-75' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#82b541] flex items-center justify-center text-white text-lg font-bold">
                  {v.avatar ?? v.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                    {v.name}
                    {v.verified && <CheckCircle size={13} className="text-[#82b541]" />}
                  </div>
                  <div className="text-sm text-gray-500">{v.shopName}</div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeColor[v.badge] ?? 'bg-gray-100 text-gray-500'}`}>
                {v.badge}
              </span>
            </div>

            {/* Email */}
            <div className="text-xs text-gray-400 mb-3">{v.email}</div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-gray-50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-0.5"><Package size={11} /> Products</div>
                <div className="font-bold text-gray-800">{v.totalProducts}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-0.5"><ShoppingCart size={11} /> Sales</div>
                <div className="font-bold text-gray-800">{v.totalSales}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-0.5"><Star size={11} /> Rating</div>
                <div className="font-bold text-gray-800">{v.rating > 0 ? v.rating : '—'}</div>
              </div>
            </div>

            <div className="text-xs text-gray-600 mb-4">
              <span className="font-semibold text-gray-800">৳{v.earnings.toLocaleString()}</span> total earnings
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {v.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(v.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    v.status === 'active'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {v.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteVendor(v.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-semibold text-gray-900 text-lg mb-5">Add New Vendor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input type="text" value={newVendor.name} onChange={e => setNewVendor(v => ({ ...v, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" placeholder="Vendor name" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shop Name</label>
                <input type="text" value={newVendor.shopName} onChange={e => setNewVendor(v => ({ ...v, shopName: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" placeholder="Shop / brand name" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" value={newVendor.email} onChange={e => setNewVendor(v => ({ ...v, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" placeholder="vendor@email.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bio</label>
                <textarea value={newVendor.bio} onChange={e => setNewVendor(v => ({ ...v, bio: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] resize-none" placeholder="Short vendor bio" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={addVendor} className="flex-1 py-2 bg-[#82b541] text-white rounded-lg text-sm font-medium hover:bg-[#6ea032]">Add Vendor</button>
            </div>
          </div>
        </div>
      )}
    </ShopAdminLayout>
  )
}
