'use client'
import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

const initCourses = [
  { id: 1, title: 'Full-Stack Web Development', instructor: 'Rahim Sir', price: 4999, enrolled: 3420, lessons: 180, duration: '6 months', status: 'active', icon: '🌐' },
  { id: 2, title: 'UI/UX Design Mastery', instructor: 'Sara Madam', price: 3499, enrolled: 1870, lessons: 95, duration: '3 months', status: 'active', icon: '🎨' },
  { id: 3, title: 'Digital Marketing Pro', instructor: 'Karim Sir', price: 2999, enrolled: 2140, lessons: 72, duration: '2 months', status: 'active', icon: '📣' },
  { id: 4, title: 'Mobile App Development', instructor: 'Nadia Madam', price: 5999, enrolled: 980, lessons: 150, duration: '5 months', status: 'draft', icon: '📱' },
]

export default function SchoolAdmin() {
  const [courses, setCourses] = useState(initCourses)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', instructor: '', price: '', lessons: '', duration: '', icon: '📚' })

  const add = () => {
    if (!form.title || !form.price) return
    setCourses([{ id: courses.length + 1, title: form.title, instructor: form.instructor, price: Number(form.price), enrolled: 0, lessons: Number(form.lessons), duration: form.duration, status: 'active', icon: form.icon }, ...courses])
    setForm({ title: '', instructor: '', price: '', lessons: '', duration: '', icon: '📚' })
    setShowAdd(false)
  }

  return (
    <AdminLayout title="SI School" breadcrumb={[{ label: 'SI School' }]}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">🎓 SI School Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage courses, students, lessons, certificates</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
            + Add Course
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: courses.length, icon: '📚' },
            { label: 'Total Students', value: courses.reduce((a, c) => a + c.enrolled, 0).toLocaleString(), icon: '👥' },
            { label: 'Total Lessons', value: courses.reduce((a, c) => a + c.lessons, 0), icon: '🎬' },
            { label: 'Revenue', value: '৳' + courses.reduce((a, c) => a + c.price * c.enrolled, 0).toLocaleString(), icon: '💰' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-black text-white mt-2">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-white font-black text-xl mb-6">Add Course</h2>
              <div className="space-y-4">
                {[
                  { label: 'Course Title *', key: 'title', placeholder: 'e.g. Python for Beginners' },
                  { label: 'Instructor', key: 'instructor', placeholder: 'e.g. Rahim Sir' },
                  { label: 'Price (৳)', key: 'price', placeholder: 'e.g. 3000' },
                  { label: 'No. of Lessons', key: 'lessons', placeholder: 'e.g. 80' },
                  { label: 'Duration', key: 'duration', placeholder: 'e.g. 3 months' },
                  { label: 'Icon (emoji)', key: 'icon', placeholder: '📚' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-gray-400 text-xs mb-1.5 block">{f.label}</label>
                    <input
                      value={(form as Record<string, string>)[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={add} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition">Add Course</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl font-bold transition">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800 bg-gray-950/50">
                <th className="px-6 py-4 text-left">Course</th>
                <th className="px-6 py-4 text-left">Instructor</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Enrolled</th>
                <th className="px-6 py-4 text-left">Lessons</th>
                <th className="px-6 py-4 text-left">Duration</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-white font-semibold text-sm">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{c.instructor}</td>
                  <td className="px-6 py-4 text-white font-bold">৳{c.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-indigo-400 font-bold">{c.enrolled.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400">{c.lessons}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{c.duration}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${c.status === 'active' ? 'bg-emerald-900/60 text-emerald-400 border-emerald-800' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-400 text-xs font-bold" onClick={() => setCourses(courses.filter(x => x.id !== c.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </AdminLayout>
  )
}
