'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, Search, ShoppingBag, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const PAGE_TITLES: Record<string, { title: string; breadcrumb: string[] }> = {
  '/admin/dashboard':   { title: 'Dashboard',       breadcrumb: ['Admin', 'Dashboard'] },
  '/admin/analytics':   { title: 'Analytics',        breadcrumb: ['Admin', 'Analytics'] },
  '/admin/products':    { title: 'Products',          breadcrumb: ['Catalog', 'Products'] },
  '/admin/categories':  { title: 'Categories',        breadcrumb: ['Catalog', 'Categories'] },
  '/admin/add-product': { title: 'Add Product',       breadcrumb: ['Catalog', 'Add Product'] },
  '/admin/orders':      { title: 'Orders',            breadcrumb: ['Marketplace', 'Orders'] },
  '/admin/vendors':     { title: 'Vendors',           breadcrumb: ['Marketplace', 'Vendors'] },
  '/admin/reviews':     { title: 'Reviews',           breadcrumb: ['Marketplace', 'Reviews'] },
  '/admin/revenue':     { title: 'Revenue',           breadcrumb: ['Finance', 'Revenue'] },
  '/admin/payouts':     { title: 'Payouts',           breadcrumb: ['Finance', 'Payouts'] },
  '/admin/users':       { title: 'Users',             breadcrumb: ['System', 'Users'] },
  '/admin/permissions': { title: 'Permissions',       breadcrumb: ['System', 'Permissions'] },
  '/admin/settings':    { title: 'Settings',          breadcrumb: ['System', 'Settings'] },
}

export default function ShopAdminTopBar() {
  const pathname = usePathname()
  const normalizedPath = pathname.replace(/\/$/, '')
  const meta = PAGE_TITLES[normalizedPath] ?? { title: 'Admin', breadcrumb: ['Admin'] }
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 gap-4">
      {/* Breadcrumb + title */}
      <div>
        <h1 className="text-gray-900 font-semibold text-lg leading-tight">{meta.title}</h1>
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          {meta.breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={10} />}
              <span className={i === meta.breadcrumb.length - 1 ? 'text-[#82b541] font-medium' : ''}>{crumb}</span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={15} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#82b541]/30 focus:border-[#82b541] w-48"
          />
        </div>

        {/* Visit Shop */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag size={14} />
          Visit Shop
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800">Notifications</span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">3 new</span>
              </div>
              {[
                { text: 'New product pending approval', time: '2m ago', color: 'bg-blue-500' },
                { text: 'Payout request from TechBD Solutions', time: '1h ago', color: 'bg-yellow-500' },
                { text: 'New vendor registration', time: '3h ago', color: 'bg-green-500' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.color}`}></span>
                  <div>
                    <p className="text-sm text-gray-700">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#82b541] flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          S
        </div>
      </div>
    </header>
  )
}
