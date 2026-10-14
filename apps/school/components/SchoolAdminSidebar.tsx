'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { schoolAdminLogout, SchoolAdmin } from '@/lib/schoolAdminAuth'

interface NavItem { label: string; href: string; icon: string; badge?: number }
interface NavGroup { group: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    group: 'OVERVIEW',
    items: [
      { label: 'ড্যাশবোর্ড', href: '/admin/dashboard', icon: '◈' },
      { label: 'বিশ্লেষণ', href: '/admin/analytics', icon: '◉' },
    ],
  },
  {
    group: 'COURSE',
    items: [
      { label: 'কোর্স অনুমোদন', href: '/admin/approval', icon: '✦' },
      { label: 'সকল কোর্স', href: '/admin/courses', icon: '▤' },
      { label: 'ক্যাটাগরি', href: '/admin/categories', icon: '◧' },
    ],
  },
  {
    group: 'PEOPLE',
    items: [
      { label: 'শিক্ষার্থী', href: '/admin/students', icon: '◯' },
      { label: 'শিক্ষক', href: '/admin/instructors', icon: '◑' },
      { label: 'কোচিং সেন্টার', href: '/admin/coaching', icon: '⬡' },
    ],
  },
  {
    group: 'FINANCE',
    items: [
      { label: 'উত্তোলন অনুরোধ', href: '/admin/withdrawals', icon: '◈' },
      { label: 'কমিশন', href: '/admin/commission', icon: '◎' },
      { label: 'লেনদেন', href: '/admin/transactions', icon: '▣' },
    ],
  },
  {
    group: 'SYSTEM',
    items: [
      { label: 'সিস্টেম সেটিং', href: '/admin/settings', icon: '⚙' },
      { label: 'লগ', href: '/admin/logs', icon: '▤' },
    ],
  },
]

interface Props {
  darkMode: boolean
  setDarkMode: (v: boolean) => void
  admin: SchoolAdmin
}

export default function SchoolAdminSidebar({ darkMode, setDarkMode, admin }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    schoolAdminLogout()
    router.push('/admin')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-[260px] shrink-0 bg-[#1a1a2e] flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1CAB87] flex items-center justify-center font-black text-white text-lg">S</div>
          <div>
            <p className="text-white font-black text-sm leading-tight">SI School</p>
            <p className="text-[#1CAB87] text-xs font-semibold">অ্যাডমিন প্যানেল</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {navGroups.map(group => (
          <div key={group.group}>
            <p className="text-white/30 text-[10px] font-bold tracking-widest px-3 mb-2">{group.group}</p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive(item.href)
                      ? 'bg-[#1CAB87] text-white shadow-md shadow-[#1CAB87]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/8 text-sm font-semibold transition"
        >
          <span className="text-base w-5 text-center">{darkMode ? '☀' : '☾'}</span>
          <span>{darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}</span>
        </button>

        {/* User card */}
        <div className="bg-white/8 rounded-xl px-3 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1CAB87] flex items-center justify-center font-bold text-white text-sm shrink-0">
            {admin.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{admin.name}</p>
            <p className="text-white/40 text-[10px] truncate">{admin.email}</p>
          </div>
          <button onClick={handleLogout} title="লগআউট" className="text-white/40 hover:text-red-400 transition text-sm">⏻</button>
        </div>
      </div>
    </aside>
  )
}
