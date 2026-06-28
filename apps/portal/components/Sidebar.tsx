'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

const clientNav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/invoices', icon: '🧾', label: 'Invoices' },
  { href: '/tickets', icon: '🎫', label: 'Support' },
]
const partnerNav = [
  { href: '/partner', icon: '🤝', label: 'Partner Hub' },
]
const adminNav = [
  { href: '/admin', icon: '⚙️', label: 'Admin Panel' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const path = usePathname()

  const navItems = [
    ...clientNav,
    ...(user?.role === 'partner' || user?.role === 'admin' ? partnerNav : []),
    ...(user?.role === 'admin' ? adminNav : []),
  ]

  return (
    <aside className="w-64 bg-gray-950 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <Link href="https://sigroup.com.bd" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">SI</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">SI Portal</p>
            <p className="text-gray-500 text-xs">portal.sigroup.com.bd</p>
          </div>
        </Link>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold">
              {user.name[0]}
            </div>
            <div>
              <p className="text-white text-sm font-semibold truncate max-w-[140px]">{user.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                user.role === 'admin' ? 'bg-red-900 text-red-300' :
                user.role === 'partner' ? 'bg-yellow-900 text-yellow-300' :
                'bg-purple-900 text-purple-300'
              }`}>{user.role}</span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
              path === item.href
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-red-400 transition text-sm">
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
