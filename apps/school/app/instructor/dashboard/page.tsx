'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { courses } from '@/lib/data'

type Tab = 'overview' | 'courses' | 'add' | 'students' | 'earnings' | 'withdraw' | 'settings'

const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন']
const monthlyEarnings = [18000, 22000, 19500, 28000, 24500, 24500]
const maxEarning = Math.max(...monthlyEarnings)

export default function InstructorDashboardPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Add course state
  const [courseName, setCourseName] = useState('')
  const [courseSlugPreview, setCourseSlugPreview] = useState('')
  const [chapters, setChapters] = useState<{ id: string; title: string; lessons: { id: string; title: string; duration: string; type: string; url: string; isFree: boolean }[] }[]>([])
  const [addCourseSuccess, setAddCourseSuccess] = useState(false)

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'bank' | 'rocket'>('bkash')
  const [withdrawAccount, setWithdrawAccount] = useState('')
  const [withdrawName, setWithdrawName] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  if (!user || (user.role !== 'instructor' && user.role !== 'super_admin')) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center bg-white rounded-2xl p-10 shadow border border-gray-100 max-w-sm w-full mx-4">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-black text-[#1a1a2e] mb-2">অ্যাক্সেস নেই</h2>
            <p className="text-gray-500 text-sm mb-6">এই পেজটি শুধুমাত্র শিক্ষকদের জন্য</p>
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
    { key: 'overview', label: 'ওভারভিউ', icon: '📊' },
    { key: 'courses', label: 'আমার কোর্স', icon: '📚' },
    { key: 'add', label: 'কোর্স যোগ করুন', icon: '➕' },
    { key: 'students', label: 'শিক্ষার্থী', icon: '👥' },
    { key: 'earnings', label: 'আয়', icon: '💰' },
    { key: 'withdraw', label: 'উত্তোলন', icon: '🏧' },
    { key: 'settings', label: 'সেটিংস', icon: '⚙️' },
  ]

  const addChapter = () => {
    setChapters(prev => [...prev, {
      id: `ch${Date.now()}`,
      title: '',
      lessons: []
    }])
  }

  const addLesson = (chapterId: string) => {
    setChapters(prev => prev.map(ch =>
      ch.id === chapterId
        ? { ...ch, lessons: [...ch.lessons, { id: `l${Date.now()}`, title: '', duration: '', type: 'video', url: '', isFree: false }] }
        : ch
    ))
  }

  const deleteChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(ch => ch.id !== chapterId))
  }

  const handleCourseNameChange = (val: string) => {
    setCourseName(val)
    setCourseSlugPreview(val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))
  }

  const instructorCourses = courses.filter(c => c.instructorId === 'inst-3' || user.role === 'super_admin').slice(0, 3)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-black text-blue-600">{user.name[0]}</span>
                </div>
                <h2 className="font-black text-[#1a1a2e]">{user.name}</h2>
                <div className="flex justify-center gap-2 mt-1">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">শিক্ষক</span>
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">✓ যাচাইকৃত</span>
                </div>
              </div>
              <div className="flex justify-around text-center border-t border-gray-100 pt-4">
                <div>
                  <div className="text-base font-black text-[#1a1a2e]">৳২,৮৪,৫০০</div>
                  <div className="text-xs text-gray-400">মোট আয়</div>
                </div>
                <div>
                  <div className="text-base font-black text-[#1a1a2e]">৫,২৪০</div>
                  <div className="text-xs text-gray-400">শিক্ষার্থী</div>
                </div>
              </div>
            </div>
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition text-left ${
                    activeTab === tab.key ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}>
                  <span>{tab.icon}</span><span>{tab.label}</span>
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition border-l-4 border-transparent">
                <span>🚪</span><span>লগআউট</span>
              </button>
            </nav>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">ওভারভিউ</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'মোট আয়', value: '৳২,৮৪,৫০০', icon: '💰', color: 'bg-green-50' },
                    { label: 'এই মাসে', value: '৳২৪,৫০০', icon: '📈', color: 'bg-blue-50' },
                    { label: 'মোট শিক্ষার্থী', value: '৫,২৪০', icon: '👥', color: 'bg-purple-50' },
                    { label: 'মোট কোর্স', value: '৩', icon: '📚', color: 'bg-orange-50' },
                  ].map(stat => (
                    <div key={stat.label} className={`${stat.color} rounded-xl p-4 border border-gray-100`}>
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-lg font-black text-[#1a1a2e]">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 shadow-sm">
                  <h3 className="font-bold text-[#1a1a2e] mb-4">মাসিক আয় (৬ মাস)</h3>
                  <div className="flex items-end gap-3 h-36">
                    {monthlyEarnings.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">৳{(val/1000).toFixed(0)}k</span>
                        <div className="w-full bg-blue-500 rounded-t-md" style={{ height: `${(val/maxEarning)*100}%` }} />
                        <span className="text-xs text-gray-400">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent enrollments */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-[#1a1a2e]">সাম্প্রতিক ভর্তি</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      { student: 'আরিফ হোসেন', course: 'Python বাংলায়', date: '০৩ জুলাই', amount: '৳৮০০' },
                      { student: 'সুমাইয়া বেগম', course: 'Web Development', date: '০২ জুলাই', amount: '৳৩৫০০' },
                      { student: 'তানভীর আহমেদ', course: 'Python বাংলায়', date: '০১ জুলাই', amount: '৳৮০০' },
                      { student: 'নাজমুল হাসান', course: 'Web Development', date: '৩০ জুন', amount: '৳৩৫০০' },
                      { student: 'রহিমা খাতুন', course: 'Python বাংলায়', date: '২৯ জুন', amount: '৳৮০০' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">{row.student[0]}</div>
                        <div className="flex-1"><p className="font-semibold text-gray-800">{row.student}</p><p className="text-xs text-gray-400">{row.course}</p></div>
                        <span className="text-gray-400 text-xs">{row.date}</span>
                        <span className="font-bold text-[#1CAB87]">{row.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">আমার কোর্স</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">কোর্স</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">স্ট্যাটাস</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">শিক্ষার্থী</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">আয়</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {instructorCourses.map(course => (
                        <tr key={course.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img src={course.thumbnail} alt={course.title} className="w-10 h-7 object-cover rounded" />
                              <span className="font-semibold text-gray-800 line-clamp-1">{course.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              course.status === 'approved' ? 'bg-green-100 text-green-700' :
                              course.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {course.status === 'approved' ? 'অনুমোদিত' : course.status === 'pending' ? 'পর্যালোচনাধীন' : 'প্রত্যাখ্যাত'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{course.enrollments.toLocaleString()}</td>
                          <td className="px-5 py-3 font-bold text-[#1CAB87]">৳{(course.price * course.enrollments * 0.8).toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition">সম্পাদনা</button>
                              <Link href={`/courses/${course.slug}`} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition">দেখুন</Link>
                              <button className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-100 transition">মুছুন</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'add' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">নতুন কোর্স যোগ করুন</h2>
                {addCourseSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="font-black text-green-800 mb-1">কোর্সটি পর্যালোচনার জন্য পাঠানো হয়েছে।</h3>
                    <p className="text-green-600 text-sm">অনুমোদনের পরে প্রকাশিত হবে।</p>
                    <button onClick={() => setAddCourseSuccess(false)} className="mt-4 bg-[#1CAB87] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#17976d] transition text-sm">আবার যোগ করুন</button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">কোর্সের নাম</label>
                      <input value={courseName} onChange={e => handleCourseNameChange(e.target.value)} placeholder="কোর্সের নাম লিখুন" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      {courseSlugPreview && (
                        <p className="text-xs text-gray-400 mt-1">🔗 school.sigroup.com.bd/courses/<span className="text-[#1CAB87] font-semibold">{courseSlugPreview}</span></p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিভাগ</label>
                        <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition">
                          <option>Academic</option><option>Skills</option><option>Professional</option><option>Creative</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্তর</label>
                        <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition">
                          <option value="beginner">শুরুর স্তর</option><option value="intermediate">মধ্যম স্তর</option><option value="advanced">উন্নত স্তর</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">মূল্য (৳)</label>
                        <input type="number" placeholder="0 = বিনামূল্যে" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">আসল মূল্য (৳)</label>
                        <input type="number" placeholder="ছাড়ের আগের মূল্য" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">কোর্সের বিবরণ</label>
                      <textarea rows={4} placeholder="কোর্সটি সম্পর্কে বিস্তারিত লিখুন..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition resize-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">থাম্বনেইল</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm cursor-pointer hover:border-[#1CAB87] transition">
                        🖼️ থাম্বনেইল আপলোড করুন (16:9 অনুপাত)
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রিভিউ ভিডিও URL (YouTube)</label>
                      <input placeholder="https://youtube.com/watch?v=..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                    </div>

                    {/* Chapter builder */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-700">অধ্যায় ও পাঠ</label>
                        <button type="button" onClick={addChapter} className="bg-[#1CAB87]/10 text-[#1CAB87] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#1CAB87]/20 transition">
                          + অধ্যায় যোগ করুন
                        </button>
                      </div>
                      <div className="space-y-3">
                        {chapters.map((ch, ci) => (
                          <div key={ch.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-bold text-gray-500">অধ্যায় {ci + 1}:</span>
                              <input
                                value={ch.title}
                                onChange={e => setChapters(prev => prev.map(c => c.id === ch.id ? { ...c, title: e.target.value } : c))}
                                placeholder="অধ্যায়ের শিরোনাম"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1CAB87] transition"
                              />
                              <button onClick={() => deleteChapter(ch.id)} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                            </div>
                            <div className="space-y-2 ml-4">
                              {ch.lessons.map((lesson, li) => (
                                <div key={lesson.id} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">{li + 1}.</span>
                                  <input
                                    value={lesson.title}
                                    onChange={e => setChapters(prev => prev.map(c => c.id === ch.id ? { ...c, lessons: c.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l) } : c))}
                                    placeholder="পাঠের শিরোনাম"
                                    className="flex-1 border border-gray-100 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#1CAB87] transition"
                                  />
                                  <select className="border border-gray-100 rounded-lg px-2 py-1.5 text-xs outline-none">
                                    <option>video</option><option>pdf</option><option>quiz</option><option>live</option>
                                  </select>
                                  <label className="flex items-center gap-1 text-xs text-gray-500">
                                    <input type="checkbox" className="accent-[#1CAB87]" /> ফ্রি
                                  </label>
                                </div>
                              ))}
                              <button onClick={() => addLesson(ch.id)} className="text-xs text-[#1CAB87] hover:underline">+ পাঠ যোগ করুন</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-[#1CAB87]" />
                        <span className="text-sm">🏆 সার্টিফিকেট</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-[#1CAB87]" />
                        <span className="text-sm">🔴 লাইভ ক্লাস</span>
                      </label>
                    </div>

                    <button onClick={() => setAddCourseSuccess(true)} className="w-full bg-[#1CAB87] text-white font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition text-base">
                      জমা দিন
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">শিক্ষার্থী</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">শিক্ষার্থী</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">কোর্স</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">ভর্তির তারিখ</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">প্রগ্রেস</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">পেমেন্ট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { name: 'আরিফ হোসেন', course: 'Python বাংলায়', date: '০৩ জুলাই', progress: 45, payment: '৳৮০০' },
                        { name: 'সুমাইয়া বেগম', course: 'Web Development', date: '০২ জুলাই', progress: 20, payment: '৳৩৫০০' },
                        { name: 'তানভীর আহমেদ', course: 'Python বাংলায়', date: '০১ জুলাই', progress: 78, payment: '৳৮০০' },
                        { name: 'নাজমুল হাসান', course: 'Web Development', date: '৩০ জুন', progress: 55, payment: '৳৩৫০০' },
                        { name: 'রহিমা খাতুন', course: 'Python বাংলায়', date: '২৯ জুন', progress: 90, payment: '৳৮০০' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3 font-semibold text-gray-800">{row.name}</td>
                          <td className="px-5 py-3 text-gray-500">{row.course}</td>
                          <td className="px-5 py-3 text-gray-400">{row.date}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-[#1CAB87] h-1.5 rounded-full" style={{ width: `${row.progress}%` }} /></div>
                              <span className="text-xs text-gray-500">{row.progress}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-bold text-[#1CAB87]">{row.payment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">আয়ের বিবরণ</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">মাস</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">ভর্তি</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">মোট</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">প্ল্যাটফর্ম (২০%)</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">নেট পেআউট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { month: 'জানুয়ারি ২০২৪', count: 18, gross: 18000 },
                        { month: 'ফেব্রুয়ারি ২০২৪', count: 22, gross: 22000 },
                        { month: 'মার্চ ২০২৪', count: 20, gross: 19500 },
                        { month: 'এপ্রিল ২০২৪', count: 35, gross: 28000 },
                        { month: 'মে ২০২৪', count: 30, gross: 24500 },
                        { month: 'জুন ২০২৪', count: 30, gross: 24500 },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3 font-semibold text-gray-700">{row.month}</td>
                          <td className="px-5 py-3 text-gray-500">{row.count}</td>
                          <td className="px-5 py-3 text-gray-700">৳{row.gross.toLocaleString()}</td>
                          <td className="px-5 py-3 text-red-400">- ৳{(row.gross * 0.2).toLocaleString()}</td>
                          <td className="px-5 py-3 font-bold text-[#1CAB87]">৳{(row.gross * 0.8).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                      <tr>
                        <td className="px-5 py-3 font-black text-[#1a1a2e]">মোট</td>
                        <td className="px-5 py-3 font-bold">১৫৫</td>
                        <td className="px-5 py-3 font-bold">৳১,৩৬,৫০০</td>
                        <td className="px-5 py-3 font-bold text-red-400">- ৳২৭,৩০০</td>
                        <td className="px-5 py-3 font-black text-[#1CAB87]">৳১,০৯,২০০</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">উত্তোলন</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">উপলব্ধ ব্যালেন্স</p>
                      <p className="text-3xl font-black text-[#1CAB87]">৳২৪,৫০০</p>
                    </div>
                  </div>
                  {withdrawSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <h3 className="font-black text-green-800 mb-1">অনুরোধ সফল!</h3>
                      <p className="text-green-600 text-sm">১-২ কার্যদিবসের মধ্যে পাঠানো হবে।</p>
                      <button onClick={() => setWithdrawSuccess(false)} className="mt-3 text-sm text-[#1CAB87] hover:underline">আরও উত্তোলন করুন</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">পরিমাণ (৳)</label>
                        <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="উত্তোলনের পরিমাণ" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">পদ্ধতি</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['bkash', 'nagad', 'bank', 'rocket'] as const).map(m => (
                            <label key={m} className={`flex items-center gap-2 cursor-pointer border rounded-xl px-4 py-2.5 transition ${withdrawMethod === m ? 'border-[#1CAB87] bg-[#1CAB87]/5' : 'border-gray-200'}`}>
                              <input type="radio" checked={withdrawMethod === m} onChange={() => setWithdrawMethod(m)} className="accent-[#1CAB87]" />
                              <span className="text-sm capitalize">{m === 'bkash' ? 'বিকাশ' : m === 'nagad' ? 'নগদ' : m === 'bank' ? 'ব্যাংক' : 'রকেট'}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">একাউন্ট নম্বর</label>
                        <input value={withdrawAccount} onChange={e => setWithdrawAccount(e.target.value)} placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">একাউন্ট নাম</label>
                        <input value={withdrawName} onChange={e => setWithdrawName(e.target.value)} placeholder="আপনার নাম" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                      <button onClick={() => setWithdrawSuccess(true)} className="w-full bg-[#1CAB87] text-white font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition">
                        উত্তোলনের অনুরোধ করুন
                      </button>
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 font-bold text-[#1a1a2e]">উত্তোলনের ইতিহাস</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">তারিখ</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">পরিমাণ</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">পদ্ধতি</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">স্ট্যাটাস</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { date: '০১ জুলাই', amount: '৳১০,০০০', method: 'বিকাশ', status: 'pending' },
                        { date: '২০ মে', amount: '৳১৫,০০০', method: 'নগদ', status: 'approved' },
                        { date: '১০ এপ্রিল', amount: '৳৮,০০০', method: 'বিকাশ', status: 'approved' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3 text-gray-500">{row.date}</td>
                          <td className="px-5 py-3 font-bold">{row.amount}</td>
                          <td className="px-5 py-3 text-gray-500">{row.method}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {row.status === 'approved' ? 'সম্পন্ন' : 'প্রক্রিয়াধীন'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">সেটিংস</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                  {[
                    { label: 'পূর্ণ নাম', value: user.name, type: 'text' },
                    { label: 'ইমেইল', value: user.email, type: 'email' },
                    { label: 'ফোন', value: user.phone || '', type: 'tel' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                      <input type={f.type} defaultValue={f.value} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">জীবনী</label>
                    <textarea rows={3} placeholder="আপনার সম্পর্কে লিখুন..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition resize-none" />
                  </div>
                  <button className="bg-[#1CAB87] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#17976d] transition">সংরক্ষণ করুন</button>
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
