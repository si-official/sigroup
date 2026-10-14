'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { Search, Filter, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'

interface Order {
  id: string
  customer: string
  email: string
  products: string
  amount: number
  method: string
  status: 'pending' | 'completed' | 'cancelled'
  date: string
}

const defaultOrders: Order[] = [
  { id: 'ORD-2847', customer: 'Arif Hossain', email: 'arif@example.com', products: 'Restaurant POS System', amount: 4500, method: 'bKash', status: 'completed', date: '2025-07-04' },
  { id: 'ORD-2846', customer: 'Priya Das', email: 'priya@example.com', products: 'SaaS Admin Dashboard', amount: 1200, method: 'SSLCommerz', status: 'completed', date: '2025-07-04' },
  { id: 'ORD-2845', customer: 'Sajjad Ali', email: 'sajjad@example.com', products: 'School ERP System', amount: 7500, method: 'Nagad', status: 'pending', date: '2025-07-03' },
  { id: 'ORD-2844', customer: 'Mitu Akter', email: 'mitu@example.com', products: 'WooCommerce bKash Plugin', amount: 800, method: 'bKash', status: 'completed', date: '2025-07-03' },
  { id: 'ORD-2843', customer: 'Riaz Uddin', email: 'riaz@example.com', products: 'Food Delivery Flutter App', amount: 6800, method: 'SSLCommerz', status: 'cancelled', date: '2025-07-02' },
  { id: 'ORD-2842', customer: 'Nadia Islam', email: 'nadia@example.com', products: 'Multi-Vendor Flutter App', amount: 3800, method: 'bKash', status: 'completed', date: '2025-07-02' },
  { id: 'ORD-2841', customer: 'Kamal Hossain', email: 'kamal@example.com', products: 'Hospital Management System', amount: 12000, method: 'Bank Transfer', status: 'pending', date: '2025-07-01' },
  { id: 'ORD-2840', customer: 'Reza Alam', email: 'reza@example.com', products: 'Nagad Payment Laravel', amount: 500, method: 'Nagad', status: 'completed', date: '2025-07-01' },
  { id: 'ORD-2839', customer: 'Farida Khan', email: 'farida@example.com', products: 'Next.js Portfolio Template', amount: 900, method: 'bKash', status: 'completed', date: '2025-06-30' },
  { id: 'ORD-2838', customer: 'Salam Chowdhury', email: 'salam@example.com', products: 'Inventory POS PHP Script', amount: 2200, method: 'SSLCommerz', status: 'completed', date: '2025-06-30' },
]

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle size={12} />,
  pending: <Clock size={12} />,
  cancelled: <XCircle size={12} />,
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(defaultOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const filtered = orders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.products.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totals = {
    total: orders.reduce((s, o) => s + o.amount, 0),
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  function updateStatus(id: string, status: Order['status']) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <ShopAdminLayout>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `৳${totals.total.toLocaleString()}`, color: 'text-green-600' },
          { label: 'Completed', value: totals.completed, color: 'text-green-600' },
          { label: 'Pending', value: totals.pending, color: 'text-yellow-600' },
          { label: 'Cancelled', value: totals.cancelled, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#82b541]"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'completed', 'pending', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#82b541] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{o.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-800 text-sm">{o.customer}</div>
                    <div className="text-xs text-gray-400">{o.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[180px]">
                    <div className="truncate">{o.products}</div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">৳{o.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{o.method}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{o.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`flex items-center gap-1 w-fit text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[o.status]}`}>
                      {statusIcon[o.status]}
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {o.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(o.id, 'completed')}
                            className="px-2.5 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-md font-medium transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateStatus(o.id, 'cancelled')}
                            className="px-2.5 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-md font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {o.status !== 'pending' && (
                        <button
                          onClick={() => updateStatus(o.id, 'pending')}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Reset to pending"
                        >
                          <RefreshCw size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>
    </ShopAdminLayout>
  )
}
