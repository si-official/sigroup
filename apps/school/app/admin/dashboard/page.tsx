'use client'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { courses, instructors, coachingCenters } from '@/lib/data'

const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন']
const revenueData = [85000, 102000, 95000, 145000, 138000, 125000]
const maxRev = Math.max(...revenueData)

const recentEnrollments = [
  { name: 'আরিফ হোসেন', course: 'Python বাংলায়', amount: '৳৮০০', date: '০৩ জুলাই', avatar: 'আ' },
  { name: 'সুমাইয়া বেগম', course: 'SSC গণিত', amount: '৳১২০০', date: '০২ জুলাই', avatar: 'সু' },
  { name: 'তানভীর আহমেদ', course: 'IELTS Foundation', amount: '৳২৫০০', date: '০১ জুলাই', avatar: 'তা' },
  { name: 'রহিম উদ্দিন', course: 'Web Development', amount: '৳১৫০০', date: '৩০ জুন', avatar: 'র' },
  { name: 'নাফিসা আক্তার', course: 'Digital Marketing', amount: '৳৯০০', date: '২৯ জুন', avatar: 'না' },
]

const quickActions = [
  { label: 'কোর্স অনুমোদন', href: '/admin/approval', color: 'bg-[#1CAB87]', icon: '✦' },
  { label: 'উত্তোলন পর্যালোচনা', href: '/admin/withdrawals', color: 'bg-[#FF6B35]', icon: '◈' },
  { label: 'শিক্ষক যোগ', href: '/admin/instructors', color: 'bg-blue-500', icon: '◑' },
  { label: 'বিশ্লেষণ', href: '/admin/analytics', color: 'bg-purple-500', icon: '◉' },
]

export default function DashboardPage() {
  const pendingCount = courses.filter(c => c.status === 'pending').length

  return (
    <SchoolAdminLayout breadcrumb="ড্যাশবোর্ড">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">ড্যাশবোর্ড</h1>
          <span className="text-xs text-gray-400 dark:text-white/40">জুলাই ২০২৬</span>
        </div>

        {/* Alert */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-amber-500 text-lg shrink-0">⚠</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold text-sm flex-1">{pendingCount}টি কোর্স অনুমোদনের অপেক্ষায়</span>
            <a href="/admin/approval" className="text-xs bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition shrink-0">দেখুন →</a>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'মোট রাজস্ব', value: '৳১২,৫০,০০০', icon: '💰', color: 'text-[#1CAB87]' },
            { label: 'শিক্ষার্থী', value: '৫০,০০০', icon: '◯', color: 'text-blue-500' },
            { label: 'কোর্স', value: String(courses.length), icon: '▤', color: 'text-purple-500' },
            { label: 'শিক্ষক', value: String(instructors.length), icon: '◑', color: 'text-orange-500' },
            { label: 'কোচিং সেন্টার', value: String(coachingCenters.length), icon: '⬡', color: 'text-red-500' },
            { label: 'পেন্ডিং অনুমোদন', value: String(pendingCount), icon: '✦', color: 'text-amber-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-[#161b22] rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-sm">
              <div className={`text-xl mb-1 ${stat.color}`}>{stat.icon}</div>
              <div className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">মাসিক রাজস্ব (৳)</h3>
            <div className="flex items-end gap-3 h-36">
              {revenueData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400 dark:text-white/40">{(val/1000).toFixed(0)}k</span>
                  <div className="w-full bg-[#1CAB87] rounded-t-md transition-all hover:bg-[#17976d]"
                    style={{ height: `${(val/maxRev)*100}%` }} />
                  <span className="text-xs text-gray-400 dark:text-white/40">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">দ্রুত অ্যাকশন</h3>
            <div className="space-y-2.5">
              {quickActions.map(a => (
                <a key={a.label} href={a.href}
                  className={`${a.color} text-white flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition`}
                >
                  <span>{a.icon}</span> {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white">সাম্প্রতিক ভর্তি</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {recentEnrollments.map((row, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/3 transition">
                <div className="w-8 h-8 rounded-full bg-[#1CAB87]/20 flex items-center justify-center font-bold text-[#1CAB87] text-xs shrink-0">{row.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{row.name}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40 truncate">{row.course}</p>
                </div>
                <span className="text-gray-400 dark:text-white/30 text-xs shrink-0">{row.date}</span>
                <span className="font-bold text-[#1CAB87] text-sm shrink-0">{row.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
