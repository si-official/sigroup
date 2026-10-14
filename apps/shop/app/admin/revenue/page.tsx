'use client'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { DollarSign, TrendingUp, Percent, ArrowUpRight } from 'lucide-react'

const monthlyData = [
  { month: 'Jan 2025', orders: 187, revenue: 4230000, commission: 634500, vendorPayout: 3595500 },
  { month: 'Feb 2025', orders: 215, revenue: 5200000, commission: 780000, vendorPayout: 4420000 },
  { month: 'Mar 2025', orders: 298, revenue: 7800000, commission: 1170000, vendorPayout: 6630000 },
  { month: 'Apr 2025', orders: 252, revenue: 6500000, commission: 975000, vendorPayout: 5525000 },
  { month: 'May 2025', orders: 341, revenue: 9200000, commission: 1380000, vendorPayout: 7820000 },
  { month: 'Jun 2025', orders: 412, revenue: 11000000, commission: 1650000, vendorPayout: 9350000 },
  { month: 'Jul 2025', orders: 124, revenue: 3200000, commission: 480000, vendorPayout: 2720000 },
]

const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
const totalCommission = monthlyData.reduce((s, m) => s + m.commission, 0)
const totalPayout = monthlyData.reduce((s, m) => s + m.vendorPayout, 0)
const totalOrders = monthlyData.reduce((s, m) => s + m.orders, 0)

const maxRev = Math.max(...monthlyData.map(m => m.revenue))

function fmt(n: number) {
  if (n >= 10000000) return `৳${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`
  return `৳${n.toLocaleString()}`
}

export default function RevenuePage() {
  return (
    <ShopAdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50', sub: `${totalOrders} orders` },
          { label: 'Platform Commission', value: fmt(totalCommission), icon: Percent, color: 'text-blue-500', bg: 'bg-blue-50', sub: '15% commission rate' },
          { label: 'Vendor Payouts', value: fmt(totalPayout), icon: ArrowUpRight, color: 'text-purple-500', bg: 'bg-purple-50', sub: '85% to vendors' },
          { label: 'Avg Order Value', value: `৳${Math.round(totalRevenue / totalOrders).toLocaleString()}`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50', sub: '+12% vs last year' },
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

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Revenue Trend</h2>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#82b541]"></span>Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400"></span>Commission</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-400"></span>Vendor Payout</span>
          </div>
        </div>
        <div className="flex items-end gap-4 h-48">
          {monthlyData.map(m => {
            const pct = m.revenue / maxRev
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5" style={{ height: '160px' }}>
                  <div className="flex-1 bg-[#82b541] rounded-t" style={{ height: `${pct * 100}%` }} title={fmt(m.revenue)} />
                  <div className="flex-1 bg-blue-400 rounded-t" style={{ height: `${(m.commission / maxRev) * 100}%` }} title={fmt(m.commission)} />
                  <div className="flex-1 bg-purple-400 rounded-t" style={{ height: `${(m.vendorPayout / maxRev) * 100}%` }} title={fmt(m.vendorPayout)} />
                </div>
                <div className="text-[10px] text-gray-500 text-center leading-tight">{m.month.split(' ')[0]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Monthly Breakdown</h2>
          <p className="text-xs text-gray-400 mt-0.5">Commission rate: 15% · Vendor share: 85%</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Month</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Commission (15%)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Vendor Payout (85%)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(m => (
                <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{m.month}</td>
                  <td className="px-4 py-3.5 text-right text-gray-600">{m.orders}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-800">{fmt(m.revenue)}</td>
                  <td className="px-4 py-3.5 text-right text-blue-600 font-medium">{fmt(m.commission)}</td>
                  <td className="px-5 py-3.5 text-right text-purple-600 font-medium">{fmt(m.vendorPayout)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                <td className="px-5 py-3 text-gray-800">Total</td>
                <td className="px-4 py-3 text-right text-gray-700">{totalOrders}</td>
                <td className="px-4 py-3 text-right text-gray-800">{fmt(totalRevenue)}</td>
                <td className="px-4 py-3 text-right text-blue-700">{fmt(totalCommission)}</td>
                <td className="px-5 py-3 text-right text-purple-700">{fmt(totalPayout)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ShopAdminLayout>
  )
}
