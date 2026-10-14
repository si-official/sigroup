'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { courses } from '@/lib/data'

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('SI School')
  const [tagline, setTagline] = useState('বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম')
  const [supportEmail, setSupportEmail] = useState('support@sigroup.com.bd')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [defaultCommission, setDefaultCommission] = useState(20)
  const [language, setLanguage] = useState<'bangla' | 'english'>('bangla')
  const [saved, setSaved] = useState(false)

  const featuredCourses = courses.filter(c => c.badge === 'Featured' || c.badge === 'Bestseller')
  const [featuredOrder, setFeaturedOrder] = useState(featuredCourses.map(c => c.id))

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...featuredOrder]
    ;[next[i-1], next[i]] = [next[i], next[i-1]]
    setFeaturedOrder(next)
  }

  const moveDown = (i: number) => {
    if (i === featuredOrder.length - 1) return
    const next = [...featuredOrder]
    ;[next[i], next[i+1]] = [next[i+1], next[i]]
    setFeaturedOrder(next)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <SchoolAdminLayout breadcrumb="সিস্টেম সেটিং">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">সিস্টেম সেটিং</h1>

        {saved && (
          <div className="bg-[#1CAB87]/10 border border-[#1CAB87]/30 text-[#1CAB87] text-sm px-4 py-3 rounded-xl font-semibold">
            ✓ সফলভাবে সংরক্ষণ করা হয়েছে!
          </div>
        )}

        {/* General */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3">সাধারণ তথ্য</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">সাইটের নাম</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">ট্যাগলাইন</label>
            <input value={tagline} onChange={e => setTagline(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">যোগাযোগ ইমেইল</label>
            <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white transition" />
          </div>
        </div>

        {/* System */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3">সিস্টেম কনফিগারেশন</h2>

          {/* Maintenance */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">Maintenance Mode</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">সাইট সাময়িকভাবে বন্ধ রাখুন</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-white/20'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${maintenanceMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Commission */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">ডিফল্ট কমিশন রেট (%)</label>
            <div className="flex items-center gap-3">
              <input type="number" value={defaultCommission} onChange={e => setDefaultCommission(Number(e.target.value))} min={0} max={50}
                className="w-24 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-4 py-2.5 text-center text-sm font-bold outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white transition" />
              <span className="text-gray-500 dark:text-white/50 text-sm">%</span>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-2">ভাষা</label>
            <div className="flex gap-2">
              {[['bangla', 'বাংলা'], ['english', 'English']].map(([val, label]) => (
                <button key={val} onClick={() => setLanguage(val as 'bangla' | 'english')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${language === val ? 'bg-[#1CAB87] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Order */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3 mb-4">Featured কোর্সের ক্রম</h2>
          <div className="space-y-2">
            {featuredOrder.map((id, i) => {
              const course = courses.find(c => c.id === id)
              if (!course) return null
              return (
                <div key={id} className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-2.5">
                  <span className="w-6 text-center font-bold text-gray-400 dark:text-white/30 text-sm">{i+1}</span>
                  <span className="flex-1 text-sm font-semibold text-gray-700 dark:text-white/80 line-clamp-1">{course.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveUp(i)} disabled={i === 0}
                      className="text-xs bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition disabled:opacity-30 text-gray-600 dark:text-white/60">↑</button>
                    <button onClick={() => moveDown(i)} disabled={i === featuredOrder.length - 1}
                      className="text-xs bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition disabled:opacity-30 text-gray-600 dark:text-white/60">↓</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={handleSave}
          className="bg-[#1CAB87] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#17976d] transition text-sm shadow-md shadow-[#1CAB87]/20">
          সব সংরক্ষণ করুন
        </button>
      </div>
    </SchoolAdminLayout>
  )
}
