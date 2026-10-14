'use client'
import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CourseCard from '@/components/CourseCard'
import { courses, coachingCenters, reviews } from '@/lib/data'

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const featured = courses.filter(c => c.badge === 'Bestseller' || c.badge === 'Featured')
  const free = courses.filter(c => c.price === 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/courses?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block bg-[#1CAB87]/20 text-[#1CAB87] text-sm font-semibold px-4 py-1 rounded-full mb-5">
              🇧🇩 বাংলাদেশের সেরা প্ল্যাটফর্ম
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              বাংলাদেশের সেরা<br />
              <span className="text-[#1CAB87]">অনলাইন শিক্ষা</span> প্ল্যাটফর্ম
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              SSC থেকে University, Coding থেকে IELTS — সব কিছু এক জায়গায়
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto flex bg-white rounded-full overflow-hidden shadow-lg mb-10">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="আপনি কী শিখতে চান? (যেমন: Python, SSC গণিত...)"
                className="flex-1 px-6 py-4 text-gray-700 outline-none text-sm"
              />
              <button type="submit" className="bg-[#1CAB87] text-white px-8 py-4 font-bold text-sm hover:bg-[#17976d] transition">
                খুঁজুন
              </button>
            </form>

            {/* Stats */}
            <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
              {[
                { value: '৫০,০০০+', label: 'শিক্ষার্থী' },
                { value: '২০০+', label: 'কোর্স' },
                { value: '৫০+', label: 'শিক্ষক' },
                { value: '৯৮%', label: 'সন্তুষ্টি' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category Grid ── */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">বিষয় অনুযায়ী কোর্স</h2>
            <p className="text-gray-500 mb-8">আপনার পছন্দের বিষয় বেছে নিন</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { id: 'academic', icon: '📚', label: 'একাডেমিক', count: 45, color: 'bg-blue-50 hover:bg-blue-500' },
                { id: 'skills', icon: '💡', label: 'দক্ষতা', count: 38, color: 'bg-green-50 hover:bg-green-500' },
                { id: 'professional', icon: '💼', label: 'প্রফেশনাল', count: 29, color: 'bg-purple-50 hover:bg-purple-500' },
                { id: 'creative', icon: '🎨', label: 'ক্রিয়েটিভ', count: 22, color: 'bg-orange-50 hover:bg-orange-500' },
                { id: 'language', icon: '🌐', label: 'ভাষা', count: 18, color: 'bg-teal-50 hover:bg-teal-500' },
                { id: 'technology', icon: '💻', label: 'প্রযুক্তি', count: 52, color: 'bg-red-50 hover:bg-red-500' },
              ].map(cat => (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.id}`}
                  className={`group ${cat.color} rounded-2xl p-5 text-center transition-all duration-200 border border-gray-100`}
                >
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-bold text-gray-800 group-hover:text-white transition-colors text-sm">{cat.label}</h3>
                  <p className="text-xs text-gray-400 group-hover:text-white/80 transition-colors mt-1">{cat.count}+ কোর্স</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bestseller Courses ── */}
        <section className="py-14 px-4 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#1a1a2e]">বেস্টসেলার কোর্স</h2>
                <p className="text-gray-500 mt-1">সবচেয়ে জনপ্রিয় কোর্সগুলো</p>
              </div>
              <Link href="/courses" className="text-[#1CAB87] font-semibold text-sm hover:underline">
                সব দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.slice(0, 4).map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Free Courses ── */}
        <section className="py-14 px-4" style={{ background: 'linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#1a1a2e]">বিনামূল্যে কোর্স 🎁</h2>
                <p className="text-gray-600 mt-1">সম্পূর্ণ বিনামূল্যে শিখুন — কোনো ক্রেডিট কার্ড প্রয়োজন নেই</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {free.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Coaching Centers ── */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">বিশ্বস্ত কোচিং সেন্টার</h2>
            <p className="text-gray-500 mb-8">দেশের শীর্ষ শিক্ষা প্রতিষ্ঠান</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coachingCenters.map(center => (
                <div key={center.id} className="border border-gray-100 rounded-2xl p-6 flex gap-4 hover:shadow-md transition">
                  <div className="w-16 h-16 bg-[#1CAB87]/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-[#1CAB87]">{center.brandName[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#1a1a2e]">{center.brandName}</h3>
                      {center.verified && (
                        <span className="text-[#1CAB87] text-xs bg-green-50 px-2 py-0.5 rounded-full">✓ যাচাইকৃত</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{center.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                      {center.totalCourses !== undefined && <span>📚 {center.totalCourses} কোর্স</span>}
                      {center.totalStudents !== undefined && <span>👥 {center.totalStudents.toLocaleString()} শিক্ষার্থী</span>}
                      {center.address && <span>📍 {center.address}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Instructor CTA ── */}
        <section className="py-16 px-4 bg-gradient-to-r from-[#1a1a2e] to-[#1CAB87]">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-black mb-4">শিক্ষক হন, আয় করুন!</h2>
            <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
              আপনার জ্ঞান শেয়ার করুন, লক্ষ শিক্ষার্থীকে সাহায্য করুন এবং ঘরে বসেই আয় করুন।
            </p>
            <div className="flex justify-center gap-8 md:gap-16 mb-10 flex-wrap">
              {[
                { icon: '👨‍🎓', title: '৫০,০০০+', sub: 'শিক্ষার্থী' },
                { icon: '💰', title: '৳৫০,০০০+', sub: 'গড় মাসিক আয়' },
                { icon: '🏆', title: '৮০%', sub: 'নেট পেআউট' },
              ].map(item => (
                <div key={item.title} className="text-center">
                  <div className="text-3xl mb-1">{item.icon}</div>
                  <div className="text-2xl font-black">{item.title}</div>
                  <div className="text-gray-300 text-sm">{item.sub}</div>
                </div>
              ))}
            </div>
            <Link
              href="/instructor/register"
              className="inline-block bg-white text-[#1a1a2e] font-black px-10 py-4 rounded-full hover:bg-gray-100 transition text-lg"
            >
              এখনই শুরু করুন →
            </Link>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-14 px-4 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-[#1a1a2e] mb-2 text-center">শিক্ষার্থীরা কী বলছেন</h2>
            <p className="text-gray-500 mb-10 text-center">হাজার হাজার শিক্ষার্থীর বিশ্বাস অর্জন করেছে SI School</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex text-yellow-400 mb-3 text-lg">
                    {'★'.repeat(review.rating)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1CAB87]/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[#1CAB87] font-bold">{review.studentName[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#1a1a2e]">{review.studentName}</p>
                      <p className="text-xs text-gray-400">শিক্ষার্থী</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
