'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { coachingCenters } from '@/lib/data'
import { CoachingCenter } from '@/lib/types'

export default function CoachingPage() {
  const [list, setList] = useState<CoachingCenter[]>(coachingCenters)
  const [search, setSearch] = useState('')

  const filtered = list.filter(c =>
    c.brandName.toLowerCase().includes(search.toLowerCase())
  )

  const toggleVerify = (id: string) => {
    setList(prev => prev.map(c => c.id === id ? { ...c, verified: !c.verified } : c))
  }

  const deleteCenter = (id: string) => {
    setList(prev => prev.filter(c => c.id !== id))
  }

  return (
    <SchoolAdminLayout breadcrumb="কোচিং সেন্টার">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">কোচিং সেন্টার</h1>
          <span className="text-xs text-gray-400 dark:text-white/40">{filtered.length}টি সেন্টার</span>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="সেন্টার খুঁজুন..."
          className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 w-full max-w-sm" />

        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">প্রতিষ্ঠান</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">কোর্স</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">শিক্ষার্থী</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">আয়</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">স্ট্যাটাস</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map(center => (
                <tr key={center.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400 text-sm shrink-0">{center.brandName[0]}</div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{center.brandName}</p>
                        {center.verified && <span className="text-xs text-[#1CAB87]">✓ যাচাইকৃত</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-white/50">{center.totalCourses || 0}টি</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-white/50">{(center.totalStudents || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 font-bold text-[#1CAB87]">৳{center.totalEarnings.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${center.verified ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                      {center.verified ? 'যাচাইকৃত' : 'অপেক্ষমান'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => toggleVerify(center.id)} className={`text-xs px-2 py-1 rounded-lg transition ${center.verified ? 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10' : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20'}`}>
                        {center.verified ? '⊘ যাচাই বাতিল' : '✓ যাচাই'}
                      </button>
                      <button className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition">⊘ স্থগিত</button>
                      <button onClick={() => deleteCenter(center.id)} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition">✗ মুছুন</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 dark:text-white/30">কোনো কোচিং সেন্টার পাওয়া যায়নি</div>}
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
