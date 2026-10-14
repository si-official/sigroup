'use client'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

const statCards = [
  { label: 'Total Revenue', value: '৳18,50,000', change: '+22%', icon: '💰', color: 'emerald' },
  { label: 'Total Users', value: '248', change: '+12', icon: '👥', color: 'purple' },
  { label: 'Active Projects', value: '34', change: '+5', icon: '🚀', color: 'blue' },
  { label: 'Open Tickets', value: '7', change: '-3', icon: '🎫', color: 'orange' },
  { label: 'Shop Orders', value: '156', change: '+24', icon: '🛍️', color: 'pink' },
  { label: 'School Enrollments', value: '320', change: '+61', icon: '🎓', color: 'teal' },
]

const businessPanels = [
  { href: '/admin/platforms', icon: '🏢', label: 'Business Platforms', desc: 'Manage all SI Group platform listings, links & visibility', color: 'from-blue-600 to-indigo-700', count: '5 platforms' },
  { href: '/admin/shop', icon: '🛍️', label: 'SI Shop / SI Mart', desc: 'Products, orders, inventory, categories', color: 'from-orange-500 to-pink-600', count: '156 orders' },
  { href: '/admin/software', icon: '💾', label: 'Software Market', desc: 'Software listings, licences, downloads', color: 'from-blue-500 to-indigo-600', count: '43 sales' },
  { href: '/admin/school', icon: '🎓', label: 'SI School', desc: 'Courses, students, lessons, certificates', color: 'from-indigo-500 to-violet-600', count: '320 students' },
  { href: '/admin/devservices', icon: '⚙️', label: 'Dev Services', desc: 'Service packages, enquiries, projects', color: 'from-gray-700 to-gray-900', count: '19 enquiries' },
]

const recentActivity = [
  { type: 'order', msg: 'New order #1042 — Wireless Keyboard — ৳4,299', time: '2m ago', icon: '🛍️' },
  { type: 'enroll', msg: 'Rahim Uddin enrolled in Full-Stack Web Dev Course', time: '15m ago', icon: '🎓' },
  { type: 'software', msg: 'ISP Billing Suite Pro sold to Delta ISP Ltd', time: '1h ago', icon: '💾' },
  { type: 'ticket', msg: 'New support ticket #88 — Payment issue', time: '2h ago', icon: '🎫' },
  { type: 'dev', msg: 'New dev enquiry — Mobile App project — ৳65,000 budget', time: '3h ago', icon: '⚙️' },
  { type: 'user', msg: 'New user registered — Sara Islam (partner)', time: '4h ago', icon: '👥' },
]

const barData = [
  { month: 'Feb', val: 65 },
  { month: 'Mar', val: 80 },
  { month: 'Apr', val: 72 },
  { month: 'May', val: 91 },
  { month: 'Jun', val: 88 },
  { month: 'Jul', val: 100 },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-900/40 border-emerald-800 text-emerald-400',
  purple: 'bg-purple-900/40 border-purple-800 text-purple-400',
  blue: 'bg-blue-900/40 border-blue-800 text-blue-400',
  orange: 'bg-orange-900/40 border-orange-800 text-orange-400',
  pink: 'bg-pink-900/40 border-pink-800 text-pink-400',
  teal: 'bg-teal-900/40 border-teal-800 text-teal-400',
}

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">SI Group — Full control panel</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-red-900/60 border border-red-700 text-red-300 text-xs px-3 py-1.5 rounded-full font-bold">🔴 Super Admin</span>
          <Link href="https://sigroup.com.bd" target="_blank" className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-xl transition">
            View Site ↗
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-white dark:bg-gray-900 border rounded-xl p-4 ${colorMap[s.color].split(' ').slice(2).join(' ')}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.change.startsWith('+') ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
                {s.change}
              </span>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">Revenue — Last 6 Months</h3>
          <div className="flex items-end gap-3 h-40">
            {barData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-purple-600 rounded-t-lg transition-all duration-500 hover:bg-purple-500"
                  style={{ height: `${d.val}%` }}
                />
                <span className="text-gray-500 dark:text-gray-400 text-xs">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 bg-purple-600 rounded"></span>
            Revenue (৳ lakhs)
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-gray-900 dark:text-white font-bold">Recent Activity</h3>
            <span className="text-gray-500 text-xs">Live</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-56 overflow-y-auto">
            {recentActivity.map((a, i) => (
              <div key={i} className="p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <span className="text-lg flex-shrink-0">{a.icon}</span>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{a.msg}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business panels */}
      <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">Business Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {businessPanels.map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 rounded-xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {b.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white font-bold text-sm">{b.label}</p>
              <p className="text-gray-500 text-xs mt-0.5 truncate">{b.desc}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-gray-600 dark:text-gray-300 text-xs font-bold">{b.count}</p>
              <p className="text-gray-400 text-xs mt-0.5">Manage →</p>
            </div>
          </Link>
        ))}

        {/* Quick links */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-3">Quick Links</h3>
          <div className="space-y-2">
            {[
              { icon: '👥', label: 'Employees', href: '/admin/employees' },
              { icon: '💳', label: 'Payment Methods', href: '/admin/payment' },
              { icon: '📱', label: 'SMS Gateway', href: '/admin/sms' },
              { icon: '📊', label: 'Analytics', href: '/admin/analytics' },
            ].map((q) => (
              <Link key={q.label} href={q.href} className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition text-xs">
                <span>{q.icon}</span>{q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
