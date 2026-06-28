'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { api, Ticket } from '@/lib/portalApi'

const priorityStyles: Record<string, string> = {
  low: 'bg-gray-800 text-gray-400', medium: 'bg-blue-900 text-blue-300',
  high: 'bg-orange-900 text-orange-300', urgent: 'bg-red-900 text-red-300',
}
const statusStyles: Record<string, string> = {
  open: 'bg-green-900 text-green-300', in_progress: 'bg-blue-900 text-blue-300',
  resolved: 'bg-gray-800 text-gray-400', closed: 'bg-gray-800 text-gray-500',
}

const mockTickets: Ticket[] = [
  { id: 1, subject: 'Website loading slow on mobile', status: 'in_progress', priority: 'high', created_at: '2024-06-20', replies: [
    { id: 1, message: 'We are looking into the issue. Can you share the URL?', sender: 'Support Team', is_staff: true, created_at: '2024-06-21' },
    { id: 2, message: 'Sure! It is shop.sigroup.com.bd', sender: 'You', is_staff: false, created_at: '2024-06-21' },
  ]},
  { id: 2, subject: 'Invoice INV-2024-001 query', status: 'resolved', priority: 'medium', created_at: '2024-06-15', replies: [] },
]

export default function TicketsPage() {
  const { token, loading, isLoggedIn } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const [newTicket, setNewTicket] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' })
  const [sending, setSending] = useState(false)

  useEffect(() => { if (!loading && !isLoggedIn) router.push('/') }, [loading, isLoggedIn, router])
  useEffect(() => { if (token) api.tickets(token).then(setTickets).catch(() => {}) }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSending(true)
    try {
      const t = await api.createTicket(form, token)
      setTickets([t, ...tickets])
      setNewTicket(false)
      setForm({ subject: '', message: '', priority: 'medium' })
    } catch { alert('Failed to create ticket') } finally { setSending(false) }
  }

  const handleReply = async (ticket: Ticket) => {
    if (!token || !reply.trim()) return
    setSending(true)
    try {
      const r = await api.replyTicket(ticket.id, reply, token)
      setTickets(tickets.map(t => t.id === ticket.id ? { ...t, replies: [...t.replies, r] } : t))
      if (selected?.id === ticket.id) setSelected({ ...selected, replies: [...selected.replies, r] })
      setReply('')
    } catch { alert('Failed to send reply') } finally { setSending(false) }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-white">Support Tickets</h1>
          <button onClick={() => setNewTicket(true)}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-500 transition">
            + New Ticket
          </button>
        </div>

        {/* New Ticket Modal */}
        {newTicket && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-lg w-full">
              <h3 className="text-xl font-bold text-white mb-6">Create Support Ticket</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required placeholder="Subject" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" />
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <textarea required placeholder="Describe your issue..." rows={4} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 resize-none" />
                <div className="flex gap-3">
                  <button type="submit" disabled={sending}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-500 transition disabled:opacity-50">
                    {sending ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                  <button type="button" onClick={() => setNewTicket(false)}
                    className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-700 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket list */}
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} onClick={() => setSelected(t)}
                className={`bg-gray-900 border rounded-2xl p-5 cursor-pointer transition ${selected?.id === t.id ? 'border-purple-600' : 'border-gray-800 hover:border-gray-700'}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm">{t.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0 ${statusStyles[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyles[t.priority]}`}>{t.priority}</span>
                  <span className="text-gray-500 text-xs">{new Date(t.created_at).toLocaleDateString()}</span>
                  <span className="text-gray-500 text-xs ml-auto">{t.replies.length} replies</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket detail */}
          {selected ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex flex-col h-[600px]">
              <div className="p-5 border-b border-gray-800">
                <h3 className="text-white font-bold">{selected.subject}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[selected.status]}`}>{selected.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyles[selected.priority]}`}>{selected.priority}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selected.replies.map((r) => (
                  <div key={r.id} className={`flex ${r.is_staff ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${r.is_staff ? 'bg-gray-800 text-gray-200' : 'bg-purple-700 text-white'}`}>
                      <p className={`text-xs font-semibold mb-1 ${r.is_staff ? 'text-purple-400' : 'text-purple-200'}`}>{r.sender}</p>
                      <p className="text-sm">{r.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selected.status !== 'closed' && selected.status !== 'resolved' && (
                <div className="p-4 border-t border-gray-800 flex gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..." onKeyDown={(e) => e.key === 'Enter' && handleReply(selected)}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" />
                  <button onClick={() => handleReply(selected)} disabled={sending}
                    className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-500 transition text-sm disabled:opacity-50">
                    Send
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center h-[600px] text-gray-600">
              Select a ticket to view
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
