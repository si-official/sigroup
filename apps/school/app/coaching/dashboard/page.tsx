'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { courses } from '@/lib/data'

type Tab = 'overview' | 'courses' | 'add' | 'instructors' | 'students' | 'earnings' | 'withdraw' | 'settings'

const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন']
const monthlyRevenue = [45000, 62000, 58000, 80000, 75000, 72000]
const maxRev = Math.max(...monthlyRevenue)

export default function CoachingDashboardPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [addCourseSuccess, setAddCourseSuccess] = useState(false)

  if (!user || (user.role !== 'coaching_center' && user.role !== 'super_admin')) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center bg-white rounded-2xl p-10 shadow border border-gray-100 max-w-sm w-full mx-4">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-black text-[#1a1a2e] mb-2">অ্যাক্সেস নেই</h2>
            <p className="text-gray-500 text-sm mb-6">এই পেজটি শুধুমাত্র কোচিং সেন্টারের জন্য</p>
            <Link href="/student/login" className="block w-full bg-[#1CAB87] text-white font-bold py-3 rounded-xl hover:bg-[#17976d] transition text-center">লগইন করুন</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'ওভারভিউ', icon: '📊' },
    { key: 'courses', label: 'কোর্সমূহ', icon: '📚' },
    { key: 'add', label: 'কোর্স যোগ করুন', icon: '➕' },
    { key: 'instructors', label: 'শিক্ষকগণ', icon: '👨‍🏫' },
    { key: 'students', label: 'শিক্ষার্থী', icon: '👥' },
    { key: 'earnings', label: 'আয় ও কমিশন', icon: '💰' },
    { key: 'withdraw', label: 'উত্তোলন', icon: '🏧' },
    { key: 'settings', label: 'সেটিংস', icon: '⚙️' },
  ]

  const coachingCourses = courses.filter(c => c.coachingCenterId === 'coaching-1' || c.coachingCenterId === 'coaching-2').slice(0, 4)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-black text-purple-600">{user.name[0]}</span>
                </div>
                <h2 className="font-black text-[#1a1a2e]">{user.name}</h2>
                <div className="flex justify-center gap-2 mt-1 flex-wrap">
                  <span className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">কোচিং সেন্টার</span>
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">✓ যাচাইকৃত</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 text-center">
                {[
                  { val: '৳৫,৮০,০০০', label: 'মোট আয়' },
                  { val: '৩,১০০', label: 'শিক্ষার্থী' },
                  { val: '৫', label: 'কোর্স' },
                  { val: '২', label: 'শিক্ষক' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-sm font-black text-[#1a1a2e]">{s.val}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition text-left ${
                    activeTab === tab.key ? 'bg-purple-50 text-purple-600 border-l-4 border-purple-500' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
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
                    { label: 'মোট আয়', value: '৳৫,৮০,০০০', icon: '💰', color: 'bg-green-50' },
                    { label: 'এই মাসে', value: '৳৭২,০০০', icon: '📈', color: 'bg-blue-50' },
                    { label: 'মোট শিক্ষার্থী', value: '৩,১০০', icon: '👥', color: 'bg-purple-50' },
                    { label: 'মোট কোর্স', value: '৫', icon: '📚', color: 'bg-orange-50' },
                  ].map(stat => (
                    <div key={stat.label} className={`${stat.color} rounded-xl p-4 border border-gray-100`}>
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-lg font-black text-[#1a1a2e]">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-[#1a1a2e] mb-4">মাসিক রাজস্ব</h3>
                  <div className="flex items-end gap-3 h-36">
                    {monthlyRevenue.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">৳{(val/1000).toFixed(0)}k</span>
                        <div className="w-full bg-purple-500 rounded-t-md" style={{ height: `${(val/maxRev)*100}%` }} />
                        <span className="text-xs text-gray-400">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">কোর্সমূহ</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">কোর্স</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">স্ট্যাটাস</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">শিক্ষার্থী</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">আয়</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {coachingCourses.map(course => (
                        <tr key={course.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img src={course.thumbnail} alt="" className="w-10 h-7 object-cover rounded" />
                              <span className="font-semibold text-gray-800 line-clamp-1">{course.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">অনুমোদিত</span>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{course.enrollments.toLocaleString()}</td>
                          <td className="px-5 py-3 font-bold text-[#1CAB87]">৳{(course.price * course.enrollments * 0.64).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'add' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">কোর্স যোগ করুন</h2>
                {addCourseSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="font-black text-green-800 mb-1">কোর্সটি পর্যালোচনার জন্য পাঠানো হয়েছে।</h3>
                    <p className="text-green-600 text-sm">অনুমোদনের পরে প্রকাশিত হবে।</p>
                    <button onClick={() => setAddCourseSuccess(false)} className="mt-4 bg-[#1CAB87] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#17976d] transition text-sm">আবার যোগ করুন</button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-700 font-semibold">
                      📌 এই কোর্সটি {user.name}-এর অধীনে প্রকাশিত হবে
                    </div>
                    {[
                      { label: 'কোর্সের নাম', placeholder: 'কোর্সের নাম লিখুন' },
                      { label: 'বিবরণ', placeholder: 'কোর্সটি সম্পর্কে বিস্তারিত...' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                        <input placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">মূল্য (৳)</label>
                        <input type="number" placeholder="0 = বিনামূল্যে" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিভাগ</label>
                        <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition">
                          <option>Academic</option><option>Skills</option><option>Professional</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">থাম্বনেইল</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm cursor-pointer hover:border-[#1CAB87] transition">🖼️ থাম্বনেইল আপলোড করুন</div>
                    </div>
                    <button onClick={() => setAddCourseSuccess(true)} className="w-full bg-[#1CAB87] text-white font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition">জমা দিন</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'instructors' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-[#1a1a2e]">শিক্ষকগণ</h2>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">শিক্ষক</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">কোর্স</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">শিক্ষার্থী</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { name: 'মো. রহিম উদ্দিন', courses: 3, students: 3240, verified: true },
                        { name: 'করিম ভাই', courses: 2, students: 5600, verified: true },
                      ].map((inst, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">{inst.name[0]}</div>
                              <span className="font-semibold text-gray-800">{inst.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-500">{inst.courses}টি</td>
                          <td className="px-5 py-3 text-gray-500">{inst.students.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            {inst.verified && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">✓ যাচাইকৃত</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Invite */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1a1a2e] mb-3">নতুন শিক্ষক আমন্ত্রণ করুন</h3>
                  {inviteSuccess ? (
                    <p className="text-[#1CAB87] font-semibold">✅ আমন্ত্রণ পাঠানো হয়েছে!</p>
                  ) : (
                    <div className="flex gap-2">
                      <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="instructor@email.com" className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      <button onClick={() => setInviteSuccess(true)} className="bg-[#1CAB87] text-white font-bold px-5 py-3 rounded-xl hover:bg-[#17976d] transition text-sm">আমন্ত্রণ পাঠান</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">সকল শিক্ষার্থী</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">শিক্ষার্থী</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">কোর্স</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">তারিখ</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">পেমেন্ট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { name: 'আরিফ হোসেন', course: 'SSC গণিত', date: '০৩ জুলাই', payment: '৳১২০০' },
                        { name: 'সুমাইয়া বেগম', course: 'BCS প্রস্তুতি', date: '০২ জুলাই', payment: '৳১৮০০' },
                        { name: 'তানভীর আহমেদ', course: 'SSC গণিত', date: '০১ জুলাই', payment: '৳১২০০' },
                        { name: 'নাজমুল হাসান', course: 'BCS প্রস্তুতি', date: '৩০ জুন', payment: '৳১৮০০' },
                        { name: 'রহিমা খাতুন', course: 'Python বাংলায়', date: '২৯ জুন', payment: '৳৮০০' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3 font-semibold text-gray-800">{row.name}</td>
                          <td className="px-5 py-3 text-gray-500">{row.course}</td>
                          <td className="px-5 py-3 text-gray-400">{row.date}</td>
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
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">আয় ও কমিশন</h2>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">মোট আয়</p>
                    <p className="text-xl font-black text-[#1CAB87]">৳৫,৮০,০০০</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs text-gray-500 mb-1">প্ল্যাটফর্ম কমিশন (২০%)</p>
                    <p className="text-xl font-black text-red-500">৳১,১৬,০০০</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">নেট পেআউট</p>
                    <p className="text-xl font-black text-blue-600">৳৪,৬৪,০০০</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">মাস</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">মোট</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">কমিশন (২০%)</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">নেট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন'].map((m, i) => {
                        const gross = monthlyRevenue[i]
                        return (
                          <tr key={m} className="hover:bg-gray-50 transition">
                            <td className="px-5 py-3 font-semibold text-gray-700">{m} ২০২৪</td>
                            <td className="px-5 py-3 text-gray-700">৳{gross.toLocaleString()}</td>
                            <td className="px-5 py-3 text-red-400">- ৳{(gross*0.2).toLocaleString()}</td>
                            <td className="px-5 py-3 font-bold text-[#1CAB87]">৳{(gross*0.8).toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">উত্তোলন</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                  <p className="text-sm text-gray-500 mb-1">উপলব্ধ ব্যালেন্স</p>
                  <p className="text-3xl font-black text-[#1CAB87] mb-4">৳৪৬,৪০০</p>
                  {withdrawSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <h3 className="font-black text-green-800">অনুরোধ সফল!</h3>
                      <p className="text-green-600 text-sm mt-1">১-২ কার্যদিবসের মধ্যে পাঠানো হবে।</p>
                      <button onClick={() => setWithdrawSuccess(false)} className="mt-3 text-sm text-[#1CAB87] hover:underline">আবার করুন</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">পরিমাণ (৳)</label>
                        <input type="number" placeholder="উত্তোলনের পরিমাণ" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">পদ্ধতি</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['বিকাশ', 'নগদ', 'ব্যাংক', 'রকেট'].map(m => (
                            <label key={m} className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl px-4 py-2.5 hover:border-[#1CAB87] transition">
                              <input type="radio" name="method" className="accent-[#1CAB87]" />
                              <span className="text-sm">{m}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">একাউন্ট নম্বর</label>
                        <input placeholder="একাউন্ট নম্বর" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                      </div>
                      <button onClick={() => setWithdrawSuccess(true)} className="w-full bg-[#1CAB87] text-white font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition">
                        উত্তোলনের অনুরোধ করুন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-black text-[#1a1a2e] mb-5">সেটিংস</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                  {[
                    { label: 'প্রতিষ্ঠানের নাম', value: user.name, type: 'text' },
                    { label: 'ইমেইল', value: user.email, type: 'email' },
                    { label: 'ঠিকানা', value: '', type: 'text' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                      <input type={f.type} defaultValue={f.value} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিবরণ</label>
                    <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">লোগো</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm cursor-pointer hover:border-[#1CAB87] transition">🖼️ নতুন লোগো আপলোড করুন</div>
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
