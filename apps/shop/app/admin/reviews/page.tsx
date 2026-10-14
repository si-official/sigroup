'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { Search, CheckCircle, XCircle, Trash2, Star } from 'lucide-react'

interface Review {
  id: string
  product: string
  reviewer: string
  email: string
  rating: number
  comment: string
  date: string
  status: 'approved' | 'pending' | 'rejected'
}

const defaultReviews: Review[] = [
  { id: 'r1', product: 'Restaurant POS System', reviewer: 'Arif Hossain', email: 'arif@example.com', rating: 5, comment: 'Excellent product! Exactly what we needed for our restaurant. Setup was smooth and support is great.', date: '2025-07-03', status: 'approved' },
  { id: 'r2', product: 'SaaS Admin Dashboard', reviewer: 'Priya Das', email: 'priya@example.com', rating: 4, comment: 'Great template, clean design. Took a bit to understand the folder structure but overall very good.', date: '2025-07-02', status: 'approved' },
  { id: 'r3', product: 'School ERP System', reviewer: 'Kamal Hossain', email: 'kamal@example.com', rating: 5, comment: 'Very complete system. Our school has been using it for 6 months with no issues.', date: '2025-07-01', status: 'pending' },
  { id: 'r4', product: 'WooCommerce bKash Plugin', reviewer: 'Mitu Akter', email: 'mitu@example.com', rating: 4, comment: 'Works perfectly with WooCommerce. bKash payment integration was quick to set up.', date: '2025-06-30', status: 'approved' },
  { id: 'r5', product: 'Hospital Management System', reviewer: 'Reza Islam', email: 'reza@example.com', rating: 3, comment: 'Good system but documentation could be better. Required some customization for our needs.', date: '2025-06-29', status: 'pending' },
  { id: 'r6', product: 'Food Delivery Flutter App', reviewer: 'Nasim Khan', email: 'nasim@example.com', rating: 1, comment: 'SPAM REVIEW — this is a fake account trying to damage the vendor reputation.', date: '2025-06-28', status: 'rejected' },
  { id: 'r7', product: 'Nagad Payment Laravel', reviewer: 'Salam Uddin', email: 'salam@example.com', rating: 5, comment: 'Best Nagad integration package out there. Clean code, well documented.', date: '2025-06-27', status: 'approved' },
  { id: 'r8', product: 'Multi-Vendor Flutter App', reviewer: 'Farida Begum', email: 'farida@example.com', rating: 4, comment: 'Three apps in one package is amazing value. Flutter code is clean and well structured.', date: '2025-06-26', status: 'pending' },
]

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(defaultReviews)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = reviews.filter(r => {
    const matchSearch = r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || r.status === filter
    return matchSearch && matchFilter
  })

  function updateStatus(id: string, status: Review['status']) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  return (
    <ShopAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{reviews.length} Reviews</h2>
          <p className="text-sm text-gray-500">Moderate product reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#82b541]"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'approved', 'pending', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? 'bg-[#82b541] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className={`bg-white rounded-xl border p-5 ${r.status === 'rejected' ? 'border-red-100 opacity-70' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-gray-800 text-sm">{r.reviewer}</span>
                  <span className="text-xs text-gray-400">{r.email}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">on {r.product}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{r.date}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(r.id, 'approved')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium"
                  >
                    <CheckCircle size={12} /> Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(r.id, 'rejected')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                )}
                <button
                  onClick={() => deleteReview(r.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">No reviews found</div>
        )}
      </div>
    </ShopAdminLayout>
  )
}
