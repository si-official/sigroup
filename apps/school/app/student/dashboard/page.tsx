'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'

const enrolledCourses = [
  { slug: 'ssc-math-master', title: 'SSC গণিত মাস্টার কোর্স', instructor: 'মো. রহিম উদ্দিন', progress: 40, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80' },
  { slug: 'python-bangla', title: 'Python প্রোগ্রামিং বাংলায়', instructor: 'করিম ভাই', progress: 75, thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80' },
  { slug: 'english-speaking', title: 'ইংরেজিতে কথা বলা শিখুন', instructor: 'ফাতেমা আক্তার', progress: 10, thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80' },
]

const days = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি', 'রবি']
const weekActivity = [3, 5, 2, 7, 4, 1, 6]

type Tab = 'courses' | 'progress' | 'certificate' | 'live' | 'notes' | 'qa' | 'profile'

export default function StudentDashboardPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('courses')

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center bg-white rounded-2xl p-10 shadow border border-gray-100 max-w-sm w-full mx-4">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-black text-[#1a1a2e] mb-2">লগইন প্রয়োজন</h2>
            <p className="text-gray-500 text-sm mb-6">ড্যাশবোর্ড দেখতে লগইন করুন</p>
            <Link href="/student/login" className="block w-full bg-[#1CAB87] text-white font-bold py-3 rounded-xl hover:bg-[#17976d] transition text-center">
              লগইন করুন
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'courses', label: 'আমার কোর্স', icon: '📚' },
    { key: 'progress', label: 'প্রগ্রেস', icon: '📈' },
    { key: 'certificate', label: 'সার্টিফিকেট', icon: '🏆' },
    { key: 'live', label: 'লাইভ ক্লাস', icon: '🔴' },
    { key: 'notes', label: 'নোটস', icon: '📝' },
    { key: 'qa', label: 'প্রশ্নোত্তর', icon: '❓' },
    { key: 'profile', label: 'প্রোফাইল', icon: '👤' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-black text-green-600">{user.name[0]}</span>
                </div>
                <h2 className="font-black text-[#1a1a2e]">{user.name}</h2>
                <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full mt-1 font-semibold">শিক্ষার্থী</span>
              </div>
              <div className="flex justify-around text-center border-t border-gray-100 pt-4">
                <div>
                  <div className="text-lg font-black text-[#1a1a2e]">125</div>
                  <div className="text-xs text-gray-400">XP</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[#1a1a2e]">3</div>
                  <div className="text-xs text-gray-400">কোর্স</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[#1a1a2e]">1</div>
                  <div className="text-xs text-gray-400">সার্টিফিকেট</div>
                </div>
              </div>
            </div>

            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition text-left ${
                    activeTab === tab.key
                      ? 'bg-[#1CAB87]/10 text-[#1CAB87] border-l-4 border-[#1CAB87]'
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition border-l-4 border-transparent"
              >
                <span>🚪</span>
                <span>লগআউট</span>
              </button>
            </nav>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {activeTab === 'courses' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">আমার কোর্স</h2>
                <div className="space-y-4">
                  {enrolledCourses.map(course => (
                    <div key={course.slug} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 shadow-sm">
                      <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1a1a2e] text-sm mb-1 line-clamp-1">{course.title}</h3>
                        <p className="text-xs text-gray-400 mb-3">{course.instructor}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-[#1CAB87] h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-500">{course.progress}%</span>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${course.slug}/learn`}
                        className="self-center bg-[#1CAB87] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#17976d] transition shrink-0"
                      >
                        চালিয়ে যান
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">প্রগ্রেস</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: '📚', value: '৩টি', label: 'কোর্সে ভর্তি' },
                    { icon: '✅', value: '৩২টি', label: 'লেসন সম্পন্ন' },
                    { icon: '⚡', value: '১২৫', label: 'XP অর্জন' },
                    { icon: '🔥', value: '৫ দিন', label: 'ধারাবাহিকতা' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-xl font-black text-[#1a1a2e]">{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-[#1a1a2e] mb-4">এই সপ্তাহের কার্যক্রম</h3>
                  <div className="flex items-end gap-2 h-32">
                    {weekActivity.map((count, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">{count}</span>
                        <div
                          className="w-full bg-[#1CAB87] rounded-t-md transition-all"
                          style={{ height: `${(count / 7) * 100}%` }}
                        />
                        <span className="text-xs text-gray-400">{days[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certificate' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">সার্টিফিকেট</h2>
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row items-center gap-5">
                  <div className="w-32 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-4xl">🏆</span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-black text-[#1a1a2e] mb-1">Python প্রোগ্রামিং বাংলায়</h3>
                    <p className="text-sm text-gray-400 mb-3">সম্পন্ন: ২০২৪-০৩-১৫</p>
                    <div className="flex gap-3 justify-center md:justify-start">
                      <button className="bg-[#1CAB87] text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-[#17976d] transition">
                        ডাউনলোড করুন
                      </button>
                      <button className="border border-blue-500 text-blue-500 text-sm font-bold px-5 py-2 rounded-lg hover:bg-blue-50 transition">
                        শেয়ার করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'live' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">আসন্ন লাইভ ক্লাস</h2>
                <div className="space-y-4">
                  {[
                    { date: '৮ জুলাই, ২০২৬', time: 'রাত ৮:০০', course: 'SSC গণিত মাস্টার কোর্স', instructor: 'মো. রহিম উদ্দিন', link: '#' },
                    { date: '১০ জুলাই, ২০২৬', time: 'রাত ৭:৩০', course: 'Web Development Full Stack', instructor: 'করিম ভাই', link: '#' },
                  ].map((cls, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="bg-red-50 rounded-xl p-3 text-center shrink-0">
                        <div className="text-red-500 font-black text-lg">🔴</div>
                        <div className="text-xs text-red-600 font-semibold">{cls.date}</div>
                        <div className="text-xs text-red-400">{cls.time}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#1a1a2e] mb-1">{cls.course}</h3>
                        <p className="text-sm text-gray-400">শিক্ষক: {cls.instructor}</p>
                      </div>
                      <a
                        href={cls.link}
                        className="bg-[#1CAB87] text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[#17976d] transition shrink-0"
                      >
                        যোগ দিন
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">আমার নোটস</h2>
                <div className="space-y-4">
                  {[
                    { course: 'SSC গণিত', lesson: 'বীজগণিতের পরিচয়', note: 'a² - b² = (a+b)(a-b) — এই সূত্রটি ভালো করে মনে রাখতে হবে। প্র্যাকটিস: পৃষ্ঠা ৪৫' },
                    { course: 'Python', lesson: 'OOP — Class ও Object', note: 'Class হলো blueprint, Object হলো instance। __init__ হলো constructor।' },
                    { course: 'IELTS', lesson: 'Task 2 Essay Writing', note: 'Intro → 2 Body paragraphs → Conclusion. PEEL structure use করতে হবে।' },
                  ].map((note, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#1CAB87]/10 text-[#1CAB87] text-xs font-semibold px-2 py-0.5 rounded">{note.course}</span>
                            <span className="text-xs text-gray-400">{note.lesson}</span>
                          </div>
                          <p className="text-sm text-gray-700">{note.note}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button className="text-blue-400 hover:text-blue-600 text-xs">সম্পাদনা</button>
                          <button className="text-red-400 hover:text-red-600 text-xs">মুছুন</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">প্রশ্নোত্তর</h2>
                <div className="space-y-4">
                  {[
                    {
                      question: 'Python-এ list comprehension কীভাবে কাজ করে?',
                      answer: 'List comprehension হলো একটি সংক্ষিপ্ত উপায়ে list তৈরি করা। যেমন: [x*2 for x in range(10)] এটি 0 থেকে 9 পর্যন্ত সংখ্যাকে দ্বিগুণ করে একটি list তৈরি করে।',
                      by: 'করিম ভাই',
                    },
                    {
                      question: 'SSC গণিতে জ্যামিতির উপপাদ্য মুখস্থ করার কোনো সহজ পদ্ধতি আছে?',
                      answer: 'প্রতিটি উপপাদ্য একটি চিত্র এঁকে বোঝার চেষ্টা করুন। শুধু মুখস্থ না করে কেন সত্য তা বোঝার চেষ্টা করলে দীর্ঘস্থায়ী হয়।',
                      by: 'মো. রহিম উদ্দিন',
                    },
                  ].map((qa, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <div className="mb-3">
                        <span className="text-blue-500 font-bold text-xs">প্রশ্ন:</span>
                        <p className="text-sm text-gray-800 mt-1">{qa.question}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <span className="text-[#1CAB87] font-bold text-xs">উত্তর ({qa.by}):</span>
                        <p className="text-sm text-gray-700 mt-1">{qa.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">প্রোফাইল সম্পাদনা</h2>
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
                  {[
                    { label: 'পূর্ণ নাম', value: user.name, type: 'text' },
                    { label: 'ইমেইল', value: user.email, type: 'email' },
                    { label: 'ফোন নম্বর', value: user.phone || '', type: 'tel' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">নতুন পাসওয়ার্ড</label>
                    <input type="password" placeholder="পরিবর্তন করতে চাইলে লিখুন" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                  </div>
                  <button className="bg-[#1CAB87] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#17976d] transition">
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
