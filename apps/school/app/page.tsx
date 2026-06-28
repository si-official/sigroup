'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import CourseCard from '@/components/CourseCard'
import { courses, categories } from '@/lib/courses'

export default function HomePage() {
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const filtered = courses.filter((c) =>
    (cat === 'All' || c.category === cat) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl p-12 mb-10 text-white">
          <h1 className="text-4xl md:text-5xl font-black mb-3">SI School</h1>
          <p className="text-yellow-100 text-xl mb-6">বাংলায় শিখুন, ক্যারিয়ার গড়ুন</p>
          <input type="text" placeholder="কোর্স খুঁজুন..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-white/20 border border-white/30 text-white placeholder-yellow-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50" />
          <div className="flex gap-6 mt-8 flex-wrap">
            {[{ v: '5,000+', l: 'Students' }, { v: '50+', l: 'Courses' }, { v: '4.8★', l: 'Rating' }, { v: '100%', l: 'Bangla' }].map((s) => (
              <div key={s.l}><p className="text-3xl font-black">{s.v}</p><p className="text-yellow-200 text-sm">{s.l}</p></div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition ${cat === c ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-yellow-300'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </main>
    </>
  )
}
