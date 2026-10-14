'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin, getAdminUser } from '@/lib/adminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const user = getAdminUser()
    if (user) {
      router.replace('/admin/dashboard')
    } else {
      setChecking(false)
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      adminLogin(email, password)
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-purple-500 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-4">
            <span className="text-2xl font-bold text-white">SI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">SI Group</h1>
          <p className="text-gray-400 text-sm mt-1">Site Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-100 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs font-medium text-gray-500 mb-3">DEMO CREDENTIALS</p>
            <div className="space-y-2">
              <button
                onClick={() => { setEmail('sioffice2021@gmail.com'); setPassword('Ikshahid9') }}
                className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg px-3 py-2.5 text-xs transition-colors"
              >
                <span className="text-purple-400 font-medium">Super Admin</span>
                <br />
                <span className="text-gray-400">sioffice2021@gmail.com / Ikshahid9</span>
              </button>
              <button
                onClick={() => { setEmail('editor@demo.com'); setPassword('Editor@123') }}
                className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg px-3 py-2.5 text-xs transition-colors"
              >
                <span className="text-green-400 font-medium">Demo Editor</span>
                <br />
                <span className="text-gray-400">editor@demo.com / Editor@123</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">Click a credential to auto-fill</p>
          </div>
        </div>
      </div>
    </div>
  )
}
