'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/admin', icon: '📊', label: 'Dashboard' },
      { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { href: '/admin/platforms', icon: '🏢', label: 'Platforms' },
      { href: '/admin/shop', icon: '🛍️', label: 'SI Shop' },
      { href: '/admin/software', icon: '💾', label: 'Software' },
      { href: '/admin/school', icon: '🎓', label: 'SI School' },
      { href: '/admin/devservices', icon: '⚙️', label: 'Dev Services' },
    ],
  },
  {
    label: 'ORGANIZATION',
    items: [
      { href: '/admin/employees', icon: '👥', label: 'Employees' },
      { href: '/admin/departments', icon: '🏗️', label: 'Departments' },
      { href: '/admin/permissions', icon: '🔐', label: 'Permissions' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { href: '/admin/accounts', icon: '💰', label: 'Accounts' },
      { href: '/admin/invoices', icon: '🧾', label: 'Invoices' },
      { href: '/admin/payment', icon: '💳', label: 'Payment Methods' },
    ],
  },
  {
    label: 'INTEGRATIONS',
    items: [
      { href: '/admin/sms', icon: '📱', label: 'SMS Gateway' },
      { href: '/admin/email', icon: '📧', label: 'Email Config' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
      { href: '/admin/logs', icon: '📋', label: 'Logs' },
    ],
  },
]

export default function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar, toggleDarkMode, darkMode, currentAdmin, logout } = useAdmin()
  const path = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const initials = currentAdmin?.name
    ? currentAdmin.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'SA'

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col bg-gray-950 dark:bg-gray-950 border-r border-gray-800 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-[280px]'
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">SI</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">SI Admin</p>
              <p className="text-gray-500 text-xs truncate">Super Admin Panel</p>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-white transition p-1 rounded-lg hover:bg-gray-800 flex-shrink-0"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* User card */}
      {currentAdmin && (
        <div className={`px-3 py-3 border-b border-gray-800 flex-shrink-0 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? '' : ''}`}>
            <div className="w-9 h-9 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{currentAdmin.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-900/60 text-red-300 border border-red-800">
                  {currentAdmin.role.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {!sidebarCollapsed && (
              <p className="text-gray-600 text-[10px] uppercase tracking-widest font-bold px-3 pt-3 pb-1">
                {group.label}
              </p>
            )}
            {sidebarCollapsed && <div className="border-t border-gray-800/50 my-2" />}
            {group.items.map((item) => {
              const isActive = path === item.href || (item.href !== '/admin' && path.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium mb-0.5 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-800 p-2 flex-shrink-0 space-y-1">
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <Link
          href="/admin/profile"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title={sidebarCollapsed ? 'Profile' : undefined}
        >
          <span>👤</span>
          {!sidebarCollapsed && <span>Profile</span>}
        </Link>
        <button
          onClick={handleLogout}
          title={sidebarCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-red-400 transition text-sm ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <span>🚪</span>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
