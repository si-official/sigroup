'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getTestimonials, saveTestimonials, Testimonial } from '@/lib/siteData'

function empty(): Testimonial {
  return { id: '', name: '', company: '', role: '', message: '', rating: 5, avatar: '' }
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<Testimonial>(empty())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { setItems(getTestimonials()) }, [])

  function openAdd() { setEditing(null); setForm(empty()); setModal(true) }
  function openEdit(t: Testimonial) { setEditing(t); setForm({...t}); setModal(true) }

  function handleSave() {
    const avatar = form.avatar || (form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())
    const item = { ...form, avatar }
    let updated: Testimonial[]
    if (editing) {
      updated = items.map(i => i.id === editing.id ? item : i)
    } else {
      updated = [...items, { ...item, id: Date.now().toString() }]
    }
    setItems(updated)
    saveTestimonials(updated)
    setModal(false)
  }

  function handleDelete(id: string) {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    saveTestimonials(updated)
    setDeleteId(null)
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Testimonials</h1>
            <p className="text-gray-400 text-sm mt-0.5">{items.length} testimonials</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            + Add Testimonial
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(t => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}, {t.company}</p>
                </div>
                <div className="flex text-yellow-400 text-sm">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
              </div>
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">"{t.message}"</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => setDeleteId(t.id)} className="flex-1 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 py-1.5 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Company</label>
                  <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Company name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="CEO, Director, etc." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Message</label>
                <textarea rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" placeholder="Testimonial message..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm({...form, rating: n})} className={`text-2xl transition-transform hover:scale-110 ${n <= form.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Avatar initials (optional)</label>
                <input value={form.avatar} onChange={e => setForm({...form, avatar: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Auto-generated from name if empty" maxLength={2} />
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {editing ? 'Save Changes' : 'Add Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Delete Testimonial?</h3>
            <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
