'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { withdrawalRequests } from '@/lib/data'
import { WithdrawalRequest } from '@/lib/types'

export default function WithdrawalsPage() {
  const [list, setList] = useState<WithdrawalRequest[]>(withdrawalRequests)
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = list.filter(w => filterStatus === 'all' || w.status === filterStatus)

  const approve = (id: string) => {
    setList(prev => prev.map(w => w.id === id ? { ...w, status: 'approved', processedAt: new Date().toISOString().split('T')[0] } : w))
  }
  const reject = (id: string) => {
    setList(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w))
  }

  const statusLabel = (s: string) => {
    if (s === 'approved') return { label: 'পরিশোধিত', cls: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' }
    if (s === 'pending') return { label: 'প্রক্রিয়াধীন', cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' }
    return { label: 'প্রত্যাখ্যাত', cls: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' }
  }

  const methodLabel = (m: string) => {
    if (m === 'bkash') return 'বিকাশ'
    if (m === 'nagad') return 'নগদ'
    if (m === 'rocket') return 'রকেট'
    return 'ব্যাংক'
  }

  return (
    <SchoolAdminLayout breadcrumb="উত্তোলন অনুরোধ">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">উত্তোলন অনুরোধ</h1>
          <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
            {list.filter(w => w.status === 'pending').length}টি পেন্ডিং
          </span>
        </div>

        <div className="flex gap-2">
          {[['all', 'সব'], ['pending', 'প্রক্রিয়াধীন'], ['approved', 'পরিশোধিত'], ['rejected', 'প্রত্যাখ্যাত']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${filterStatus === val ? 'bg-[#1CAB87] text-white' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">ব্যবহারকারী</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">পরিমাণ</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">পদ্ধতি</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">একাউন্ট</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">তারিখ</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">স্ট্যাটাস</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map(w => {
                const s = statusLabel(w.status)
                return (
                  <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800 dark:text-white">{w.accountName}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40 capitalize">{w.userRole.replace('_', ' ')}</p>
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-800 dark:text-white">৳{w.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-white/50">{methodLabel(w.method)}</td>
                    <td className="px-5 py-3 text-gray-400 dark:text-white/40 text-xs font-mono">{w.accountNumber}</td>
                    <td className="px-5 py-3 text-gray-400 dark:text-white/40 text-xs">{w.requestedAt}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      {w.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => approve(w.id)} className="text-xs bg-[#1CAB87]/10 text-[#1CAB87] font-bold px-2 py-1 rounded-lg hover:bg-[#1CAB87]/20 transition">✓ অনুমোদন</button>
                          <button onClick={() => reject(w.id)} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-2 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition">✗ প্রত্যাখ্যান</button>
                        </div>
                      )}
                      {w.status !== 'pending' && w.processedAt && (
                        <span className="text-xs text-gray-400 dark:text-white/30">{w.processedAt}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 dark:text-white/30">কোনো অনুরোধ পাওয়া যায়নি</div>}
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
