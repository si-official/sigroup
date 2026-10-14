'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { schoolAdminLogin, getSchoolAdmin } from '@/lib/schoolAdminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getSchoolAdmin()) router.replace('/admin/dashboard')
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      schoolAdminLogin(email, password)
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#1CAB87] items-center justify-center mb-4 shadow-xl shadow-[#1CAB87]/30">
            <span className="text-white font-black text-3xl">S</span>
          </div>
          <h1 className="text-2xl font-black text-white">SI School</h1>
          <p className="text-white/50 text-sm mt-1">অ্যাডমিন প্যানেল — সীমাবদ্ধ অ্যাক্সেস</p>
        </div>

        {/* Card */}
        <div className="bg-[#16213e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-white font-bold text-sm">অ্যাডমিন লগইন</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-semibold mb-1.5">ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@sigroup.com.bd"
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#1CAB87] transition placeholder-white/20"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-semibold mb-1.5">পাসওয়ার্ড</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#1CAB87] transition placeholder-white/20"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1CAB87] text-white font-bold py-3.5 rounded-xl hover:bg-[#17976d] transition disabled:opacity-60 text-sm"
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>
          <div className="px-6 pb-5">
            <div className="bg-[#1a1a2e] rounded-xl p-3 border border-white/5">
              <p className="text-white/30 text-xs font-semibold mb-1">ডেমো ক্রেডেনশিয়াল</p>
              <p className="text-white/50 text-xs">sioffice2021@gmail.com / Ikshahid9</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
