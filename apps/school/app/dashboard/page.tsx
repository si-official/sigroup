/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useStudent } from '@/context/StudentContext'
import { courses } from '@/lib/courses'

export default function DashboardPage() {
  const { student, login } = useStudent()
  const [form, setForm] = useState({ name: '', email: '' })

  if (!student) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">Student Login</h1>
            <p className="text-gray-500 text-sm mb-6">Your account এ login করুন</p>
            <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <button onClick={() => form.name && form.email && login(form.name, form.email)}
              className="w-full bg-yellow-600 text-white py-3 rounded-xl font-bold hover:bg-yellow-500 transition">
              Login / Register
            </button>
          </div>
        </div>
      </>
    )
  }

  const enrolledCourseDetails = student.enrolledCourses.map((e) => ({
    ...e,
    course: courses.find((c) => c.id === e.courseId),
  })).filter((e) => e.course)

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-black mb-1">Welcome back, {student.name}! 👋</h1>
          <p className="text-yellow-100">{student.email}</p>
          <div className="flex gap-6 mt-6">
            {[
              { v: enrolledCourseDetails.length, l: 'Enrolled Courses' },
              { v: enrolledCourseDetails.filter((e) => e.quizScore && e.quizScore >= 70).length, l: 'Completed' },
              { v: enrolledCourseDetails.filter((e) => e.certificateIssued).length, l: 'Certificates' },
            ].map((s) => (
              <div key={s.l} className="bg-white/20 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-black">{s.v}</p>
                <p className="text-yellow-100 text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled courses */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>
        {enrolledCourseDetails.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 mb-4">এখনও কোনো course এ enroll করেননি</p>
            <Link href="/" className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {enrolledCourseDetails.map(({ course, completedLessons, quizScore, certificateIssued }) => {
              const totalLessons = course!.sections.reduce((s, sec) => s + sec.lessons.length, 0)
              const pct = Math.round((completedLessons.length / totalLessons) * 100)
              return (
                <div key={course!.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🎓</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{course!.title}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{course!.instructor}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span><span>{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className="h-2 bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {quizScore !== undefined && (
                        <p className="text-xs mt-2 text-green-600 font-semibold">Quiz: {quizScore}%</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/courses/view?slug=${course!.slug}`}
                      className="flex-1 text-center bg-yellow-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500 transition">
                      Continue
                    </Link>
                    {certificateIssued && (
                      <Link href={`/certificate/view?id=${course!.id}`}
                        className="flex-1 text-center bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-500 transition">
                        🏆 Certificate
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
