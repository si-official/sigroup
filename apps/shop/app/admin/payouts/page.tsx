'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'

interface Payout {
  id: string
  vendor: string
  shop: string
  amount: number
  method: 'bKash' | 'Nagad' | 'Bank Transfer'
  accountNo: string
  requestedDate: string
  status: 'pending' | 'approved' | 'rejected'
}

const defaultPayouts: Payout[] = [
  { id: 'PAY-001', vendor: 'Rahim Uddin', shop: 'TechBD Solutions', amount: 150000, method: 'bKash', accountNo: '01712345678', requestedDate: '2025-07-04', status: 'pending' },
  { id: 'PAY-002', vendor: 'Farida Begum', shop: 'DesignHut BD', amount: 280000, method: 'Bank Transfer', accountNo: 'BRAC Bank — 1234567890', requestedDate: '2025-07-03', status: 'pending' },
  { id: 'PAY-003', vendor: 'Karim Ahmed', shop: 'AppFactory BD', amount: 75000, method: 'Nagad', accountNo: '01987654321', requestedDate: '2025-07-03', status: 'approved' },
  { id: 'PAY-004', vendor: 'Nasrin Sultana', shop: 'PluginPro BD', amount: 42000, method: 'bKash', accountNo: '01811223344', requestedDate: '2025-07-02', status: 'approved' },
  { id: 'PAY-005', vendor: 'Sajib Hossain', shop: 'ScriptMart BD', amount: 95000, method: 'bKash', accountNo: '01700001111', requestedDate: '2025-07-01', status: 'rejected' },
  { id: 'PAY-006', vendor: 'Rahim Uddin', shop: 'TechBD Solutions', amount: 200000, method: 'Bank Transfer', accountNo: 'Dutch Bangla — 9876543210', requestedDate: '2025-06-28', status: 'approved' },
]

const methodColors: Record<string, string> = {
  'bKash': 'bg-pink-100 text-pink-700',
  'Nagad': 'bg-orange-100 text-orange-700',
  'Bank Transfer': 'bg-blue-100 text-blue-700',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState(defaultPayouts)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? payouts : payouts.filter(p => p.status === filter)

  function updateStatus(id: string, status: Payout['status']) {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const pendingTotal = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const approvedTotal = payouts.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0)

  return (
    <ShopAdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock size={16} />
            <span className="text-sm font-medium">Pending Payouts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">৳{pendingTotal.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{payouts.filter(p => p.status === 'pending').length} requests awaiting</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Approved This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">৳{approvedTotal.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{payouts.filter(p => p.status === 'approved').length} payouts processed</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CreditCard size={16} />
            <span className="text-sm font-medium">Avg Payout</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">৳{Math.round((pendingTotal + approvedTotal) / payouts.length).toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">Per vendor request</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['All', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-[#82b541] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-75">({payouts.filter(p => p.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-800 text-sm">{p.vendor}</div>
                    <div className="text-xs text-gray-400">{p.shop}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-800">৳{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${methodColors[p.method]}`}>{p.method}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600 font-mono">{p.accountNo}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{p.requestedDate}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(p.id, 'approved')}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium"
                          >
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button
                            onClick={() => updateStatus(p.id, 'rejected')}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                          >
                            <XCircle size={11} /> Reject
                          </button>
                        </>
                      )}
                      {p.status !== 'pending' && (
                        <span className="text-xs text-gray-400">
                          {p.status === 'approved' ? 'Processed' : 'Rejected'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400">No payouts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ShopAdminLayout>
  )
}
