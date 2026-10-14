'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { courses } from '@/lib/data'
import { Course } from '@/lib/types'

export default function ApprovalPage() {
  const [coursesList, setCoursesList] = useState<Course[]>(courses)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const pending = coursesList.filter(c => c.status === 'pending')

  const approveCourse = (id: string) => {
    setCoursesList(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c))
  }
  const rejectCourse = (id: string) => {
    setCoursesList(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c))
    setRejectingId(null)
    setRejectReason('')
  }

  return (
    <SchoolAdminLayout breadcrumb="কোর্স অনুমোদন">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">কোর্স অনুমোদন</h1>
          <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">{pending.length}টি পেন্ডিং</span>
        </div>

        {pending.length === 0 ? (
          <div className="bg-[#1CAB87]/10 rounded-xl p-12 text-center border border-[#1CAB87]/20">
            <div className="text-4xl mb-3">✦</div>
            <p className="font-semibold text-[#1CAB87]">সব কোর্স অনুমোদন করা হয়েছে!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">কোর্স</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">বিভাগ</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">মূল্য</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">জমা দেওয়া হয়েছে</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {pending.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={course.thumbnail} alt="" className="w-12 h-8 object-cover rounded-lg shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white line-clamp-1 max-w-[200px]">{course.title}</p>
                          <p className="text-xs text-gray-400 dark:text-white/40">{course.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-white/50">{course.category}</td>
                    <td className="px-5 py-3 font-bold text-gray-800 dark:text-white">
                      {course.price === 0 ? <span className="text-[#1CAB87]">বিনামূল্যে</span> : `৳${course.price.toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3 text-gray-400 dark:text-white/40 text-xs">{course.createdAt}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => approveCourse(course.id)}
                          className="text-xs bg-[#1CAB87]/10 text-[#1CAB87] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1CAB87]/20 transition">
                          ✓ অনুমোদন
                        </button>
                        <button onClick={() => setRejectingId(course.id)}
                          className="text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition">
                          ✗ প্রত্যাখ্যান
                        </button>
                      </div>
                      {rejectingId === course.id && (
                        <div className="mt-2 space-y-1">
                          <input
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="প্রত্যাখ্যানের কারণ লিখুন..."
                            className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-400 text-gray-800 dark:text-white"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => rejectCourse(course.id)}
                              className="text-xs bg-red-500 text-white font-bold px-3 py-1 rounded-lg hover:bg-red-600 transition">
                              নিশ্চিত করুন
                            </button>
                            <button onClick={() => setRejectingId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition">
                              বাতিল
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SchoolAdminLayout>
  )
}
