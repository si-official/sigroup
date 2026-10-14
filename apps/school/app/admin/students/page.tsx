'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'

interface Student {
  id: string; name: string; email: string; courses: number; paid: string; joined: string; status: 'active' | 'suspended'
}

const mockStudents: Student[] = [
  { id: '1', name: 'আরিফ হোসেন', email: 'arif@demo.com', courses: 3, paid: '৳৪৫০০', joined: '০১ জানু ২০২৪', status: 'active' },
  { id: '2', name: 'সুমাইয়া বেগম', email: 'sumaiya@demo.com', courses: 1, paid: '৳২৫০০', joined: '১৫ ফেব্রু ২০২৪', status: 'active' },
  { id: '3', name: 'তানভীর আহমেদ', email: 'tanvir@demo.com', courses: 2, paid: '৳৩৫০০', joined: '০১ মার্চ ২০২৪', status: 'active' },
  { id: '4', name: 'Demo Student', email: 'student@demo.com', courses: 3, paid: '৳৫০০০', joined: '০১ জানু ২০২৩', status: 'active' },
  { id: '5', name: 'রহিম উদ্দিন', email: 'rahim@demo.com', courses: 1, paid: '৳৮০০', joined: '১০ এপ্রিল ২০২৪', status: 'active' },
  { id: '6', name: 'নাফিসা আক্তার', email: 'nafisa@demo.com', courses: 2, paid: '৳১৮০০', joined: '২০ মে ২০২৪', status: 'suspended' },
]

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' } : s))
  }

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  return (
    <SchoolAdminLayout breadcrumb="শিক্ষার্থী">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">শিক্ষার্থী</h1>
          <span className="text-xs text-gray-400 dark:text-white/40">{filtered.length}জন শিক্ষার্থী</span>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
          className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 w-full max-w-sm" />

        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">নাম</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">ইমেইল</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">কোর্স</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">মোট পেমেন্ট</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">যোগ দিয়েছে</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">স্ট্যাটাস</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1CAB87]/20 flex items-center justify-center font-bold text-[#1CAB87] text-sm shrink-0">{student.name[0]}</div>
                      <span className="font-semibold text-gray-800 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-white/50 text-xs">{student.email}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-white/50">{student.courses}টি</td>
                  <td className="px-5 py-3 font-bold text-gray-800 dark:text-white">{student.paid}</td>
                  <td className="px-5 py-3 text-gray-400 dark:text-white/40 text-xs">{student.joined}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${student.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                      {student.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setSelectedStudent(student)} className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition">বিস্তারিত</button>
                      <button onClick={() => toggleStatus(student.id)} className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition">
                        {student.status === 'active' ? 'স্থগিত' : 'সক্রিয়'}
                      </button>
                      <button onClick={() => deleteStudent(student.id)} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition">মুছুন</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 dark:text-white/30">কোনো শিক্ষার্থী পাওয়া যায়নি</div>}
        </div>
      </div>

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#1CAB87]/20 flex items-center justify-center font-bold text-[#1CAB87] text-xl">{selectedStudent.name[0]}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-xs">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/10">
                <span className="text-gray-500 dark:text-white/50">ভর্তিকৃত কোর্স</span>
                <span className="font-bold text-gray-800 dark:text-white">{selectedStudent.courses}টি</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/10">
                <span className="text-gray-500 dark:text-white/50">মোট পেমেন্ট</span>
                <span className="font-bold text-[#1CAB87]">{selectedStudent.paid}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/10">
                <span className="text-gray-500 dark:text-white/50">যোগদান</span>
                <span className="font-bold text-gray-800 dark:text-white">{selectedStudent.joined}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-white/50">স্ট্যাটাস</span>
                <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedStudent.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedStudent(null)} className="mt-4 w-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 font-semibold py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition text-sm">বন্ধ করুন</button>
          </div>
        </div>
      )}
    </SchoolAdminLayout>
  )
}
