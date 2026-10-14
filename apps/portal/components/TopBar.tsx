'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'

interface TopBarProps {
  title: string
  breadcrumb?: { label: string; href?: string }[]
}

export default function TopBar({ title, breadcrumb }: TopBarProps) {
  const { toggleDarkMode, darkMode, currentAdmin, logout } = useAdmin()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const router = useRouter()

  const notifications = [
    { id: 1, msg: 'New order #1042 received', time: '2m ago', icon: '🛍️' },
    { id: 2, msg: 'Rahim enrolled in Web Dev', time: '15m ago', icon: '🎓' },
    { id: 3, msg: 'Support ticket #88 opened', time: '2h ago', icon: '🎫' },
  ]

  const initials = currentAdmin?.name
    ? currentAdmin.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'SA'

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0 relative z-30">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin" className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition">
          Admin
        </Link>
        {breadcrumb?.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            {b.href ? (
              <Link href={b.href} className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition">
                {b.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-semibold">{b.label}</span>
            )}
          </span>
        ))}
        {!breadcrumb && <span className="flex items-center gap-2"><span className="text-gray-400">/</span><span className="text-gray-900 dark:text-white font-semibold">{title}</span></span>}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition relative"
          >
            🔔
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {notifications.length}
            </span>
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications</p>
                <button className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Mark all read</button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-xl">{n.icon}</span>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{n.msg}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false) }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {initials}
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hidden sm:block">
              {currentAdmin?.name || 'Admin'}
            </span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              <Link
                href="/admin/profile"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                👤 Profile
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                ⚙️ Settings
              </Link>
              <div className="border-t border-gray-100 dark:border-gray-800" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfile || showNotif) && (
        <div className="fixed inset-0 z-20" onClick={() => { setShowProfile(false); setShowNotif(false) }} />
      )}
    </header>
  )
}
