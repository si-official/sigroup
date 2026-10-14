'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { shopAdminLogin, getShopAdmin } from '@/lib/shopAdminAuth'
import { ShoppingBag, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const admin = getShopAdmin()
    if (admin) {
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
      shopAdminLogin(email, password)
      router.push('/admin/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#1d2129] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#82b541] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1d2129] flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, #82b541 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#82b541] mb-4 shadow-lg shadow-[#82b541]/30">
            <ShoppingBag size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SI Shop</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Panel Login</p>
        </div>

        {/* Card */}
        <div className="bg-[#252b35] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full bg-[#1d2129] border border-white/10 text-white placeholder-gray-600 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541] focus:ring-1 focus:ring-[#82b541]/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#1d2129] border border-white/10 text-white placeholder-gray-600 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#82b541] focus:ring-1 focus:ring-[#82b541]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#82b541] hover:bg-[#6ea032] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[#82b541]/10 border border-[#82b541]/20 rounded-lg">
            <p className="text-[#82b541] text-xs font-semibold mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-gray-300 font-mono">sioffice2021@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="text-gray-300 font-mono">Ikshahid9</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setEmail('sioffice2021@gmail.com'); setPassword('Ikshahid9') }}
              className="mt-2 text-xs text-[#82b541] hover:text-[#6ea032] underline underline-offset-2"
            >
              Fill credentials
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          SI Shop Admin Panel · SI Group © 2025
        </p>
      </div>
    </div>
  )
}
