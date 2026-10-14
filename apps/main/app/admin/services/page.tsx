'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getServices, saveServices, Service } from '@/lib/siteData'

const icons = ['🌐', '📱', '🎨', '⚙️', '📈', '🔒', '☁️', '🤖', '📊', '🛠️', '💡', '🚀']

function emptyService(): Service {
  return { id: '', title: '', description: '', icon: '🌐', features: [] }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<Service>(emptyService())
  const [featureInput, setFeatureInput] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)

  useEffect(() => { setServices(getServices()) }, [])

  function openAdd() {
    setEditing(null)
    setForm(emptyService())
    setFeatureInput('')
    setModal(true)
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({ ...s })
    setFeatureInput('')
    setModal(true)
  }

  function addFeature() {
    if (!featureInput.trim()) return
    setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }))
    setFeatureInput('')
  }

  function removeFeature(idx: number) {
    setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }))
  }

  function handleSave() {
    let updated: Service[]
    if (editing) {
      updated = services.map(s => s.id === editing.id ? form : s)
    } else {
      updated = [...services, { ...form, id: Date.now().toString() }]
    }
    setServices(updated)
    saveServices(updated)
    setModal(false)
  }

  function handleDelete(id: string) {
    const updated = services.filter(s => s.id !== id)
    setServices(updated)
    saveServices(updated)
    setDeleteId(null)
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Services</h1>
            <p className="text-gray-400 text-sm mt-0.5">{services.length} services</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            + Add Service
          </button>
        </div>

        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-gray-400 text-sm mt-0.5">{s.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEdit(s)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => setDeleteId(s.id)} className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.features.map((f, i) => (
                      <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Icon</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-2xl hover:border-purple-500 transition-colors"
                  >
                    {form.icon}
                  </button>
                  <span className="text-xs text-gray-500">Click to change icon</span>
                </div>
                {showIconPicker && (
                  <div className="mt-2 flex flex-wrap gap-2 bg-gray-800 p-3 rounded-xl border border-gray-700">
                    {icons.map(ic => (
                      <button key={ic} onClick={() => { setForm(f => ({...f, icon: ic})); setShowIconPicker(false) }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-gray-700 transition-colors ${form.icon === ic ? 'bg-purple-600' : ''}`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Service title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" placeholder="Service description" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Features</label>
                <div className="space-y-2 mb-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                      <span className="flex-1 text-sm text-gray-300">{f}</span>
                      <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Add a feature..." />
                  <button onClick={addFeature} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition-colors">Add</button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {editing ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Delete Service?</h3>
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
