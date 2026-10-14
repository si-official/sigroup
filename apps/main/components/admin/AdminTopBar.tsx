'use client'

import { usePathname } from 'next/navigation'
import { getAdminUser } from '@/lib/adminAuth'

const breadcrumbMap: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/portfolio': 'Portfolio',
  '/admin/services': 'Services',
  '/admin/testimonials': 'Testimonials',
  '/admin/about': 'About',
  '/admin/packages': 'Dev Packages',
  '/admin/partnership': 'Partnership',
  '/admin/contact': 'Contact & Messages',
  '/admin/settings': 'Settings',
  '/admin/seo': 'SEO',
}

interface Props {
  darkMode: boolean
  toggleDark: () => void
}

export default function AdminTopBar({ darkMode, toggleDark }: Props) {
  const pathname = usePathname()
  const user = getAdminUser()
  const page = breadcrumbMap[pathname] ?? 'Admin'

  return (
    <header className={`fixed top-0 left-[260px] right-0 h-14 flex items-center justify-between px-6 z-30 border-b ${
      darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Admin</span>
        <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>/</span>
        <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{page}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            darkMode
              ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          🌐 Visit Site
        </a>
        <button
          onClick={toggleDark}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div className={`flex items-center gap-2 pl-3 border-l ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <span className={`text-sm font-medium hidden sm:block ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  )
}
