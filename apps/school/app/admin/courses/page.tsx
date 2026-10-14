'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { courses } from '@/lib/data'
import { Course } from '@/lib/types'

export default function CoursesPage() {
  const [coursesList, setCoursesList] = useState<Course[]>(courses)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = Array.from(new Set(courses.map(c => c.category)))

  const filtered = coursesList.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    const matchCat = filterCategory === 'all' || c.category === filterCategory
    return matchSearch && matchStatus && matchCat
  })

  const toggleFeatured = (id: string) => {
    setCoursesList(prev => prev.map(c =>
      c.id === id ? { ...c, badge: c.badge === 'Featured' ? undefined : 'Featured' } : c
    ))
  }

  const deleteCourse = (id: string) => {
    setCoursesList(prev => prev.filter(c => c.id !== id))
  }

  const statusLabel = (s: string) => {
    if (s === 'approved') return { label: 'অনুমোদিত', cls: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' }
    if (s === 'pending') return { label: 'পর্যালোচনাধীন', cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' }
    if (s === 'rejected') return { label: 'প্রত্যাখ্যাত', cls: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' }
    return { label: s, cls: 'bg-gray-100 text-gray-600' }
  }

  return (
    <SchoolAdminLayout breadcrumb="সকল কোর্স">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">সকল কোর্স</h1>
          <span className="text-xs text-gray-400 dark:text-white/40">{filtered.length}টি কোর্স</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="কোর্স খুঁজুন..."
            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 min-w-[220px]"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white">
            <option value="all">সব স্ট্যাটাস</option>
            <option value="approved">অনুমোদিত</option>
            <option value="pending">পর্যালোচনাধীন</option>
            <option value="rejected">প্রত্যাখ্যাত</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white">
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">কোর্স</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">বিভাগ</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">স্ট্যাটাস</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">শিক্ষার্থী</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">মূল্য</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map(course => {
                const s = statusLabel(course.status)
                return (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={course.thumbnail} alt="" className="w-12 h-8 object-cover rounded-lg shrink-0" />
                        <span className="font-semibold text-gray-800 dark:text-white line-clamp-1 max-w-[180px]">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-white/50">{course.category}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-white/50">{course.enrollments.toLocaleString()}</td>
                    <td className="px-5 py-3 font-bold text-gray-800 dark:text-white">
                      {course.price === 0 ? <span className="text-[#1CAB87]">ফ্রি</span> : `৳${course.price.toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition">সম্পাদনা</button>
                        <button onClick={() => deleteCourse(course.id)} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition">মুছুন</button>
                        <button
                          onClick={() => toggleFeatured(course.id)}
                          className={`text-xs px-2 py-1 rounded-lg transition ${course.badge === 'Featured' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                          {course.badge === 'Featured' ? '★ Featured' : 'Feature করুন'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 dark:text-white/30">কোনো কোর্স পাওয়া যায়নি</div>
          )}
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
