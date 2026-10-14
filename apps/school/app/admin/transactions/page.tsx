'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'

interface Transaction {
  id: string; student: string; course: string; amount: number; method: string; date: string; status: 'success' | 'failed' | 'refunded'
}

const mockTransactions: Transaction[] = [
  { id: 'TXN001', student: 'আরিফ হোসেন', course: 'Python বাংলায়', amount: 800, method: 'bkash', date: '০৩ জুলাই ২০২৬', status: 'success' },
  { id: 'TXN002', student: 'সুমাইয়া বেগম', course: 'SSC গণিত', amount: 1200, method: 'nagad', date: '০২ জুলাই ২০২৬', status: 'success' },
  { id: 'TXN003', student: 'তানভীর আহমেদ', course: 'IELTS Foundation', amount: 2500, method: 'bank', date: '০১ জুলাই ২০২৬', status: 'success' },
  { id: 'TXN004', student: 'রহিম উদ্দিন', course: 'Web Development', amount: 1500, method: 'bkash', date: '৩০ জুন ২০২৬', status: 'success' },
  { id: 'TXN005', student: 'নাফিসা আক্তার', course: 'Digital Marketing', amount: 900, method: 'rocket', date: '২৯ জুন ২০২৬', status: 'refunded' },
  { id: 'TXN006', student: 'করিম আলী', course: 'Graphic Design', amount: 1800, method: 'nagad', date: '২৮ জুন ২০২৬', status: 'failed' },
  { id: 'TXN007', student: 'ফারহান হোসেন', course: 'React Bangla', amount: 1200, method: 'bkash', date: '২৭ জুন ২০২৬', status: 'success' },
  { id: 'TXN008', student: 'সালমা খানম', course: 'HSC Physics', amount: 600, method: 'nagad', date: '২৬ জুন ২০২৬', status: 'success' },
  { id: 'TXN009', student: 'জাহিদ হাসান', course: 'Spoken English', amount: 1500, method: 'bank', date: '২৫ জুন ২০২৬', status: 'success' },
  { id: 'TXN010', student: 'মিম আক্তার', course: 'Excel Bangla', amount: 500, method: 'bkash', date: '২৪ জুন ২০২৬', status: 'success' },
]

const methodLabel = (m: string) => ({ bkash: 'বিকাশ', nagad: 'নগদ', rocket: 'রকেট', bank: 'ব্যাংক' }[m] || m)

export default function TransactionsPage() {
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = mockTransactions.filter(t => {
    const matchMethod = filterMethod === 'all' || t.method === filterMethod
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchMethod && matchStatus
  })

  const total = filtered.filter(t => t.status === 'success').reduce((s, t) => s + t.amount, 0)

  const statusStyle = (s: string) => ({
    success: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    failed: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    refunded: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/40',
  }[s] || '')

  const statusLabelText = (s: string) => ({ success: 'সফল', failed: 'ব্যর্থ', refunded: 'ফেরত' }[s] || s)

  return (
    <SchoolAdminLayout breadcrumb="লেনদেন">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">লেনদেন</h1>
          <span className="text-sm font-bold text-[#1CAB87]">মোট: ৳{total.toLocaleString()}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white">
            <option value="all">সব পদ্ধতি</option>
            <option value="bkash">বিকাশ</option>
            <option value="nagad">নগদ</option>
            <option value="rocket">রকেট</option>
            <option value="bank">ব্যাংক</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white">
            <option value="all">সব স্ট্যাটাস</option>
            <option value="success">সফল</option>
            <option value="failed">ব্যর্থ</option>
            <option value="refunded">ফেরত</option>
          </select>
        </div>

        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">আইডি</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">শিক্ষার্থী</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">কোর্স</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">পরিমাণ</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">পদ্ধতি</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">তারিখ</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                  <td className="px-5 py-3 font-mono text-xs text-gray-400 dark:text-white/40">{t.id}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800 dark:text-white">{t.student}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-white/50 max-w-[160px] truncate">{t.course}</td>
                  <td className="px-5 py-3 font-bold text-gray-800 dark:text-white">৳{t.amount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-white/50">{methodLabel(t.method)}</td>
                  <td className="px-5 py-3 text-gray-400 dark:text-white/40 text-xs">{t.date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyle(t.status)}`}>{statusLabelText(t.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 dark:text-white/30">কোনো লেনদেন পাওয়া যায়নি</div>}
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
