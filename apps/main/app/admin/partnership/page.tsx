'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getPartnershipContent, savePartnershipContent, PartnershipContent, PartnershipInquiry } from '@/lib/siteData'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-400',
  reviewed: 'bg-blue-900/40 text-blue-400',
  contacted: 'bg-green-900/40 text-green-400',
}

export default function PartnershipPage() {
  const [data, setData] = useState<PartnershipContent | null>(null)
  const [saved, setSaved] = useState(false)
  const [benefitInput, setBenefitInput] = useState('')

  useEffect(() => { setData(getPartnershipContent()) }, [])
  if (!data) return <AdminLayout><div className="text-gray-400">Loading...</div></AdminLayout>

  function handleSave() {
    if (!data) return
    savePartnershipContent(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addBenefit() {
    if (!benefitInput.trim() || !data) return
    setData({ ...data, benefits: [...data.benefits, benefitInput.trim()] })
    setBenefitInput('')
  }

  function removeBenefit(i: number) {
    if (!data) return
    setData({ ...data, benefits: data.benefits.filter((_, j) => j !== i) })
  }

  function updateStatus(id: string, status: PartnershipInquiry['status']) {
    if (!data) return
    const inquiries = data.inquiries.map(i => i.id === id ? { ...i, status } : i)
    const updated = { ...data, inquiries }
    setData(updated)
    savePartnershipContent(updated)
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Partnership</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage partnership content and inquiries</p>
          </div>
          <button onClick={handleSave} className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Section Content</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Heading</label>
                  <input value={data.heading} onChange={e => setData({...data, heading: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Subheading</label>
                  <input value={data.subheading} onChange={e => setData({...data, subheading: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea rows={3} value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Benefits</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {data.benefits.map((b, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                      {b}
                      <button onClick={() => removeBenefit(i)} className="text-gray-500 hover:text-red-400">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={benefitInput} onChange={e => setBenefitInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Add a benefit..." />
                  <button onClick={addBenefit} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition-colors">Add</button>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiries */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Partnership Inquiries ({data.inquiries.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 pb-3">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3">Company</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3 hidden sm:table-cell">Email</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3 hidden md:table-cell">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data.inquiries.map(inq => (
                    <tr key={inq.id}>
                      <td className="py-3 font-medium">{inq.name}</td>
                      <td className="py-3 text-gray-400">{inq.company}</td>
                      <td className="py-3 text-gray-400 hidden sm:table-cell">{inq.email}</td>
                      <td className="py-3 text-gray-500 hidden md:table-cell">{inq.date}</td>
                      <td className="py-3">
                        <select
                          value={inq.status}
                          onChange={e => updateStatus(inq.id, e.target.value as PartnershipInquiry['status'])}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusColors[inq.status]} bg-transparent`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="contacted">Contacted</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
