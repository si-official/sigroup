'use client'
import Link from 'next/link'
import { SchoolAdmin } from '@/lib/schoolAdminAuth'

interface Props {
  breadcrumb: string
  admin: SchoolAdmin
}

export default function SchoolAdminTopBar({ breadcrumb, admin }: Props) {
  return (
    <header className="h-14 bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-white/10 flex items-center px-6 gap-4 shrink-0 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex-1">
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 dark:text-white/40">SI School</span>
          <span className="text-gray-300 dark:text-white/20">/</span>
          <span className="text-gray-700 dark:text-white font-semibold">{breadcrumb}</span>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Visit School */}
        <Link href="/" target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-white/50 hover:text-[#1CAB87] transition px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <span>⬡</span> স্কুল দেখুন
        </Link>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/8 transition">
          <span className="text-base">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B35] rounded-full border border-white dark:border-[#161b22]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1CAB87] flex items-center justify-center font-bold text-white text-sm">
            {admin.name[0]}
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-white">{admin.name}</span>
        </div>
      </div>
    </header>
  )
}
