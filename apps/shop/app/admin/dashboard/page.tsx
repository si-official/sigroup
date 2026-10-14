'use client'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import Link from 'next/link'
import {
  DollarSign, Package, ShoppingCart, Store, Users,
  TrendingUp, ArrowUpRight, Clock, CheckCircle,
  PlusSquare, Settings, BarChart2, Eye,
} from 'lucide-react'

const stats = [
  { label: 'Total Revenue', value: '৳ 84,32,000', change: '+18%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Total Products', value: '11', change: '+2 this week', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Total Orders', value: '3,218', change: '+124 this month', icon: ShoppingCart, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Active Vendors', value: '5', change: '4 verified', icon: Store, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Total Users', value: '2,840', change: '+320 this month', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50' },
]

const recentOrders = [
  { id: '#ORD-2847', customer: 'Arif Hossain', product: 'Restaurant POS System', amount: '৳4,500', method: 'bKash', status: 'completed', date: '2025-07-04' },
  { id: '#ORD-2846', customer: 'Priya Das', product: 'SaaS Admin Dashboard', amount: '৳1,200', method: 'SSLCommerz', status: 'completed', date: '2025-07-04' },
  { id: '#ORD-2845', customer: 'Sajjad Ali', product: 'School ERP System', amount: '৳7,500', method: 'Nagad', status: 'pending', date: '2025-07-03' },
  { id: '#ORD-2844', customer: 'Mitu Akter', product: 'WooCommerce bKash Plugin', amount: '৳800', method: 'bKash', status: 'completed', date: '2025-07-03' },
  { id: '#ORD-2843', customer: 'Riaz Uddin', product: 'Food Delivery Flutter App', amount: '৳6,800', method: 'SSLCommerz', status: 'cancelled', date: '2025-07-02' },
]

const topProducts = [
  { name: 'WooCommerce bKash Plugin', sales: 680, revenue: '৳5,44,000', badge: 'Best Seller' },
  { name: 'SaaS Admin Dashboard', sales: 512, revenue: '৳6,14,400', badge: 'Best Seller' },
  { name: 'Restaurant POS System', sales: 324, revenue: '৳14,58,000', badge: 'Hot' },
  { name: 'Nagad Payment Laravel', sales: 410, revenue: '৳2,05,000', badge: 'Hot' },
  { name: 'Next.js Portfolio Template', sales: 289, revenue: '৳2,60,100', badge: 'New' },
]

const monthlyRevenue = [
  { month: 'Feb', value: 520000 },
  { month: 'Mar', value: 780000 },
  { month: 'Apr', value: 650000 },
  { month: 'May', value: 920000 },
  { month: 'Jun', value: 1100000 },
  { month: 'Jul', value: 840000 },
]

const maxRev = Math.max(...monthlyRevenue.map(m => m.value))

const statusColor: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
}

const badgeColor: Record<string, string> = {
  'Best Seller': 'bg-[#82b541]/10 text-[#82b541]',
  'Hot': 'bg-orange-100 text-orange-600',
  'New': 'bg-blue-100 text-blue-600',
}

const quickActions = [
  { label: 'Add Product', href: '/admin/add-product', icon: PlusSquare, color: 'bg-[#82b541]' },
  { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, color: 'bg-blue-500' },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2, color: 'bg-purple-500' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, color: 'bg-gray-600' },
]

export default function DashboardPage() {
  return (
    <ShopAdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon size={18} className={s.color} />
                </div>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <TrendingUp size={10} />
                  {s.change}
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-[#82b541] text-sm font-medium">
              <TrendingUp size={14} />
              +18% vs last period
            </div>
          </div>
          <div className="flex items-end gap-3 h-36">
            {monthlyRevenue.map((m) => {
              const pct = (m.value / maxRev) * 100
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-gray-400">৳{(m.value / 100000).toFixed(1)}L</div>
                  <div className="w-full rounded-t-md bg-[#82b541]/15 hover:bg-[#82b541]/30 transition-colors relative" style={{ height: `${pct}%` }}>
                    <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#82b541]" style={{ height: `${pct * 0.7}%` }} />
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">{m.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => {
              const Icon = a.icon
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center"
                >
                  <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{a.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">System Status</h3>
            {[
              { label: 'API Uptime', value: '99.9%', ok: true },
              { label: 'Payments', value: 'Operational', ok: true },
              { label: 'Pending Approvals', value: '2 products', ok: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-gray-500">{s.label}</span>
                <span className={`flex items-center gap-1 font-medium ${s.ok ? 'text-green-600' : 'text-yellow-600'}`}>
                  {s.ok ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#82b541] flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Order</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Customer</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs text-gray-500">{o.id}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[120px]">{o.product}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">{o.customer}</td>
                    <td className="px-3 py-3 font-semibold text-gray-800 text-sm">{o.amount}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Selling Products</h2>
            <Link href="/admin/products" className="text-xs text-[#82b541] flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.sales} sales</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">{p.revenue}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeColor[p.badge] ?? 'bg-gray-100 text-gray-500'}`}>
                    {p.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShopAdminLayout>
  )
}
