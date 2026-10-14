'use client'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { TrendingUp, Users, Eye, ShoppingCart } from 'lucide-react'

const revenueByMonth = [
  { month: 'Jan', revenue: 4230000, orders: 187, visitors: 8400 },
  { month: 'Feb', revenue: 5200000, orders: 215, visitors: 9200 },
  { month: 'Mar', revenue: 7800000, orders: 298, visitors: 12500 },
  { month: 'Apr', revenue: 6500000, orders: 252, visitors: 11200 },
  { month: 'May', revenue: 9200000, orders: 341, visitors: 15800 },
  { month: 'Jun', revenue: 11000000, orders: 412, visitors: 18400 },
  { month: 'Jul', revenue: 3200000, orders: 124, visitors: 6200 },
]

const categoryBreakdown = [
  { name: 'Software', revenue: 28500000, pct: 34 },
  { name: 'Mobile Apps', revenue: 21200000, pct: 25 },
  { name: 'Templates', revenue: 12800000, pct: 15 },
  { name: 'Plugins', revenue: 10200000, pct: 12 },
  { name: 'Scripts', revenue: 8400000, pct: 10 },
  { name: 'UI Kits', revenue: 3500000, pct: 4 },
]

const topVendors = [
  { name: 'TechBD Solutions', sales: 703, revenue: 28086000, growth: '+12%' },
  { name: 'DesignHut BD', sales: 1841, revenue: 42540000, growth: '+24%' },
  { name: 'AppFactory BD', sales: 408, revenue: 12840000, growth: '+8%' },
  { name: 'PluginPro BD', sales: 589, revenue: 5890000, growth: '+19%' },
  { name: 'ScriptMart BD', sales: 210, revenue: 4620000, growth: '+5%' },
]

const topProducts = [
  { name: 'WooCommerce bKash Plugin', sales: 680, revenue: 5440000 },
  { name: 'SaaS Admin Dashboard', sales: 512, revenue: 6144000 },
  { name: 'Nagad Payment Laravel', sales: 410, revenue: 2050000 },
  { name: 'Restaurant POS System', sales: 324, revenue: 14580000 },
  { name: 'Next.js Portfolio Template', sales: 289, revenue: 2601000 },
]

const maxRev = Math.max(...revenueByMonth.map(m => m.revenue))
const maxVis = Math.max(...revenueByMonth.map(m => m.visitors))

const catColors = ['bg-[#82b541]', 'bg-blue-500', 'bg-purple-500', 'bg-orange-400', 'bg-teal-500', 'bg-pink-400']

function fmt(n: number) {
  if (n >= 10000000) return `৳${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`
  return `৳${n.toLocaleString()}`
}

export default function AnalyticsPage() {
  const totalRevenue = revenueByMonth.reduce((s, m) => s + m.revenue, 0)
  const totalOrders = revenueByMonth.reduce((s, m) => s + m.orders, 0)
  const totalVisitors = revenueByMonth.reduce((s, m) => s + m.visitors, 0)
  const conversion = ((totalOrders / totalVisitors) * 100).toFixed(1)

  return (
    <ShopAdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50', sub: '2025 YTD' },
          { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', sub: '+18% vs 2024' },
          { label: 'Total Visitors', value: totalVisitors.toLocaleString(), icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50', sub: 'Unique sessions' },
          { label: 'Conversion Rate', value: `${conversion}%`, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50', sub: 'Orders / Visitors' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={s.color} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue + Visitors chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Revenue & Traffic Trend</h2>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-[#82b541] inline-block"></span>Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-blue-400 inline-block"></span>Visitors</span>
            </div>
          </div>
          <div className="flex items-end gap-4 h-48">
            {revenueByMonth.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1" style={{ height: '160px' }}>
                  <div
                    className="flex-1 bg-[#82b541] rounded-t hover:opacity-80 transition-opacity"
                    style={{ height: `${(m.revenue / maxRev) * 100}%` }}
                    title={fmt(m.revenue)}
                  />
                  <div
                    className="flex-1 bg-blue-400 rounded-t hover:opacity-80 transition-opacity"
                    style={{ height: `${(m.visitors / maxVis) * 100}%` }}
                    title={m.visitors.toLocaleString()}
                  />
                </div>
                <div className="text-[10px] text-gray-500">{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Revenue by Category</h2>
          <div className="space-y-3">
            {categoryBreakdown.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{c.name}</span>
                  <span className="text-xs font-semibold text-gray-600">{c.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${catColors[i] ?? 'bg-gray-400'}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{fmt(c.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Vendors by Revenue</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Vendor</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Sales</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Revenue</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">Growth</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.map((v, i) => (
                <tr key={v.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">{i + 1}</span>
                      <span className="font-medium text-gray-800 text-sm">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{v.sales}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(v.revenue)}</td>
                  <td className="px-5 py-3 text-right text-green-600 font-medium text-xs">{v.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Products by Sales</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Product</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Units</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">{i + 1}</span>
                      <span className="font-medium text-gray-800 text-sm truncate max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.sales}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ShopAdminLayout>
  )
}
