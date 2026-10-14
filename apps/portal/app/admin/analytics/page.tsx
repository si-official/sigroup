'use client'
import AdminLayout from '@/components/AdminLayout'

const monthlyRevenue = [
  { month: 'Feb', shop: 42000, school: 28000, software: 15000, dev: 30000 },
  { month: 'Mar', shop: 55000, school: 32000, software: 18000, dev: 45000 },
  { month: 'Apr', shop: 48000, school: 35000, software: 12000, dev: 55000 },
  { month: 'May', shop: 67000, school: 41000, software: 22000, dev: 65000 },
  { month: 'Jun', shop: 61000, school: 38000, software: 25000, dev: 70000 },
  { month: 'Jul', shop: 75000, school: 45000, software: 28000, dev: 80000 },
]

const topProducts = [
  { name: 'Wireless Keyboard', sales: 42, revenue: 180558 },
  { name: 'CCTV Camera Set', sales: 28, revenue: 358400 },
  { name: 'USB-C Hub', sales: 63, revenue: 126000 },
  { name: 'Laptop Stand', sales: 31, revenue: 93000 },
  { name: 'Mechanical Mouse', sales: 55, revenue: 82500 },
]

const topCourses = [
  { name: 'Full-Stack Web Development', students: 124, revenue: 1054000 },
  { name: 'Graphic Design Pro', students: 89, revenue: 489500 },
  { name: 'Digital Marketing', students: 67, revenue: 335000 },
  { name: 'Python Programming', students: 94, revenue: 376000 },
]

const maxVal = Math.max(...monthlyRevenue.map((d) => d.shop + d.school + d.software + d.dev))

const platforms = [
  { label: 'SI Shop', pct: 38, color: '#f97316' },
  { label: 'Dev Services', pct: 28, color: '#6366f1' },
  { label: 'SI School', pct: 21, color: '#8b5cf6' },
  { label: 'Software', pct: 13, color: '#3b82f6' },
]

export default function AnalyticsPage() {
  return (
    <AdminLayout title="Analytics" breadcrumb={[{ label: 'Analytics' }]}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">📈 Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Revenue trends, traffic, and platform breakdown</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue (Jul)', value: '৳2,28,000', change: '+18%', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Total Orders', value: '156', change: '+24', color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Active Students', value: '374', change: '+61', color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Software Sales', value: '43', change: '+8', color: 'text-orange-600 dark:text-orange-400' },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-gray-500 text-xs">{k.label}</p>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold mt-1">↑ {k.change}</p>
          </div>
        ))}
      </div>

      {/* Stacked bar chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-gray-900 dark:text-white font-bold mb-1">Revenue by Platform — Last 6 Months</h3>
        <p className="text-gray-500 text-xs mb-4">Stacked by platform contribution</p>
        <div className="flex items-end gap-4 h-48">
          {monthlyRevenue.map((d) => {
            const total = d.shop + d.school + d.software + d.dev
            const pct = (total / maxVal) * 100
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end rounded-t-lg overflow-hidden" style={{ height: `${pct}%` }}>
                  <div style={{ height: `${(d.dev / total) * 100}%`, backgroundColor: '#6366f1', minHeight: 4 }} />
                  <div style={{ height: `${(d.software / total) * 100}%`, backgroundColor: '#3b82f6', minHeight: 4 }} />
                  <div style={{ height: `${(d.school / total) * 100}%`, backgroundColor: '#8b5cf6', minHeight: 4 }} />
                  <div style={{ height: `${(d.shop / total) * 100}%`, backgroundColor: '#f97316', minHeight: 4 }} />
                </div>
                <span className="text-gray-500 text-xs">{d.month}</span>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {platforms.map((p) => (
            <div key={p.label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
              {p.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform pie chart (SVG) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">Platform Breakdown</h3>
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 120 120" className="w-36 h-36">
              {(() => {
                let start = 0
                return platforms.map((p) => {
                  const angle = (p.pct / 100) * 360
                  const rad = (v: number) => (v * Math.PI) / 180
                  const x1 = 60 + 50 * Math.cos(rad(start - 90))
                  const y1 = 60 + 50 * Math.sin(rad(start - 90))
                  const x2 = 60 + 50 * Math.cos(rad(start + angle - 90))
                  const y2 = 60 + 50 * Math.sin(rad(start + angle - 90))
                  const large = angle > 180 ? 1 : 0
                  const path = `M 60 60 L ${x1} ${y1} A 50 50 0 ${large} 1 ${x2} ${y2} Z`
                  start += angle
                  return <path key={p.label} d={path} fill={p.color} />
                })
              })()}
              <circle cx="60" cy="60" r="25" fill="white" className="dark:fill-gray-900" />
            </svg>
          </div>
          <div className="space-y-2">
            {platforms.map((p) => (
              <div key={p.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{p.label}</span>
                </div>
                <span className="text-gray-900 dark:text-white font-bold">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs font-bold w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-gray-400 text-xs">{p.sales} sales</p>
                </div>
                <p className="text-gray-900 dark:text-white text-xs font-black">৳{(p.revenue / 1000).toFixed(0)}k</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top courses */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">Top Courses</h3>
          <div className="space-y-3">
            {topCourses.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs font-bold w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold truncate">{c.name}</p>
                  <p className="text-gray-400 text-xs">{c.students} students</p>
                </div>
                <p className="text-gray-900 dark:text-white text-xs font-black">৳{(c.revenue / 1000).toFixed(0)}k</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
