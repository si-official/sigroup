'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getContactInfo, saveContactInfo, ContactInfo, ContactMessage } from '@/lib/siteData'

export default function ContactPage() {
  const [data, setData] = useState<ContactInfo | null>(null)
  const [saved, setSaved] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { setData(getContactInfo()) }, [])
  if (!data) return <AdminLayout><div className="text-gray-400">Loading...</div></AdminLayout>

  function handleSave() {
    if (!data) return
    saveContactInfo(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function markRead(id: string) {
    if (!data) return
    const messages = data.messages.map(m => m.id === id ? { ...m, read: true } : m)
    const updated = { ...data, messages }
    setData(updated)
    saveContactInfo(updated)
  }

  function deleteMsg(id: string) {
    if (!data) return
    const messages = data.messages.filter(m => m.id !== id)
    const updated = { ...data, messages }
    setData(updated)
    saveContactInfo(updated)
    setDeleteId(null)
    if (selectedMsg?.id === id) setSelectedMsg(null)
  }

  const unread = data.messages.filter(m => !m.read).length

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Contact & Messages</h1>
            <p className="text-gray-400 text-sm mt-0.5">{unread} unread messages</p>
          </div>
          <button onClick={handleSave} className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            {saved ? '✓ Saved' : 'Save Info'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Contact info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
                <input value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Address</label>
                <input value={data.address} onChange={e => setData({...data, address: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Map Embed URL</label>
                <input value={data.mapEmbed} onChange={e => setData({...data, mapEmbed: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Google Maps embed URL" />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800">
              <h2 className="font-semibold">Contact Form Submissions</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {data.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors ${!msg.read ? 'bg-purple-900/10' : ''}`}
                  onClick={() => { setSelectedMsg(msg); markRead(msg.id) }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!msg.read ? 'bg-purple-500' : 'bg-gray-700'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${!msg.read ? 'text-gray-100' : 'text-gray-400'}`}>{msg.name}</p>
                      <span className="text-xs text-gray-500 shrink-0">{msg.date}</span>
                    </div>
                    <p className="text-xs text-gray-500">{msg.email}</p>
                    <p className="text-sm text-gray-400 truncate mt-0.5">{msg.subject}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteId(msg.id) }}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs shrink-0"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Message detail modal */}
      {selectedMsg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">{selectedMsg.subject}</h2>
              <button onClick={() => setSelectedMsg(null)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 font-bold">
                  {selectedMsg.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedMsg.name}</p>
                  <p className="text-gray-400 text-xs">{selectedMsg.email} · {selectedMsg.date}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedMsg.message}</p>
            </div>
            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => { setDeleteId(selectedMsg.id); setSelectedMsg(null) }}
                className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 py-2.5 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
              <a
                href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm text-center transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Delete Message?</h3>
            <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={() => deleteMsg(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
