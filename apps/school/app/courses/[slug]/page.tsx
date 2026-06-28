/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getCourseBySlug } from '@/lib/courses'
import { useStudent } from '@/context/StudentContext'

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const course = getCourseBySlug(slug)
  const { isEnrolled } = useStudent()
  const [openSection, setOpenSection] = useState<string | null>('s1')

  if (!course) notFound()
  const enrolled = isEnrolled(course.id)

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0)

  return (
    <>
      <Navbar />
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-4">
              <span className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full font-semibold">{course.category}</span>
              <span className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">{course.level}</span>
              <span className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">{course.language}</span>
            </div>
            <h1 className="text-3xl font-black mb-2">{course.title}</h1>
            <p className="text-gray-300 text-lg mb-4">{course.subtitle}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
              <span className="text-yellow-400">{'★'.repeat(5)}</span>
              <span>{course.rating} ({course.students.toLocaleString()} students)</span>
              <span>·</span>
              <span>{course.totalHours} · {totalLessons} lessons</span>
            </div>
            <p className="text-gray-400 text-sm mt-3">Instructor: <span className="text-white font-semibold">{course.instructor}</span> — {course.instructorTitle}</p>
          </div>

          {/* Sticky buy card */}
          <div className="bg-white text-gray-900 rounded-2xl p-6 h-fit shadow-2xl">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl h-40 flex items-center justify-center mb-4">
              <span className="text-6xl">🎓</span>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-black">৳{course.price.toLocaleString()}</span>
              {course.originalPrice && <span className="text-gray-400 line-through">৳{course.originalPrice.toLocaleString()}</span>}
            </div>
            {enrolled ? (
              <Link href={`/courses/${course.slug}/learn`}
                className="block text-center w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-500 transition">
                Continue Learning →
              </Link>
            ) : (
              <>
                <Link href={`/checkout?course=${course.id}`}
                  className="block text-center w-full bg-yellow-600 text-white py-3.5 rounded-xl font-bold hover:bg-yellow-500 transition mb-3">
                  Enroll Now
                </Link>
                <Link href={`/courses/${course.slug}/learn`}
                  className="block text-center w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                  Preview Free Lessons
                </Link>
              </>
            )}
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✅ {course.totalHours} on-demand video</li>
              <li>✅ {totalLessons}টি lesson</li>
              <li>✅ Quiz ও Certificate</li>
              <li>✅ Lifetime access</li>
            </ul>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">কী শিখবেন</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.objectives.map((o) => (
                <div key={o} className="flex gap-3 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>{o}
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Curriculum</h2>
            <div className="space-y-3">
              {course.sections.map((section) => (
                <div key={section.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
                  >
                    <span className="font-semibold text-gray-800">{section.title}</span>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{section.lessons.length} lessons</span>
                      <span>{openSection === section.id ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  {openSection === section.id && (
                    <div className="divide-y divide-gray-50">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-4 px-4 py-3">
                          <span className="text-lg">{lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '📝' : '📖'}</span>
                          <span className="flex-1 text-sm text-gray-700">{lesson.title}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {lesson.free && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Free</span>}
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Requirements</h3>
            <ul className="space-y-2">
              {course.requirements.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-gray-600"><span>•</span>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
