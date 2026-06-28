'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

export default function LoginPage() {
  const { login, isLoggedIn, loading, user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isLoggedIn) {
      const dest = user?.role === 'admin' ? '/admin'
        : user?.role === 'partner' ? '/partner'
        : '/dashboard'
      router.push(dest)
    }
  }, [isLoggedIn, loading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const u = await login(form.email, form.password)
      const dest = u.role === 'admin' ? '/admin' : u.role === 'partner' ? '/partner' : '/dashboard'
      router.push(dest)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="text-purple-400 text-lg">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">SI</span>
          </div>
          <h1 className="text-3xl font-black text-white">SI Portal</h1>
          <p className="text-gray-400 mt-1">Client & Partner Access</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-xl p-4 mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" />
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-purple-400 hover:text-purple-300 text-sm">Forgot password?</a>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-500 transition disabled:opacity-50 text-lg">
              {submitting ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">Not a client yet?</p>
            <a href="https://sigroup.com.bd/#partnership" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
              Become a Partner →
            </a>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Powered by <a href="https://sigroup.com.bd" className="text-gray-400 hover:text-white">SI Group</a>
        </p>
      </div>
    </div>
  )
}
