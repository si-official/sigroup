'use client'
import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

const initSoftware = [
  { id: 1, name: 'ISP Billing Suite Pro', category: 'ISP / Networking', price: 15000, sold: 340, status: 'active', icon: '📡', downloads: 340 },
  { id: 2, name: 'Restaurant POS System', category: 'Restaurant / Food', price: 8500, sold: 210, status: 'active', icon: '🍽️', downloads: 210 },
  { id: 3, name: 'Hospital Management System', category: 'Healthcare', price: 22000, sold: 95, status: 'active', icon: '🏥', downloads: 95 },
  { id: 4, name: 'HR & Payroll Manager', category: 'HR / Business', price: 12000, sold: 78, status: 'active', icon: '👔', downloads: 78 },
]

const statusColors: Record<string, string> = {
  active: 'bg-emerald-900/60 text-emerald-400 border-emerald-800',
  draft: 'bg-gray-800 text-gray-400 border-gray-700',
}

export default function SoftwareAdmin() {
  const [items, setItems] = useState(initSoftware)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', price: '', icon: '💾' })

  const add = () => {
    if (!form.name || !form.price) return
    setItems([{ id: items.length + 1, name: form.name, category: form.category, price: Number(form.price), sold: 0, status: 'active', icon: form.icon, downloads: 0 }, ...items])
    setForm({ name: '', category: '', price: '', icon: '💾' })
    setShowAdd(false)
  }

  return (
    <AdminLayout title="Software Market" breadcrumb={[{ label: 'Software Market' }]}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">💾 Software Market</h1>
            <p className="text-gray-400 text-sm mt-1">Manage software listings, licences, downloads</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
            + Add Software
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Listings', value: items.length, icon: '💾' },
            { label: 'Total Sales', value: items.reduce((a, x) => a + x.sold, 0), icon: '💰' },
            { label: 'Total Downloads', value: items.reduce((a, x) => a + x.downloads, 0), icon: '⬇️' },
            { label: 'Revenue', value: '৳' + items.reduce((a, x) => a + x.price * x.sold, 0).toLocaleString(), icon: '📊' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-black text-white mt-2">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-white font-black text-xl mb-6">Add Software</h2>
              <div className="space-y-4">
                {[
                  { label: 'Software Name *', key: 'name', placeholder: 'e.g. Pharmacy POS' },
                  { label: 'Category', key: 'category', placeholder: 'e.g. Healthcare' },
                  { label: 'Price (৳)', key: 'price', placeholder: 'e.g. 10000' },
                  { label: 'Icon (emoji)', key: 'icon', placeholder: '💾' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-gray-400 text-xs mb-1.5 block">{f.label}</label>
                    <input
                      value={(form as Record<string, string>)[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={add} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition">Add Software</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-bold transition">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800 bg-gray-950/50">
                <th className="px-6 py-4 text-left">Software</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Sold</th>
                <th className="px-6 py-4 text-left">Revenue</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-white font-semibold text-sm">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{s.category}</td>
                  <td className="px-6 py-4 text-white font-bold">৳{s.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-300">{s.sold}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">৳{(s.price * s.sold).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColors[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-400 hover:text-blue-300 text-xs font-bold mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-400 text-xs font-bold" onClick={() => setItems(items.filter(x => x.id !== s.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </AdminLayout>
  )
}
