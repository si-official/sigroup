/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCourseBySlug } from '@/lib/courses'
import { useStudent } from '@/context/StudentContext'
import { Lesson } from '@/lib/types'

export default function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const course = getCourseBySlug(slug)
  const { isEnrolled, completeLesson, getProgress } = useStudent()

  const allLessons = course?.sections.flatMap((s) => s.lessons) ?? []
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(allLessons[0] ?? null)

  if (!course) notFound()

  const enrolled = isEnrolled(course.id)
  const progress = getProgress(course.id)
  const completed = progress?.completedLessons ?? []

  const canAccess = (lesson: Lesson) => lesson.free || enrolled

  const handleComplete = () => {
    if (activeLesson && enrolled) {
      completeLesson(course.id, activeLesson.id)
    }
  }

  const completePct = allLessons.length > 0
    ? Math.round((completed.length / allLessons.length) * 100)
    : 0

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-gray-950 flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <Link href={`/courses/${slug}`} className="text-gray-400 hover:text-white text-sm">← Back</Link>
          <h2 className="text-white font-bold mt-2 text-sm line-clamp-2">{course.title}</h2>
          {enrolled && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span><span>{completePct}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full">
                <div className="h-1.5 bg-yellow-500 rounded-full transition-all" style={{ width: `${completePct}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-800/50">
          {course.sections.map((section) => (
            <div key={section.id}>
              <p className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-900/50">
                {section.title}
              </p>
              {section.lessons.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id
                const isDone = completed.includes(lesson.id)
                const accessible = canAccess(lesson)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => accessible && setActiveLesson(lesson)}
                    disabled={!accessible}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition ${
                      isActive ? 'bg-yellow-600/20 border-l-2 border-yellow-500' :
                      accessible ? 'hover:bg-gray-800/50' : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="mt-0.5 text-sm flex-shrink-0">
                      {isDone ? '✅' : lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '📝' : '📖'}
                    </span>
                    <div>
                      <p className={`text-sm ${isActive ? 'text-yellow-300 font-semibold' : 'text-gray-300'}`}>{lesson.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{lesson.duration} {!accessible && '🔒'}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {enrolled && completePct === 100 && (
          <div className="p-4">
            <Link href={`/courses/${slug}/learn/quiz`}
              className="block text-center bg-yellow-600 text-white py-3 rounded-xl font-bold hover:bg-yellow-500 transition text-sm">
              📝 Take Final Quiz
            </Link>
            {progress?.certificateIssued && (
              <Link href={`/certificate/${course.id}`}
                className="block text-center mt-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition text-sm">
                🏆 Get Certificate
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Video Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeLesson ? (
          <>
            <div className="flex-1 bg-black flex items-center justify-center">
              {activeLesson.type === 'video' && activeLesson.videoUrl ? (
                <iframe
                  src={activeLesson.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={activeLesson.title}
                />
              ) : activeLesson.type === 'quiz' ? (
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl font-bold mb-4">{activeLesson.title}</p>
                  <Link href={`/courses/${slug}/learn/quiz`}
                    className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition">
                    Start Quiz →
                  </Link>
                </div>
              ) : (
                <div className="text-gray-400 text-center"><div className="text-6xl mb-4">📖</div><p>Reading content</p></div>
              )}
            </div>
            <div className="bg-gray-900 border-t border-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{activeLesson.title}</h3>
                <p className="text-gray-400 text-sm">{activeLesson.duration}</p>
              </div>
              {enrolled && !completed.includes(activeLesson.id) && (
                <button onClick={handleComplete}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-500 transition text-sm">
                  ✓ Mark Complete
                </button>
              )}
              {completed.includes(activeLesson.id) && (
                <span className="text-green-400 font-semibold text-sm">✅ Completed</span>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a lesson</div>
        )}
      </div>
    </div>
  )
}
