'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { courses, getInstructor, getCoachingCenter } from '@/lib/data'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-4 h-4 ${s <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function CountdownTimer({ hours = 47 }: { hours?: number }) {
  const [timeLeft, setTimeLeft] = useState(hours * 3600 + 32 * 60)
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(interval)
  }, [])
  const d = Math.floor(timeLeft / 86400)
  const h = Math.floor((timeLeft % 86400) / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60
  return (
    <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
      <span>⏰ অফার শেষ হচ্ছে:</span>
      <span className="bg-orange-100 px-1.5 py-0.5 rounded">{d}d</span>
      <span className="bg-orange-100 px-1.5 py-0.5 rounded">{String(h).padStart(2,'0')}h</span>
      <span className="bg-orange-100 px-1.5 py-0.5 rounded">{String(m).padStart(2,'0')}m</span>
      <span className="bg-orange-100 px-1.5 py-0.5 rounded">{String(s).padStart(2,'0')}s</span>
    </div>
  )
}

export default function CourseDetailClient() {
  const params = useParams()
  const slug = params?.slug as string
  const course = courses.find(c => c.slug === slug)
  const [activeTab, setActiveTab] = useState<'learn' | 'curriculum' | 'instructor' | 'review'>('learn')
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['ch1']))

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">কোর্সটি পাওয়া যায়নি</h1>
            <Link href="/courses" className="text-[#1CAB87] hover:underline">সব কোর্স দেখুন</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const instructor = getInstructor(course.instructorId)
  const coaching = course.coachingCenterId ? getCoachingCenter(course.coachingCenterId) : null
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0
  const hasFreeLessons = course.chapters.some(ch => ch.lessons.some(l => l.isFree))
  const totalLessonCount = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const lessonTypeIcon = (type: string) => {
    if (type === 'video') return '📹'
    if (type === 'pdf') return '📄'
    if (type === 'quiz') return '❓'
    if (type === 'live') return '🔴'
    return '📹'
  }

  const tabs = [
    { key: 'learn' as const, label: 'কী শিখবেন' },
    { key: 'curriculum' as const, label: 'পাঠ্যক্রম' },
    { key: 'instructor' as const, label: 'শিক্ষক' },
    { key: 'review' as const, label: 'রিভিউ' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
                <Link href="/" className="hover:text-[#1CAB87]">Home</Link>
                <span>›</span>
                <Link href="/courses" className="hover:text-[#1CAB87]">কোর্স</Link>
                <span>›</span>
                <span className="text-gray-400">{course.category}</span>
                <span>›</span>
                <span className="text-[#1a1a2e] font-semibold line-clamp-1">{course.title}</span>
              </nav>

              <h1 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3 leading-tight">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.subtitle}</p>

              {/* Meta */}
              <div className="flex items-center gap-3 flex-wrap mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-yellow-500">{course.rating}</span>
                  <StarRating rating={course.rating} />
                </div>
                <span className="text-gray-500">({course.reviews.toLocaleString()} রিভিউ)</span>
                <span className="text-gray-500">👥 {course.enrollments.toLocaleString()} শিক্ষার্থী</span>
                {course.updatedAt && <span className="text-gray-400">🔄 {course.updatedAt}</span>}
              </div>

              <div className="flex items-center gap-2 mb-5 text-sm">
                <span className="text-gray-600">শিক্ষক:</span>
                <span className="font-semibold text-[#1CAB87]">{instructor?.name || 'SI School'}</span>
                {coaching && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{coaching.brandName}</span>
                  </>
                )}
              </div>

              {/* Preview Video */}
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg bg-black">
                {course.previewVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${course.previewVideoId}`}
                    className="w-full aspect-video"
                    allowFullScreen
                  />
                ) : course.previewVideo ? (
                  <iframe
                    src={course.previewVideo}
                    className="w-full aspect-video"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative aspect-video">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-[#1CAB87] ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-gray-200 mb-6">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                      activeTab === tab.key
                        ? 'border-[#1CAB87] text-[#1CAB87]'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'learn' && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">এই কোর্সে আপনি যা শিখবেন</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.whatYouLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#1CAB87] font-bold mt-0.5 shrink-0">✓</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#1a1a2e]">কোর্সের পাঠ্যক্রম</h2>
                    <span className="text-sm text-gray-500">{course.chapters.length}টি অধ্যায় · {totalLessonCount}টি পাঠ · {course.totalDuration}</span>
                  </div>
                  {course.chapters.map((chapter, ci) => {
                    const isExpanded = expandedChapters.has(chapter.id)
                    const chDuration = chapter.lessons.map(l => l.duration).join(', ')
                    return (
                      <div key={chapter.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-[#1CAB87]/10 text-[#1CAB87] text-sm font-bold flex items-center justify-center">{ci + 1}</span>
                            <span className="font-semibold text-[#1a1a2e]">{chapter.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{chapter.lessons.length} পাঠ</span>
                            <span>{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-gray-100 divide-y divide-gray-50">
                            {chapter.lessons.map(lesson => (
                              <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                                <span className="text-base">{lessonTypeIcon(lesson.type)}</span>
                                <div className="flex-1 text-sm">
                                  <span className={lesson.isFree ? 'text-[#1a1a2e]' : 'text-gray-500'}>
                                    {!lesson.isFree && <span className="mr-1">🔒</span>}
                                    {lesson.title}
                                  </span>
                                </div>
                                {lesson.isFree && (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">ফ্রি প্রিভিউ</span>
                                )}
                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'instructor' && instructor && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-20 h-20 rounded-full bg-[#1CAB87]/20 flex items-center justify-center shrink-0">
                      <span className="text-3xl font-black text-[#1CAB87]">{instructor.name[0]}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#1a1a2e]">{instructor.name}</h2>
                      {instructor.verified && (
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mb-2">✓ যাচাইকৃত শিক্ষক</span>
                      )}
                      <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                        <span>👥 {instructor.totalStudents?.toLocaleString()} শিক্ষার্থী</span>
                        <span>📚 {instructor.totalCourses} কোর্স</span>
                        <span>⭐ {instructor.rating} রেটিং</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{instructor.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {instructor.expertise.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="space-y-4">
                  {/* Rating breakdown */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 mb-4">
                    <div className="flex items-center gap-6 mb-5">
                      <div className="text-center">
                        <div className="text-5xl font-black text-[#1a1a2e]">{course.rating}</div>
                        <StarRating rating={course.rating} />
                        <div className="text-xs text-gray-400 mt-1">কোর্স রেটিং</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5,4,3,2,1].map(star => {
                          const pct = star === 5 ? 80 : star === 4 ? 15 : star === 3 ? 4 : star === 2 ? 1 : 0
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{star}★</span>
                              <span className="text-xs text-gray-400 w-8">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  {/* Mock reviews */}
                  {[
                    { name: 'আরিফ হোসেন', rating: 5, date: '২০২৪-০১-১৫', comment: 'অসাধারণ কোর্স! এত সুন্দর করে বুঝিয়েছেন যে কঠিন বিষয়গুলোও সহজ মনে হয়।' },
                    { name: 'সুমাইয়া বেগম', rating: 5, date: '২০২৪-০২-১০', comment: 'এই কোর্সটি আমার ক্যারিয়ার পরিবর্তন করে দিয়েছে। সবাইকে রেকমেন্ড করব।' },
                    { name: 'তানভীর আহমেদ', rating: 4, date: '২০২৪-০৩-০৫', comment: 'কনটেন্ট অনেক ভালো। আরও প্র্যাকটিস প্রজেক্ট থাকলে আরও ভালো হতো।' },
                  ].map((review, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#1CAB87]/20 flex items-center justify-center">
                          <span className="font-bold text-[#1CAB87]">{review.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#1a1a2e]">{review.name}</p>
                          <div className="flex items-center gap-1">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="sticky top-20 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>

                <div className="p-5">
                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-2">
                    {course.price === 0 ? (
                      <span className="text-2xl font-black text-[#1CAB87]">বিনামূল্যে</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-[#1a1a2e]">৳{course.price.toLocaleString()}</span>
                        {course.originalPrice && (
                          <span className="text-base text-gray-400 line-through">৳{course.originalPrice.toLocaleString()}</span>
                        )}
                        {discount > 0 && (
                          <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">{discount}% ছাড়</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Countdown */}
                  {course.originalPrice && course.price > 0 && (
                    <div className="mb-4">
                      <CountdownTimer hours={47} />
                    </div>
                  )}

                  {/* CTA */}
                  {course.price === 0 ? (
                    <Link
                      href={`/courses/${course.slug}/learn`}
                      className="block w-full bg-[#1CAB87] text-white text-center font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition mb-3 text-lg"
                    >
                      বিনামূল্যে শুরু করুন
                    </Link>
                  ) : (
                    <Link
                      href={`/checkout?course=${course.slug}`}
                      className="block w-full bg-[#1CAB87] text-white text-center font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition mb-3 text-lg"
                    >
                      এখনই ভর্তি হন ৳{course.price.toLocaleString()}
                    </Link>
                  )}

                  {hasFreeLessons && (
                    <button
                      onClick={() => setActiveTab('curriculum')}
                      className="w-full border-2 border-[#1CAB87] text-[#1CAB87] font-bold py-3 rounded-xl hover:bg-[#1CAB87]/5 transition mb-4"
                    >
                      ফ্রি প্রিভিউ দেখুন
                    </button>
                  )}

                  <hr className="border-gray-100 mb-4" />

                  {/* Course includes */}
                  <h3 className="font-bold text-[#1a1a2e] mb-3">এই কোর্সে আছে:</h3>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">📹 <span>{course.totalLessons}টি ভিডিও লেসন</span></li>
                    <li className="flex items-center gap-2">⏱ <span>{course.totalDuration} কনটেন্ট</span></li>
                    <li className="flex items-center gap-2">📱 <span>মোবাইলে দেখুন</span></li>
                    {course.certificate && <li className="flex items-center gap-2">🏆 <span>সার্টিফিকেট</span></li>}
                    {course.liveClasses && <li className="flex items-center gap-2">🔴 <span>লাইভ ক্লাস</span></li>}
                    <li className="flex items-center gap-2">♾️ <span>আজীবন অ্যাক্সেস</span></li>
                  </ul>

                  <hr className="border-gray-100 mb-4" />

                  {/* Share */}
                  <div className="flex gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://school.sigroup.com.bd/courses/${course.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Facebook শেয়ার
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(`https://school.sigroup.com.bd/courses/${course.slug}`)}
                      className="flex-1 bg-gray-100 text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      লিংক কপি
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
