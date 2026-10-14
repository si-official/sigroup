'use client'
import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

const initPackages = [
  { id: 1, name: 'Starter Website', price: 15000, delivery: '7 days', enquiries: 42, orders: 28, status: 'active', icon: '🌐' },
  { id: 2, name: 'Business Web App', price: 45000, delivery: '21 days', enquiries: 31, orders: 19, status: 'active', icon: '💼' },
  { id: 3, name: 'Mobile App (iOS + Android)', price: 65000, delivery: '30 days', enquiries: 24, orders: 11, status: 'active', icon: '📱' },
  { id: 4, name: 'Enterprise System', price: 0, delivery: '60+ days', enquiries: 19, orders: 5, status: 'active', icon: '🏗️' },
]

const initEnquiries = [
  { id: 1, client: 'Ahmed Karim', email: 'ahmed@bizco.com', package: 'Business Web App', budget: '৳50,000', date: '2026-07-03', status: 'new' },
  { id: 2, client: 'Nadia Haque', email: 'nadia@shop.com', package: 'Mobile App', budget: '৳70,000', date: '2026-07-02', status: 'contacted' },
  { id: 3, client: 'Rahim Uddin', email: 'rahim@company.com', package: 'Starter Website', budget: '৳20,000', date: '2026-07-01', status: 'proposal_sent' },
  { id: 4, client: 'Sara Islam', email: 'sara@delta.com', package: 'Enterprise System', budget: 'Custom', date: '2026-06-30', status: 'new' },
]

const enquiryStatus: Record<string, string> = {
  new: 'bg-blue-900/60 text-blue-400 border-blue-800',
  contacted: 'bg-yellow-900/60 text-yellow-400 border-yellow-800',
  proposal_sent: 'bg-violet-900/60 text-violet-400 border-violet-800',
  won: 'bg-emerald-900/60 text-emerald-400 border-emerald-800',
  lost: 'bg-red-900/60 text-red-400 border-red-800',
}

export default function DevAdmin() {
  const [packages] = useState(initPackages)
  const [enquiries, setEnquiries] = useState(initEnquiries)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', delivery: '', icon: '⚙️' })

  return (
    <AdminLayout title="Dev Services" breadcrumb={[{ label: 'Dev Services' }]}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">⚙️ Dev Services Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage packages, enquiries and active projects</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
            + Add Package
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Packages', value: packages.length, icon: '📦' },
            { label: 'Total Enquiries', value: enquiries.length, icon: '📩' },
            { label: 'New Enquiries', value: enquiries.filter(e => e.status === 'new').length, icon: '🔔' },
            { label: 'Total Revenue', value: '৳' + packages.reduce((a, p) => a + p.price * p.orders, 0).toLocaleString(), icon: '💰' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-black text-white mt-2">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Service packages */}
        <h2 className="text-white font-black mb-4">Service Packages</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {packages.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-3xl">{p.icon}</span>
              <div className="flex-1">
                <p className="text-white font-bold">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.delivery} · {p.enquiries} enquiries · {p.orders} orders</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black">{p.price ? `৳${p.price.toLocaleString()}` : 'Custom'}</p>
                <button className="text-gray-500 hover:text-white text-xs transition mt-1">Edit</button>
              </div>
            </div>
          ))}
        </div>

        {/* Enquiries table */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black">Client Enquiries</h2>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800 bg-gray-950/50">
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Package</th>
                <th className="px-6 py-4 text-left">Budget</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold">{e.client}</p>
                    <p className="text-gray-500 text-xs">{e.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{e.package}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{e.budget}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{e.date}</td>
                  <td className="px-6 py-4">
                    <select
                      value={e.status}
                      onChange={(ev) => setEnquiries(enquiries.map(x => x.id === e.id ? { ...x, status: ev.target.value } : x))}
                      className={`text-xs px-2.5 py-1 rounded-full border font-semibold bg-transparent cursor-pointer ${enquiryStatus[e.status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="proposal_sent">proposal_sent</option>
                      <option value="won">won</option>
                      <option value="lost">lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-400 hover:text-blue-300 text-xs font-bold mr-3">Reply</button>
                    <button className="text-red-500 hover:text-red-400 text-xs font-bold" onClick={() => setEnquiries(enquiries.filter(x => x.id !== e.id))}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </AdminLayout>
  )
}
