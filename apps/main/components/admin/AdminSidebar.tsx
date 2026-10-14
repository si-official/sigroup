'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { adminLogout, getAdminUser } from '@/lib/adminAuth'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { label: 'Portfolio', href: '/admin/portfolio', icon: '🖼️' },
      { label: 'Services', href: '/admin/services', icon: '⚙️' },
      { label: 'Testimonials', href: '/admin/testimonials', icon: '💬' },
      { label: 'About', href: '/admin/about', icon: '🏢' },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { label: 'Dev Packages', href: '/admin/packages', icon: '📦' },
      { label: 'Partnership', href: '/admin/partnership', icon: '🤝' },
      { label: 'Contact & Messages', href: '/admin/contact', icon: '✉️' },
    ],
  },
  {
    title: 'SITE',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: '🔧' },
      { label: 'SEO', href: '/admin/seo', icon: '🔍' },
    ],
  },
]

interface Props {
  darkMode: boolean
  toggleDark: () => void
}

export default function AdminSidebar({ darkMode, toggleDark }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const user = getAdminUser()

  function handleLogout() {
    adminLogout()
    router.push('/admin')
  }

  return (
    <aside className={`fixed top-0 left-0 h-screen w-[260px] flex flex-col z-40 border-r ${
      darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      {/* Logo / User card */}
      <div className={`p-5 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div>
            <p className={`font-semibold text-sm leading-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {user?.name ?? 'Admin'}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.role === 'super_admin' ? 'Super Admin' : 'Editor'}
            </p>
          </div>
        </div>
        <div className="text-purple-500 font-bold text-lg tracking-tight">SI Group</div>
        <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Site Admin</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map(group => (
          <div key={group.title} className="mb-5">
            <p className={`text-[10px] font-semibold tracking-widest px-2 mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {group.title}
            </p>
            {group.items.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                    active
                      ? 'bg-purple-600 text-white'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className={`p-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex flex-col gap-2`}>
        <button
          onClick={toggleDark}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
            darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left text-red-500 ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-red-50'
          }`}
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
