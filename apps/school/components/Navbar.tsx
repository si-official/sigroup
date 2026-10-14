'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { categories } from '@/lib/data'

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-500',
  admin: 'bg-red-500',
  instructor: 'bg-blue-500',
  coaching_center: 'bg-purple-500',
  student: 'bg-green-500',
}

function getDashboardLink(role?: string) {
  if (role === 'super_admin' || role === 'admin') return '/admin'
  if (role === 'instructor') return '/instructor/dashboard'
  if (role === 'coaching_center') return '/coaching/dashboard'
  return '/student/dashboard'
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Main Nav */}
      <div style={{ backgroundColor: '#1a1a2e' }} className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#1CAB87] flex items-center justify-center">
              <span className="text-white font-black text-sm">SI</span>
            </div>
            <span className="font-black text-white text-xl">School</span>
          </Link>

          {/* Search — desktop */}
          <div className="flex-1 hidden md:flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="কোর্স খুঁজুন..."
              className="bg-transparent flex-1 text-sm outline-none text-white placeholder-white/50"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <Link
              href="/instructor/register"
              className="hidden md:block text-sm font-semibold text-[#1CAB87] border border-[#1CAB87] px-4 py-1.5 rounded-full hover:bg-[#1CAB87] hover:text-white transition"
            >
              শিক্ষক হন
            </Link>

            {/* Cart */}
            <Link href="/student/cart" className="relative hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1CAB87] text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
            </Link>

            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 hover:bg-white/20 transition">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${roleColors[user.role] || 'bg-gray-500'}`}>
                    <span className="text-white text-xs font-bold">{user.avatar || user.name[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-white hidden md:block">{user.name.split(' ')[0]}</span>
                  <svg className={`w-3 h-3 text-white/70 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${roleColors[user.role] || 'bg-gray-500'}`}>
                        <span className="text-white text-sm font-bold">{user.avatar || user.name[0]}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate">{user.name}</p>
                        <p className="text-white/50 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link href={getDashboardLink(user.role)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1CAB87]/10 hover:text-[#1CAB87] transition group">
                        <span className="text-base">📊</span>
                        <span className="font-medium">ড্যাশবোর্ড</span>
                      </Link>
                      <Link href="/student/cart" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1CAB87]/10 hover:text-[#1CAB87] transition">
                        <span className="text-base">🛒</span>
                        <span className="font-medium">কার্ট</span>
                      </Link>
                      <Link href="/student/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1CAB87]/10 hover:text-[#1CAB87] transition">
                        <span className="text-base">❤️</span>
                        <span className="font-medium">উইশলিস্ট</span>
                      </Link>
                      <Link href="/student/downloads" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1CAB87]/10 hover:text-[#1CAB87] transition">
                        <span className="text-base">⬇️</span>
                        <span className="font-medium">ডাউনলোড</span>
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setDropdownOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <span className="text-base">🚪</span>
                          <span className="font-medium">লগআউট</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/student/login"
                className="bg-[#1CAB87] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#17976d] transition"
              >
                লগইন
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden flex flex-col gap-1 p-1">
              <span className="w-5 h-0.5 bg-white block"></span>
              <span className="w-5 h-0.5 bg-white block"></span>
              <span className="w-5 h-0.5 bg-white block"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div style={{ backgroundColor: '#16213e' }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/courses?category=${cat.id}`}
              className="shrink-0 px-4 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition whitespace-nowrap font-medium"
            >
              {cat.icon} {cat.bangla || cat.bangla}
            </Link>
          ))}
          <Link
            href="/courses"
            className="shrink-0 px-4 py-1.5 text-sm text-[#1CAB87] hover:text-white hover:bg-[#1CAB87] rounded-full transition whitespace-nowrap font-semibold"
          >
            সকল কোর্স →
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: '#1a1a2e' }} className="md:hidden border-t border-white/10 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="কোর্স খুঁজুন..."
              className="bg-transparent flex-1 text-sm outline-none text-white placeholder-white/50"
            />
          </div>
          <Link href="/instructor/register" className="block text-sm font-semibold text-[#1CAB87] py-2" onClick={() => setMobileOpen(false)}>
            শিক্ষক হন
          </Link>
          {!user && (
            <Link href="/student/login" className="block bg-[#1CAB87] text-white text-center py-2 rounded-full text-sm font-semibold" onClick={() => setMobileOpen(false)}>
              লগইন
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
