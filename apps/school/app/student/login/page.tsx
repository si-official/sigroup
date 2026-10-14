'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'

export default function StudentLoginPage() {
  const { login } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regRole, setRegRole] = useState('student')
  const [regSuccess, setRegSuccess] = useState(false)
  const [regError, setRegError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    const result = await login(email, password)
    setLoginLoading(false)
    if (!result.success) {
      setLoginError(result.error || 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে')
      return
    }
    // Redirect based on role (get fresh user from localStorage)
    const stored = localStorage.getItem('school_current_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (user.role === 'super_admin' || user.role === 'admin') {
        window.location.href = '/admin'
      } else if (user.role === 'instructor') {
        window.location.href = '/instructor/dashboard'
      } else if (user.role === 'coaching_center') {
        window.location.href = '/coaching/dashboard'
      } else {
        window.location.href = '/student/dashboard'
      }
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (regPassword !== regConfirm) {
      setRegError('পাসওয়ার্ড মিলছে না')
      return
    }
    if (regPassword.length < 6) {
      setRegError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
      return
    }
    setRegSuccess(true)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Demo credentials */}
          <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 mb-6 text-sm">
            <p className="text-gray-400 font-semibold mb-2">🔑 ডেমো ক্রেডেনশিয়াল:</p>
            <div className="space-y-1.5 font-mono text-xs">
              <p className="text-green-400">🟢 Student: student@demo.com / Student@123</p>
              <p className="text-blue-400">🔵 Instructor: instructor@demo.com / Inst@123</p>
              <p className="text-purple-400">🟣 Coaching: coaching@demo.com / Coach@123</p>
              <p className="text-red-400">🔴 Admin: sioffice2021@gmail.com / Ikshahid9</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Tab Header */}
            <div className="flex">
              {(['login', 'register'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-4 font-bold text-sm transition ${
                    tab === t
                      ? 'bg-[#1CAB87] text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t === 'login' ? 'লগইন করুন' : 'নিবন্ধন করুন'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ইমেইল</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="আপনার ইমেইল লিখুন"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] focus:ring-1 focus:ring-[#1CAB87] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] focus:ring-1 focus:ring-[#1CAB87] transition"
                    />
                  </div>

                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      ❌ {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-[#1CAB87] text-white font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
                  >
                    {loginLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    অ্যাকাউন্ট নেই?{' '}
                    <button type="button" onClick={() => setTab('register')} className="text-[#1CAB87] font-semibold hover:underline">
                      নিবন্ধন করুন
                    </button>
                  </p>
                </form>
              ) : regSuccess ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-xl font-black text-[#1a1a2e] mb-2">নিবন্ধন সফল হয়েছে!</h2>
                  <p className="text-gray-500 text-sm mb-5">আপনার অ্যাকাউন্ট তৈরি হয়েছে। এখন লগইন করুন।</p>
                  <button
                    onClick={() => { setRegSuccess(false); setTab('login') }}
                    className="bg-[#1CAB87] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#17976d] transition"
                  >
                    লগইন করতে যান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {[
                    { label: 'পূর্ণ নাম', value: regName, setter: setRegName, type: 'text', placeholder: 'আপনার পূর্ণ নাম' },
                    { label: 'ইমেইল', value: regEmail, setter: setRegEmail, type: 'email', placeholder: 'আপনার ইমেইল' },
                    { label: 'ফোন নম্বর', value: regPhone, setter: setRegPhone, type: 'tel', placeholder: '01XXXXXXXXX' },
                    { label: 'পাসওয়ার্ড', value: regPassword, setter: setRegPassword, type: 'password', placeholder: 'কমপক্ষে ৬ অক্ষর' },
                    { label: 'পাসওয়ার্ড নিশ্চিত করুন', value: regConfirm, setter: setRegConfirm, type: 'password', placeholder: 'পাসওয়ার্ড আবার লিখুন' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={e => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] focus:ring-1 focus:ring-[#1CAB87] transition"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">আপনি কে?</label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1CAB87] transition"
                    >
                      <option value="student">শিক্ষার্থী</option>
                      <option value="instructor">শিক্ষক / Instructor</option>
                      <option value="coaching_center">কোচিং সেন্টার</option>
                    </select>
                  </div>

                  {regError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      ❌ {regError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#1CAB87] text-white font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition text-base"
                  >
                    নিবন্ধন করুন
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    অ্যাকাউন্ট আছে?{' '}
                    <button type="button" onClick={() => setTab('login')} className="text-[#1CAB87] font-semibold hover:underline">
                      লগইন করুন
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
