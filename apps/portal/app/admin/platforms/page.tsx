'use client'
import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

const initPlatforms = [
  {
    id: 1, icon: '🛒', name: 'SI Mart', tagline: 'Online Shopping in Bangladesh',
    link: 'https://www.simart.com.bd', btnLabel: "Let's Shopping & Enjoy 🛍️",
    status: 'active', order: 1, color: 'from-orange-500 to-pink-600',
    desc: "SI Mart is Bangladesh's trusted e-commerce platform — delivering quality products across all 64 districts within 24–48 hours.",
  },
  {
    id: 2, icon: '🌐', name: 'WC EDGE', tagline: 'Internet Service Provider & Technology Solutions',
    link: 'https://wcedge.com.bd', btnLabel: 'Visit WC EDGE →',
    status: 'active', order: 2, color: 'from-blue-500 to-cyan-600',
    desc: 'WC EDGE provides high-speed internet services across Bangladesh alongside technology products and solutions.',
  },
  {
    id: 3, icon: '🎓', name: 'SI School', tagline: 'Online Learning Platform',
    link: 'https://school.sigroup.com.bd', btnLabel: 'Start Learning →',
    status: 'active', order: 3, color: 'from-indigo-500 to-violet-600',
    desc: 'SI School offers professional development, design, and academic education courses in Bangla & English.',
  },
  {
    id: 4, icon: '📷', name: 'SI Technology', tagline: 'CCTV & Security Products',
    link: 'https://sitechnology.com.bd', btnLabel: 'Secure Your Home →',
    status: 'active', order: 4, color: 'from-slate-600 to-gray-800',
    desc: 'Complete CCTV, IP surveillance, access control and security product sales & installation across Bangladesh.',
  },
  {
    id: 5, icon: '💾', name: 'SI Software & Design', tagline: 'Software & Design Marketplace',
    link: 'https://shop.sigroup.com.bd', btnLabel: 'Visit Marketplace →',
    status: 'active', order: 5, color: 'from-violet-500 to-purple-700',
    desc: 'A complete marketplace where all types of business software, graphic designs, templates and digital assets are bought and sold.',
  },
]

type Platform = typeof initPlatforms[0]

const emptyForm = { icon: '🏢', name: '', tagline: '', link: '', btnLabel: 'Visit Now →', desc: '', color: 'from-blue-500 to-indigo-600' }

export default function PlatformsAdmin() {
  const [platforms, setPlatforms] = useState(initPlatforms)
  const [showModal, setShowModal] = useState(false)
  const [editPlatform, setEditPlatform] = useState<Platform | null>(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => { setEditPlatform(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p: Platform) => {
    setEditPlatform(p)
    setForm({ icon: p.icon, name: p.name, tagline: p.tagline, link: p.link, btnLabel: p.btnLabel, desc: p.desc, color: p.color })
    setShowModal(true)
  }

  const save = () => {
    if (!form.name || !form.link) return
    if (editPlatform) {
      setPlatforms(platforms.map(p => p.id === editPlatform.id ? { ...p, ...form } : p))
    } else {
      setPlatforms([...platforms, { id: Date.now(), ...form, status: 'active', order: platforms.length + 1 }])
    }
    setShowModal(false)
  }

  const toggleStatus = (id: number) =>
    setPlatforms(platforms.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const arr = [...platforms]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    setPlatforms(arr)
  }

  const moveDown = (idx: number) => {
    if (idx === platforms.length - 1) return
    const arr = [...platforms]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    setPlatforms(arr)
  }

  const fields = [
    { key: 'icon', label: 'Icon (emoji)', placeholder: '🏢' },
    { key: 'name', label: 'Platform Name *', placeholder: 'e.g. SI Mart' },
    { key: 'tagline', label: 'Tagline', placeholder: 'e.g. Online Shopping in Bangladesh' },
    { key: 'link', label: 'Website URL *', placeholder: 'https://example.com' },
    { key: 'btnLabel', label: 'Button Label', placeholder: 'Visit Now →' },
    { key: 'color', label: 'Gradient (Tailwind)', placeholder: 'from-blue-500 to-indigo-600' },
  ]

  return (
    <AdminLayout title="Business Platforms" breadcrumb={[{ label: 'Business Platforms' }]}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">🏢 Business Platforms</h1>
            <p className="text-gray-400 text-sm mt-1">Manage all SI Group business platforms — order, visibility, links, content</p>
          </div>
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
            + Add Platform
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Platforms', value: platforms.length, icon: '🏢' },
            { label: 'Active', value: platforms.filter(p => p.status === 'active').length, icon: '✅' },
            { label: 'Inactive', value: platforms.filter(p => p.status === 'inactive').length, icon: '⏸️' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-black text-white mt-2">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Live preview hint */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">💡</span>
          <p className="text-blue-300 text-sm">
            Changes here update the <strong>Business Platforms</strong> section on the main website. Drag to reorder, toggle to show/hide.
          </p>
        </div>

        {/* Platform list */}
        <div className="space-y-3">
          {platforms.map((p, idx) => (
            <div key={p.id} className={`group bg-gray-900 border ${p.status === 'active' ? 'border-gray-700' : 'border-gray-800 opacity-60'} rounded-2xl p-5 flex items-center gap-5 transition-all`}>
              {/* Order controls */}
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-600 hover:text-white disabled:opacity-20 transition text-xs">▲</button>
                <span className="text-gray-600 text-xs text-center font-bold">{idx + 1}</span>
                <button onClick={() => moveDown(idx)} disabled={idx === platforms.length - 1} className="text-gray-600 hover:text-white disabled:opacity-20 transition text-xs">▼</button>
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {p.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-base">{p.name}</p>
                <p className="text-gray-400 text-xs">{p.tagline}</p>
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:text-blue-300 transition">{p.link}</a>
              </div>

              {/* Desc */}
              <p className="hidden lg:block text-gray-500 text-xs max-w-xs leading-relaxed flex-1">{p.desc.slice(0, 100)}…</p>

              {/* Btn label */}
              <div className="flex-shrink-0 hidden xl:block">
                <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-lg font-medium">{p.btnLabel}</span>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => toggleStatus(p.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${p.status === 'active' ? 'bg-emerald-900/60 text-emerald-400 border-emerald-800 hover:bg-red-900/60 hover:text-red-400 hover:border-red-800' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-emerald-900/60 hover:text-emerald-400 hover:border-emerald-800'}`}
                >
                  {p.status === 'active' ? '● Active' : '○ Inactive'}
                </button>
                <button onClick={() => openEdit(p)} className="text-blue-400 hover:text-blue-300 text-xs font-bold transition">Edit</button>
                <button onClick={() => setPlatforms(platforms.filter(x => x.id !== p.id))} className="text-red-500 hover:text-red-400 text-xs font-bold transition">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Save to DB button */}
        <div className="mt-8 flex items-center gap-4">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-600/20">
            💾 Save All Changes to Database
          </button>
          <p className="text-gray-500 text-xs">Changes are saved instantly to local state. Click to persist to database.</p>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-white font-black text-xl mb-6">{editPlatform ? 'Edit Platform' : 'Add New Platform'}</h2>
              <div className="space-y-4">
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="text-gray-400 text-xs mb-1.5 block font-medium">{f.label}</label>
                    <input
                      value={(form as Record<string, string>)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block font-medium">Description</label>
                  <textarea
                    value={form.desc}
                    onChange={e => setForm({ ...form, desc: e.target.value })}
                    placeholder="Platform description..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={save} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition">
                  {editPlatform ? 'Save Changes' : 'Add Platform'}
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-bold transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  )
}
