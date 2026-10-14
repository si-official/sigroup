'use client'
import AdminLayout from '@/components/AdminLayout'

const invoices = [
  { id: 'INV-001', client: 'Delta ISP Ltd', amount: 25000, status: 'paid', date: '2026-07-01', due: '2026-07-15' },
  { id: 'INV-002', client: 'Sara Islam (Partner)', amount: 8500, status: 'pending', date: '2026-07-02', due: '2026-07-16' },
  { id: 'INV-003', client: 'Green Tech Solutions', amount: 65000, status: 'overdue', date: '2026-06-15', due: '2026-06-30' },
  { id: 'INV-004', client: 'Rahim & Co', amount: 12800, status: 'paid', date: '2026-06-20', due: '2026-07-04' },
  { id: 'INV-005', client: 'BD Enterprises', amount: 45000, status: 'pending', date: '2026-07-03', due: '2026-07-17' },
]

const statusStyle: Record<string, string> = {
  paid: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400',
  overdue: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
}

export default function InvoicesPage() {
  return (
    <AdminLayout title="Invoices" breadcrumb={[{ label: 'Invoices' }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">🧾 Invoices</h1>
          <p className="text-gray-500 text-sm mt-0.5">All client and partner invoices</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition">+ New Invoice</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Invoiced', value: `৳${invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Paid', value: `৳${invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Outstanding', value: `৳${invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: 'text-amber-600 dark:text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {['Invoice ID', 'Client', 'Amount', 'Status', 'Date', 'Due Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs font-bold">{inv.id}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">{inv.client}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white font-black text-sm">৳{inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${statusStyle[inv.status]}`}>{inv.status}</span></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.date}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.due}</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold mr-3">View</button>
                  <button className="text-gray-500 hover:underline text-xs">PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
