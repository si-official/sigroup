'use client'
import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

const transactions = [
  { id: 'TXN001', type: 'income', desc: 'Shop Order #1042 — Wireless Keyboard', amount: 4299, status: 'completed', date: '2026-07-04', method: 'bKash' },
  { id: 'TXN002', type: 'income', desc: 'Course Enrollment — Full-Stack Web Dev', amount: 8500, status: 'completed', date: '2026-07-04', method: 'Nagad' },
  { id: 'TXN003', type: 'income', desc: 'ISP Billing Suite Pro — Software Sale', amount: 25000, status: 'completed', date: '2026-07-03', method: 'Bank' },
  { id: 'TXN004', type: 'payout', desc: 'Vendor Payout — Delta ISP Ltd', amount: 18000, status: 'pending', date: '2026-07-03', method: 'Bank' },
  { id: 'TXN005', type: 'income', desc: 'Dev Services — E-commerce Project', amount: 65000, status: 'completed', date: '2026-07-02', method: 'Card' },
  { id: 'TXN006', type: 'payout', desc: 'Staff Salary — June 2026', amount: 215000, status: 'completed', date: '2026-07-01', method: 'Bank' },
  { id: 'TXN007', type: 'income', desc: 'Shop Order #1040 — CCTV Camera Set', amount: 12800, status: 'completed', date: '2026-06-30', method: 'bKash' },
  { id: 'TXN008', type: 'income', desc: 'Course Enrollment — Graphic Design Pro', amount: 5500, status: 'pending', date: '2026-06-30', method: 'Nagad' },
]

const TABS = ['Revenue Overview', 'Transactions', 'Payouts']

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState(0)

  const totalRevenue = transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const pendingPayouts = transactions.filter(t => t.type === 'payout' && t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  const commission = Math.round(totalRevenue * 0.05)

  const displayed = activeTab === 2 ? transactions.filter(t => t.type === 'payout') : transactions

  return (
    <AdminLayout title="Accounts" breadcrumb={[{ label: 'Accounts' }]}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">💰 Accounts & Finance</h1>
        <p className="text-gray-500 text-sm mt-0.5">Revenue, transactions, and payouts overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-xl">💰</div>
            <div>
              <p className="text-gray-500 text-xs">Total Revenue</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">৳{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>↑ +22%</span><span className="text-gray-400">vs last month</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-xl">⏳</div>
            <div>
              <p className="text-gray-500 text-xs">Pending Payouts</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">৳{pendingPayouts.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">{transactions.filter(t => t.status === 'pending').length} pending transactions</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-xl">📊</div>
            <div>
              <p className="text-gray-500 text-xs">Platform Commission (5%)</p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">৳{commission.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Auto-calculated from sales</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === i ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Revenue overview */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'SI Shop', amount: 17099, pct: 42, color: 'bg-orange-500' },
            { label: 'SI School', amount: 14000, pct: 35, color: 'bg-indigo-500' },
            { label: 'Dev Services', amount: 65000, pct: 15, color: 'bg-gray-500' },
            { label: 'Software Market', amount: 25000, pct: 8, color: 'bg-blue-500' },
          ].map((item) => (
            <div key={item.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{item.label}</p>
                <p className="text-gray-900 dark:text-white font-black text-sm">৳{item.amount.toLocaleString()}</p>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
              </div>
              <p className="text-gray-400 text-xs mt-1">{item.pct}% of total revenue</p>
            </div>
          ))}
        </div>
      )}

      {/* Transactions table */}
      {activeTab !== 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {displayed.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{t.id}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">{t.desc}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{t.method}</td>
                  <td className={`px-4 py-3 font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
