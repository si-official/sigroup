'use client'
import { useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CourseCard from '@/components/CourseCard'
import { courses, categories } from '@/lib/data'

type SortKey = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('popular')

  const filtered = useMemo(() => {
    let list = courses.filter(c => c.status === 'approved')

    if (selectedCategory !== 'all') {
      list = list.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase())
    }
    if (selectedPrice === 'free') list = list.filter(c => c.price === 0)
    else if (selectedPrice === 'under1000') list = list.filter(c => c.price > 0 && c.price < 1000)
    else if (selectedPrice === '1000-3000') list = list.filter(c => c.price >= 1000 && c.price <= 3000)
    else if (selectedPrice === 'over3000') list = list.filter(c => c.price > 3000)

    if (selectedLevel !== 'all') list = list.filter(c => c.level === selectedLevel)
    if (selectedLanguage !== 'all') list = list.filter(c => c.language === selectedLanguage)
    if (selectedRating === '4+') list = list.filter(c => c.rating >= 4)
    else if (selectedRating === '4.5+') list = list.filter(c => c.rating >= 4.5)

    switch (sortKey) {
      case 'popular': return [...list].sort((a, b) => b.enrollments - a.enrollments)
      case 'newest': return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'rating': return [...list].sort((a, b) => b.rating - a.rating)
      default: return list
    }
  }, [selectedCategory, selectedPrice, selectedLevel, selectedLanguage, selectedRating, sortKey])

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'popular', label: 'জনপ্রিয়' },
    { key: 'newest', label: 'নতুন' },
    { key: 'price-asc', label: 'মূল্য: কম→বেশি' },
    { key: 'price-desc', label: 'মূল্য: বেশি→কম' },
    { key: 'rating', label: 'রেটিং' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#1CAB87] text-white py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-black mb-2">সকল কোর্স</h1>
            <p className="text-gray-300">আপনার পছন্দের কোর্স খুঁজে নিন</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24 space-y-6">
              {/* Category */}
              <div>
                <h3 className="font-bold text-[#1a1a2e] mb-3">বিভাগ</h3>
                <div className="space-y-2">
                  {[{ id: 'all', bangla: 'সব বিভাগ' }, ...categories.map(c => ({ id: c.name || c.id, bangla: c.bangla || c.labelBn || c.id }))].map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="accent-[#1CAB87]"
                      />
                      <span className="text-sm text-gray-700">{cat.bangla}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="font-bold text-[#1a1a2e] mb-3">মূল্য</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'সব মূল্য' },
                    { value: 'free', label: 'বিনামূল্যে' },
                    { value: 'under1000', label: '৳১০০০ এর নিচে' },
                    { value: '1000-3000', label: '৳১০০০ - ৳৩০০০' },
                    { value: 'over3000', label: '৳৩০০০ এর বেশি' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={opt.value}
                        checked={selectedPrice === opt.value}
                        onChange={() => setSelectedPrice(opt.value)}
                        className="accent-[#1CAB87]"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <h3 className="font-bold text-[#1a1a2e] mb-3">স্তর</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'সব স্তর' },
                    { value: 'beginner', label: 'শুরুর স্তর' },
                    { value: 'intermediate', label: 'মধ্যম স্তর' },
                    { value: 'advanced', label: 'উন্নত স্তর' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={opt.value}
                        checked={selectedLevel === opt.value}
                        onChange={() => setSelectedLevel(opt.value)}
                        className="accent-[#1CAB87]"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <h3 className="font-bold text-[#1a1a2e] mb-3">ভাষা</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'সব ভাষা' },
                    { value: 'bangla', label: 'বাংলা' },
                    { value: 'english', label: 'ইংরেজি' },
                    { value: 'both', label: 'উভয়' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value={opt.value}
                        checked={selectedLanguage === opt.value}
                        onChange={() => setSelectedLanguage(opt.value)}
                        className="accent-[#1CAB87]"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-bold text-[#1a1a2e] mb-3">রেটিং</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'যেকোনো রেটিং' },
                    { value: '4+', label: '৪+ ⭐' },
                    { value: '4.5+', label: '৪.৫+ ⭐' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={opt.value}
                        checked={selectedRating === opt.value}
                        onChange={() => setSelectedRating(opt.value)}
                        className="accent-[#1CAB87]"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setSelectedCategory('all'); setSelectedPrice('all'); setSelectedLevel('all'); setSelectedLanguage('all'); setSelectedRating('all') }}
                className="w-full text-sm text-[#1CAB87] border border-[#1CAB87] py-2 rounded-lg hover:bg-[#1CAB87] hover:text-white transition"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex-wrap gap-3">
              <span className="text-sm font-semibold text-gray-600">{filtered.length} কোর্স পাওয়া গেছে</span>
              <div className="flex gap-2 flex-wrap">
                {sortOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortKey(opt.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      sortKey === opt.key
                        ? 'bg-[#1CAB87] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">😔</div>
                <p className="text-lg font-semibold">কোনো কোর্স পাওয়া যায়নি</p>
                <p className="text-sm mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
