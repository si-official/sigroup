'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { api, Invoice } from '@/lib/portalApi'

const mockInvoices: Invoice[] = [
  { id: 1, invoice_number: 'INV-2024-001', amount: 75000, status: 'paid', due_date: '2024-06-15', paid_at: '2024-06-10', items: [
    { description: 'Website Design', quantity: 1, unit_price: 50000, total: 50000 },
    { description: 'SEO Setup', quantity: 1, unit_price: 25000, total: 25000 },
  ]},
  { id: 2, invoice_number: 'INV-2024-002', amount: 120000, status: 'unpaid', due_date: '2024-07-31', items: [
    { description: 'Mobile App Development - Phase 1', quantity: 1, unit_price: 120000, total: 120000 },
  ]},
  { id: 3, invoice_number: 'INV-2024-003', amount: 45000, status: 'overdue', due_date: '2024-06-01', items: [
    { description: 'Monthly Maintenance', quantity: 3, unit_price: 15000, total: 45000 },
  ]},
]

const statusStyles: Record<string, string> = {
  paid: 'bg-green-900 text-green-300',
  unpaid: 'bg-yellow-900 text-yellow-300',
  overdue: 'bg-red-900 text-red-300',
  cancelled: 'bg-gray-800 text-gray-400',
}

export default function InvoicesPage() {
  const { token, loading, isLoggedIn } = useAuth()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => { if (!loading && !isLoggedIn) router.push('/') }, [loading, isLoggedIn, router])
  useEffect(() => { if (token) api.invoices(token).then(setInvoices).catch(() => {}) }, [token])

  const handlePay = async (inv: Invoice) => {
    if (!token) return
    setPaying(true)
    try {
      const { payment_url } = await api.payInvoice(inv.id, token)
      window.location.href = payment_url
    } catch {
      alert('Payment initiation failed. Please try again.')
    } finally { setPaying(false) }
  }

  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const due = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-black text-white mb-8">Invoices & Payments</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Billed', value: `৳${total.toLocaleString()}`, color: 'border-purple-800' },
            { label: 'Total Paid', value: `৳${paid.toLocaleString()}`, color: 'border-green-800' },
            { label: 'Amount Due', value: `৳${due.toLocaleString()}`, color: 'border-red-800' },
          ].map((s) => (
            <div key={s.label} className={`bg-gray-900 border ${s.color} rounded-2xl p-5`}>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition"
                onClick={() => setSelected(selected?.id === inv.id ? null : inv)}>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{inv.invoice_number}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyles[inv.status]}`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Due: {new Date(inv.due_date).toLocaleDateString()}
                    {inv.paid_at && ` · Paid: ${new Date(inv.paid_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-black text-xl">৳{inv.amount.toLocaleString()}</span>
                  {(inv.status === 'unpaid' || inv.status === 'overdue') && (
                    <button onClick={(e) => { e.stopPropagation(); handlePay(inv) }} disabled={paying}
                      className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-500 transition disabled:opacity-50">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
              {selected?.id === inv.id && (
                <div className="border-t border-gray-800 p-5">
                  <table className="w-full text-sm">
                    <thead><tr className="text-gray-500 text-left border-b border-gray-800">
                      <th className="pb-2">Description</th><th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th><th className="pb-2 text-right">Total</th>
                    </tr></thead>
                    <tbody>
                      {inv.items.map((item, i) => (
                        <tr key={i} className="text-gray-300 border-b border-gray-800/50">
                          <td className="py-2">{item.description}</td>
                          <td className="py-2 text-right">{item.quantity}</td>
                          <td className="py-2 text-right">৳{item.unit_price.toLocaleString()}</td>
                          <td className="py-2 text-right font-semibold">৳{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="text-white font-black">
                      <td colSpan={3} className="pt-3 text-right">Total</td>
                      <td className="pt-3 text-right">৳{inv.amount.toLocaleString()}</td>
                    </tr></tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
