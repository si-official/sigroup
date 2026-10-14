'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { shopAdminLogout } from '@/lib/shopAdminAuth'
import {
  LayoutDashboard, BarChart2, Package, Tag, PlusSquare, ShoppingCart,
  Store, Star, DollarSign, CreditCard, Users, Shield, Settings,
  LogOut, ShoppingBag, Moon, Sun, ChevronRight, Palette,
  Navigation, AlignLeft, Home, Handshake, Menu,
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

interface NavGroup {
  section: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    section: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    ],
  },
  {
    section: 'CATALOG',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Tag },
      { label: 'Add Product', href: '/admin/add-product', icon: PlusSquare },
    ],
  },
  {
    section: 'MARKETPLACE',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Vendors', href: '/admin/vendors', icon: Store },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Affiliates', href: '/admin/affiliates', icon: Handshake },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
      { label: 'Payouts', href: '/admin/payouts', icon: CreditCard },
    ],
  },
  {
    section: 'APPEARANCE',
    items: [
      { label: 'Homepage', href: '/admin/homepage', icon: Home },
      { label: 'Navbar', href: '/admin/navbar', icon: Menu },
      { label: 'Header', href: '/admin/header', icon: Navigation },
      { label: 'Footer', href: '/admin/footer', icon: AlignLeft },
      { label: 'Theme & Colors', href: '/admin/appearance', icon: Palette },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Permissions', href: '/admin/permissions', icon: Shield },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

export default function ShopAdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('si_shop_admin_dark')
    if (saved === 'true') setDarkMode(true)
  }, [])

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('si_shop_admin_dark', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  function handleLogout() {
    shopAdminLogout()
    router.push('/admin')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#1d2129] flex flex-col z-50 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#82b541] flex items-center justify-center">
          <ShoppingBag size={20} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-[15px] leading-tight">SI Shop</div>
          <div className="text-[#82b541] text-[11px] font-medium tracking-wide">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.section} className="mb-5">
            <div className="px-3 mb-2 text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
              {group.section}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon
              const normalizedPathname = pathname.replace(/\/$/, '')
              const active = normalizedPathname === item.href || (item.href !== '/admin/dashboard' && normalizedPathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all group ${
                    active
                      ? 'bg-[#82b541] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={12} className="text-white/70" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Visit Shop */}
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ShoppingBag size={16} />
          <span>Visit Shop</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>

        {/* User card */}
        <div className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[#82b541] flex items-center justify-center text-white text-sm font-bold shrink-0">
            S
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">SI Group Admin</div>
            <div className="text-gray-500 text-[11px] truncate">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
