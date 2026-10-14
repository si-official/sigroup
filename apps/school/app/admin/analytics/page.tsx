'use client'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { instructors, courses } from '@/lib/data'

const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন']
const revenueData = [85000, 102000, 95000, 145000, 138000, 125000]
const enrollmentData = [320, 480, 390, 620, 580, 510]
const maxRev = Math.max(...revenueData)
const maxEnroll = Math.max(...enrollmentData)

const categoryData = [
  { cat: 'একাডেমিক', pct: 38, color: '#1CAB87' },
  { cat: 'প্রোগ্রামিং', pct: 28, color: '#FF6B35' },
  { cat: 'ডিজাইন', pct: 15, color: '#6366f1' },
  { cat: 'ভাষা', pct: 12, color: '#f59e0b' },
  { cat: 'অন্যান্য', pct: 7, color: '#94a3b8' },
]

export default function AnalyticsPage() {
  const topInstructors = [...instructors]
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5)

  const topCourses = [...courses]
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5)

  return (
    <SchoolAdminLayout breadcrumb="বিশ্লেষণ">
      <div className="space-y-6">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">বিশ্লেষণ</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'মোট রাজস্ব (এ মাস)', value: '৳১,২৫,০০০', change: '+12%', up: true },
            { label: 'নতুন ভর্তি', value: '৫১০', change: '+8%', up: true },
            { label: 'সক্রিয় কোর্স', value: String(courses.filter(c => c.status === 'approved').length), change: '+3', up: true },
            { label: 'গড় রেটিং', value: '৪.৬', change: '-0.1', up: false },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-4">
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">{stat.label}</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              <p className={`text-xs font-semibold mt-1 ${stat.up ? 'text-[#1CAB87]' : 'text-red-400'}`}>
                {stat.up ? '↑' : '↓'} {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">রাজস্ব প্রবণতা (৳)</h3>
            <div className="flex items-end gap-2 h-36">
              {revenueData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400 dark:text-white/40">{(val/1000).toFixed(0)}k</span>
                  <div className="w-full bg-[#1CAB87] rounded-t-md hover:bg-[#17976d] transition"
                    style={{ height: `${(val/maxRev)*100}%` }} />
                  <span className="text-xs text-gray-400 dark:text-white/40">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment Trend */}
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">মাসিক ভর্তি</h3>
            <div className="flex items-end gap-2 h-36">
              {enrollmentData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400 dark:text-white/40">{val}</span>
                  <div className="w-full bg-[#FF6B35] rounded-t-md hover:opacity-80 transition"
                    style={{ height: `${(val/maxEnroll)*100}%` }} />
                  <span className="text-xs text-gray-400 dark:text-white/40">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">ক্যাটাগরি বিভাজন</h3>
            <div className="space-y-3">
              {categoryData.map(item => (
                <div key={item.cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{item.cat}</span>
                    <span className="text-xs font-bold text-gray-500 dark:text-white/50">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Instructors */}
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">শীর্ষ শিক্ষক</h3>
            <div className="space-y-3">
              {topInstructors.map((inst, i) => (
                <div key={inst.id} className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-400 dark:text-white/30 w-4">{i+1}</span>
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs">{inst.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{inst.name}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">{inst.totalStudents.toLocaleString()} শিক্ষার্থী</p>
                  </div>
                  <span className="text-xs font-bold text-[#1CAB87] shrink-0">৳{(inst.totalEarnings/1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">শীর্ষ কোর্স</h3>
            <div className="space-y-3">
              {topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-400 dark:text-white/30 w-4">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-1">{course.title}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">{course.category}</p>
                  </div>
                  <span className="text-xs font-bold text-[#FF6B35] shrink-0">{course.enrollments.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
