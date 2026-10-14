'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/lib/adminAuth'
import { useAdmin } from '@/context/AdminContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setCurrentAdmin, currentAdmin, authLoading } = useAdmin()

  useEffect(() => {
    if (!authLoading && currentAdmin) {
      router.push('/admin')
    }
  }, [authLoading, currentAdmin, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = loginAdmin(email.trim(), password)
      setCurrentAdmin(user)
      router.push('/admin')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail('sioffice2021@gmail.com')
    setPassword('Ikshahid9')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/40">
            <span className="text-white font-black text-2xl">SI</span>
          </div>
          <h1 className="text-3xl font-black text-white">SI Group Admin</h1>
          <p className="text-gray-500 mt-1 text-sm">Super Admin Panel — Authorized Access Only</p>
        </div>

        {/* Login card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sigroup.com.bd"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/30"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-800/60 border border-gray-700 rounded-xl">
            <p className="text-gray-500 text-xs font-medium mb-2">DEMO CREDENTIALS</p>
            <div className="space-y-1 text-xs">
              <p className="text-gray-400">
                <span className="text-gray-500">Email:</span>{' '}
                <span className="text-purple-400 font-mono">sioffice2021@gmail.com</span>
              </p>
              <p className="text-gray-400">
                <span className="text-gray-500">Password:</span>{' '}
                <span className="text-purple-400 font-mono">Ikshahid9</span>
              </p>
            </div>
            <button
              onClick={fillDemo}
              className="mt-3 w-full text-xs bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800 py-2 rounded-lg transition"
            >
              Use Demo Credentials
            </button>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          SI Group © 2026 — Restricted Access
        </p>
      </div>
    </div>
  )
}
