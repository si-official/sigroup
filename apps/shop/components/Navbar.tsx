'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { categories } from '@/lib/data'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import { getSettings, defaultSettings, SiteSettings } from '@/lib/siteSettings'

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All Categories')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cfg, setCfg] = useState<SiteSettings['header']>(defaultSettings.header)
  const [navCfg, setNavCfg] = useState<SiteSettings['navbar']>(defaultSettings.navbar)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const s = getSettings()
    setCfg(s.header)
    setNavCfg(s.navbar)
    const handler = () => {
      const s2 = getSettings()
      setCfg(s2.header)
      setNavCfg(s2.navbar)
    }
    window.addEventListener('si_settings_updated', handler)
    return () => window.removeEventListener('si_settings_updated', handler)
  }, [])

  const avatarBg: Record<string, string> = {
    super_admin: 'bg-red-600',
    admin:       'bg-purple-600',
    vendor:      'bg-blue-600',
    customer:    'bg-green-600',
  }

  const accountHref = user
    ? (user.role === 'super_admin' || user.role === 'admin')
      ? '/admin'
      : user.role === 'vendor'
        ? '/seller/dashboard'
        : '/customer/dashboard'
    : '/customer/login'

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement Bar */}
      {cfg.announcementBar && (
        <div className="px-4 py-2 text-white text-xs text-center font-medium" style={{ backgroundColor: cfg.announcementBg }}>
          {cfg.announcementText}
        </div>
      )}
      {/* Main nav bar */}
      <nav className="text-white" style={{ backgroundColor: cfg.bgColor }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow">
              <span className="text-white font-black text-sm leading-none">SI</span>
            </div>
            <div className="hidden sm:block leading-none">
              <p className="font-black text-white text-base tracking-tight">{cfg.logoText}</p>
              <p className="text-[9px] text-gray-400 tracking-wide">{cfg.logoTagline}</p>
            </div>
          </Link>

          {/* Quick nav pills — controlled from admin */}
          <div className="flex-1 hidden md:flex items-center gap-2">
            {navCfg.pillButtons.filter(b => b.show).map(btn => (
              <Link
                key={btn.id}
                href={btn.href}
                className={`flex items-center gap-1 ${btn.color} hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap border border-white/15`}
              >
                {btn.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {cfg.showSellButton && (
              <Link
                href="/seller/register"
                className="hidden sm:inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2 rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: cfg.accentColor }}
              >
                {cfg.sellButtonText}
              </Link>
            )}

            {/* Auth section */}
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#2d333f] transition">
                  <div className={`w-8 h-8 ${avatarBg[user.role] || 'bg-gray-600'} rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left leading-none">
                    <p className="text-white text-xs font-bold truncate max-w-[90px]">{user.name}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </p>
                  </div>
                  <svg className={`w-3 h-3 text-gray-400 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-[#1d2129] to-[#2d333f] flex items-center gap-3">
                      <div className={`w-9 h-9 ${avatarBg[user.role] || 'bg-gray-600'} rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                        {user.avatar || user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate">{user.name}</p>
                        <p className="text-white/50 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link href={accountHref} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#82b541]/10 hover:text-[#82b541] transition">
                        <span className="text-base">📊</span>
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <Link href="/cart" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#82b541]/10 hover:text-[#82b541] transition">
                        <span className="text-base">🛒</span>
                        <span className="font-medium">Cart</span>
                      </Link>
                      <Link href="/customer/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#82b541]/10 hover:text-[#82b541] transition">
                        <span className="text-base">❤️</span>
                        <span className="font-medium">Wishlist</span>
                      </Link>
                      <Link href="/customer/downloads" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#82b541]/10 hover:text-[#82b541] transition">
                        <span className="text-base">⬇️</span>
                        <span className="font-medium">Downloads</span>
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <span className="text-base">🚪</span>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/customer/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#2d333f] transition"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#2d333f] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#82b541] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
              <span className="hidden sm:inline text-sm">Cart</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg hover:bg-[#2d333f] transition"
              aria-label="Menu"
            >
              <div className="w-5 space-y-1.5">
                <span className={`block h-0.5 bg-gray-300 rounded transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-gray-300 rounded transition-all ${open ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-gray-300 rounded transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>



      {/* Category strip */}
      {navCfg.showCategoryStrip && <div className="bg-[#2d333f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {[
              { label: 'All Items', href: '/' },
              ...categories.map(c => ({ label: c.label, href: `/category/${c.id}` })),
              { label: 'Free Items', href: '/search?price=free' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-[#3d4451] text-xs font-medium px-4 py-2.5 transition whitespace-nowrap border-b-2 border-transparent hover:border-[#82b541]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>}

      {/* Scroll-triggered search bar */}
      {navCfg.showScrollSearch && <div className={`bg-[#1d2129] overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-14 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <select
              value={cat}
              onChange={e => setCat(e.target.value)}
              className="bg-[#2d333f] border-r border-white/10 text-gray-300 text-xs px-3 py-2 focus:outline-none cursor-pointer flex-shrink-0 w-32"
            >
              <option>All Categories</option>
              {categories.map(c => <option key={c.id}>{c.label}</option>)}
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && search.trim()) window.location.href = `/search?q=${encodeURIComponent(search)}` }}
              placeholder="Search items, authors, categories..."
              className="flex-1 bg-white text-gray-900 px-4 py-2 text-sm focus:outline-none placeholder:text-gray-400"
            />
            <button
              onClick={() => search.trim() && (window.location.href = `/search?q=${encodeURIComponent(search)}`)}
              className="bg-[#82b541] hover:bg-[#6fa033] text-white px-5 py-2 font-bold text-sm transition flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>}

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1d2129] border-t border-[#3d4451] px-4 py-3 space-y-2 shadow-2xl">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-[#2d333f] border border-[#3d4451] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none placeholder:text-gray-500"
            />
            <button
              onClick={() => search.trim() && (window.location.href = `/search?q=${encodeURIComponent(search)}`)}
              className="bg-[#82b541] text-white px-4 py-2.5 rounded-lg text-sm font-bold"
            >
              Go
            </button>
          </div>
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 bg-[#2d333f] rounded-lg mb-1">
                <div className={`w-8 h-8 ${avatarBg[user.role] || 'bg-gray-600'} rounded-lg flex items-center justify-center text-white font-black text-sm`}>
                  {user.avatar || user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{user.name}</p>
                  <p className="text-gray-400 text-xs">{ROLE_LABELS[user.role]}</p>
                </div>
              </div>
              <Link href={accountHref} onClick={() => setOpen(false)} className="flex items-center py-2.5 px-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#2d333f] hover:text-white transition">My Account</Link>
              {(user.role === 'vendor' || user.role === 'super_admin') && (
                <Link href="/seller/dashboard" onClick={() => setOpen(false)} className="flex items-center py-2.5 px-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#2d333f] hover:text-white transition">Seller Dashboard</Link>
              )}
              <button onClick={handleLogout} className="flex items-center w-full py-2.5 px-3 rounded-lg text-sm font-medium text-red-400 hover:bg-[#2d333f] transition">Sign Out</button>
            </>
          ) : (
            <>
              {[
                { label: 'Browse Products', href: '/' },
                { label: 'Start Selling', href: '/seller/register' },
                { label: 'Seller Dashboard', href: '/seller/dashboard' },
                { label: 'My Orders', href: '/customer/dashboard' },
                { label: 'Sign In', href: '/customer/login' },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center py-2.5 px-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#2d333f] hover:text-white transition"
                >
                  {l.label}
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </header>
  )
}
