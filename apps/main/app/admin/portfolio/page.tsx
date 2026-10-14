'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getPortfolioItems, savePortfolioItems, PortfolioItem } from '@/lib/siteData'

const categories = ['All', 'Web', 'Mobile', 'Design', 'Software']

function emptyItem(): PortfolioItem {
  return { id: '', title: '', category: 'Web', description: '', image: '', liveUrl: '', techStack: [], featured: false }
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<PortfolioItem | null>(null)
  const [form, setForm] = useState<PortfolioItem>(emptyItem())
  const [techInput, setTechInput] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { setItems(getPortfolioItems()) }, [])

  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter)

  function openAdd() {
    setEditing(null)
    setForm(emptyItem())
    setTechInput('')
    setModal(true)
  }

  function openEdit(item: PortfolioItem) {
    setEditing(item)
    setForm({ ...item })
    setTechInput(item.techStack.join(', '))
    setModal(true)
  }

  function handleSave() {
    const tech = techInput.split(',').map(t => t.trim()).filter(Boolean)
    const item = { ...form, techStack: tech }
    let updated: PortfolioItem[]
    if (editing) {
      updated = items.map(i => i.id === editing.id ? item : i)
    } else {
      updated = [...items, { ...item, id: Date.now().toString() }]
    }
    setItems(updated)
    savePortfolioItems(updated)
    setModal(false)
  }

  function handleDelete(id: string) {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    savePortfolioItems(updated)
    setDeleteId(null)
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-gray-400 text-sm mt-0.5">{items.length} items</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            + Add Item
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
              <div className="relative">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-800 flex items-center justify-center text-gray-600 text-3xl">🖼️</div>
                )}
                {item.featured && (
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">Featured</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full shrink-0">{item.category}</span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.techStack.slice(0, 3).map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{t}</span>
                  ))}
                  {item.techStack.length > 3 && <span className="text-xs text-gray-500">+{item.techStack.length - 3}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => setDeleteId(item.id)} className="flex-1 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 py-1.5 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Project title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500">
                  {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" placeholder="Project description" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Image URL</label>
                <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Live URL</label>
                <input value={form.liveUrl} onChange={e => setForm({...form, liveUrl: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Tech Stack (comma-separated)</label>
                <input value={techInput} onChange={e => setTechInput(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Next.js, TypeScript, Tailwind" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 accent-purple-500" />
                <label htmlFor="featured" className="text-sm text-gray-300">Mark as Featured</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {editing ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Delete Item?</h3>
            <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
