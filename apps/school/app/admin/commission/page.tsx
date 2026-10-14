'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'

interface CatCommission { cat: string; catBn: string; rate: number }

const initialCatCommissions: CatCommission[] = [
  { cat: 'Academic', catBn: 'একাডেমিক', rate: 15 },
  { cat: 'Programming', catBn: 'প্রোগ্রামিং', rate: 20 },
  { cat: 'Design', catBn: 'ডিজাইন', rate: 18 },
  { cat: 'Language', catBn: 'ভাষা', rate: 15 },
  { cat: 'Business', catBn: 'ব্যবসা', rate: 20 },
  { cat: 'Skills', catBn: 'দক্ষতা', rate: 18 },
]

export default function CommissionPage() {
  const [globalRate, setGlobalRate] = useState(20)
  const [catCommissions, setCatCommissions] = useState<CatCommission[]>(initialCatCommissions)
  const [saved, setSaved] = useState(false)

  const updateCatRate = (idx: number, rate: number) => {
    setCatCommissions(prev => prev.map((c, i) => i === idx ? { ...c, rate } : c))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <SchoolAdminLayout breadcrumb="কমিশন সেটিং">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">কমিশন সেটিং</h1>

        {saved && (
          <div className="bg-[#1CAB87]/10 border border-[#1CAB87]/30 text-[#1CAB87] text-sm px-4 py-3 rounded-xl font-semibold">
            ✓ সফলভাবে সংরক্ষণ করা হয়েছে!
          </div>
        )}

        {/* Global Commission */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-1">গ্লোবাল কমিশন রেট</h2>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">সমস্ত কোর্সের জন্য ডিফল্ট কমিশন রেট</p>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <input
                type="number"
                value={globalRate}
                onChange={e => setGlobalRate(Math.min(50, Math.max(0, Number(e.target.value))))}
                min={0} max={50}
                className="w-24 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-4 py-3 text-center font-bold text-lg text-gray-800 dark:text-white outline-none focus:border-[#1CAB87] transition"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
            </div>
            <div className="flex-1">
              <input
                type="range"
                min={0} max={50}
                value={globalRate}
                onChange={e => setGlobalRate(Number(e.target.value))}
                className="w-full accent-[#1CAB87]"
              />
              <div className="flex justify-between text-xs text-gray-400 dark:text-white/40 mt-1">
                <span>০%</span><span>২৫%</span><span>৫০%</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#FF6B35] font-semibold">⚠ পরিবর্তন নতুন কোর্স থেকে কার্যকর হবে</p>
        </div>

        {/* Category Commission */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-1">বিভাগ অনুযায়ী কমিশন</h2>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">প্রতিটি ক্যাটাগরির জন্য আলাদা রেট নির্ধারণ করুন</p>

          <div className="space-y-3">
            {catCommissions.map((item, idx) => (
              <div key={item.cat} className="flex items-center gap-4">
                <span className="w-36 text-sm font-semibold text-gray-700 dark:text-white/70">{item.catBn}</span>
                <div className="relative">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={e => updateCatRate(idx, Math.min(50, Math.max(0, Number(e.target.value))))}
                    min={0} max={50}
                    className="w-20 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-lg px-3 py-2 text-sm text-center font-bold text-gray-800 dark:text-white outline-none focus:border-[#1CAB87] transition"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 text-sm">%</span>
                </div>
                <div className="flex-1">
                  <input type="range" min={0} max={50} value={item.rate}
                    onChange={e => updateCatRate(idx, Number(e.target.value))}
                    className="w-full accent-[#1CAB87]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave}
          className="bg-[#1CAB87] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#17976d] transition text-sm shadow-md shadow-[#1CAB87]/20">
          সংরক্ষণ করুন
        </button>
      </div>
    </SchoolAdminLayout>
  )
}
