'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getDevPackages, saveDevPackages, DevPackage } from '@/lib/siteData'

function empty(): DevPackage {
  return { id: '', name: '', price: '', features: [], popular: false }
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<DevPackage[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<DevPackage | null>(null)
  const [form, setForm] = useState<DevPackage>(empty())
  const [featureInput, setFeatureInput] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { setPackages(getDevPackages()) }, [])

  function openAdd() { setEditing(null); setForm(empty()); setFeatureInput(''); setModal(true) }
  function openEdit(p: DevPackage) { setEditing(p); setForm({...p}); setFeatureInput(''); setModal(true) }

  function addFeature() {
    if (!featureInput.trim()) return
    setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }))
    setFeatureInput('')
  }

  function handleSave() {
    let updated: DevPackage[]
    if (editing) {
      updated = packages.map(p => p.id === editing.id ? form : p)
    } else {
      updated = [...packages, { ...form, id: Date.now().toString() }]
    }
    setPackages(updated)
    saveDevPackages(updated)
    setModal(false)
  }

  function handleDelete(id: string) {
    const updated = packages.filter(p => p.id !== id)
    setPackages(updated)
    saveDevPackages(updated)
    setDeleteId(null)
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dev Packages</h1>
            <p className="text-gray-400 text-sm mt-0.5">{packages.length} packages</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            + Add Package
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(p => (
            <div key={p.id} className={`bg-gray-900 border rounded-xl p-5 relative ${p.popular ? 'border-purple-500' : 'border-gray-800'}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-purple-400 text-2xl font-bold mt-1 mb-4">{p.price}</p>
              <ul className="space-y-2 mb-5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => setDeleteId(p.id)} className="flex-1 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 py-1.5 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Edit Package' : 'Add Package'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Package Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Starter, Pro, etc." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Price</label>
                  <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="৳15,000 or Custom" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Features</label>
                <div className="space-y-2 mb-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                      <span className="flex-1 text-sm text-gray-300">{f}</span>
                      <button onClick={() => setForm(prev => ({...prev, features: prev.features.filter((_, j) => j !== i)}))} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Add a feature..." />
                  <button onClick={addFeature} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition-colors">Add</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="popular" checked={form.popular} onChange={e => setForm({...form, popular: e.target.checked})} className="w-4 h-4 accent-purple-500" />
                <label htmlFor="popular" className="text-sm text-gray-300">Mark as Most Popular</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm transition-colors">
                {editing ? 'Save Changes' : 'Add Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Delete Package?</h3>
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
