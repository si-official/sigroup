'use client'
import { useState, useEffect } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { products as defaultProducts } from '@/lib/data'
import { Product } from '@/lib/types'
import { Search, Plus, Edit2, Trash2, Eye, Filter, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

const categories = ['All', 'software', 'mobile-app', 'template', 'plugin', 'script', 'ui-kit']
const statuses = ['All', 'approved', 'pending', 'rejected']

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [productList, setProductList] = useState<(Product & { status: string })[]>([])

  useEffect(() => {
    const withStatus = defaultProducts.map(p => ({
      ...p,
      status: p.id === 'p4' || p.id === 'p11' ? 'pending' : 'approved',
    }))
    setProductList(withStatus)
  }, [])

  const filtered = productList.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sellerId.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || p.category === catFilter
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  function toggleStatus(id: string) {
    setProductList(prev => prev.map(p => {
      if (p.id !== id) return p
      const next = p.status === 'approved' ? 'pending' : 'approved'
      return { ...p, status: next }
    }))
  }

  function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    setProductList(prev => prev.filter(p => p.id !== id))
  }

  const statusIcon: Record<string, React.ReactNode> = {
    approved: <CheckCircle size={14} className="text-green-500" />,
    pending: <Clock size={14} className="text-yellow-500" />,
    rejected: <XCircle size={14} className="text-red-500" />,
  }
  const statusClass: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <ShopAdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{productList.length} Products</h2>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/add-product"
          className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#82b541] focus:ring-1 focus:ring-[#82b541]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#82b541] bg-white"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#82b541] bg-white"
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sales</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate max-w-[180px]">{p.name}</div>
                        <div className="text-xs text-gray-400">ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md capitalize">{p.category}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">
                    {p.price === 0 ? <span className="text-green-600">Free</span> : `৳${p.price.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{p.sales}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleStatus(p.id)}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-opacity hover:opacity-80 ${statusClass[p.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {statusIcon[p.status]}
                      {p.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium text-gray-700 ml-1">{p.rating}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/item/${p.slug}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#82b541] hover:bg-[#82b541]/10 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {productList.length} products
        </div>
      </div>
    </ShopAdminLayout>
  )
}
