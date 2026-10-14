'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Department, DEFAULT_DEPARTMENTS } from '@/lib/adminData'

const STORAGE_KEY = 'si_admin_departments'

const emptyForm: Omit<Department, 'id'> = {
  name: '', head: '', memberCount: 0, description: '', budget: 0, status: 'active',
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    setDepartments(saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS)
  }, [])

  const persist = (list: Department[]) => {
    setDepartments(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (d: Department) => {
    setEditId(d.id)
    setForm({ name: d.name, head: d.head, memberCount: d.memberCount, description: d.description, budget: d.budget, status: d.status })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name) return
    if (editId) {
      persist(departments.map((d) => d.id === editId ? { ...d, ...form } : d))
    } else {
      persist([...departments, { id: `d${Date.now()}`, ...form }])
    }
    setShowModal(false)
  }

  const toggleStatus = (id: string) => {
    persist(departments.map((d) => d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d))
  }

  return (
    <AdminLayout title="Departments" breadcrumb={[{ label: 'Departments' }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">🏗️ Departments</h1>
          <p className="text-gray-500 text-sm mt-0.5">{departments.length} departments</p>
        </div>
        <button onClick={openAdd} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition">
          + Add Department
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: departments.length, icon: '🏗️' },
          { label: 'Active', value: departments.filter(d => d.status === 'active').length, icon: '✅' },
          { label: 'Total Budget', value: `৳${departments.reduce((s, d) => s + d.budget, 0).toLocaleString()}`, icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className={`bg-white dark:bg-gray-900 border rounded-xl p-5 transition ${dept.status === 'active' ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200 dark:border-gray-800 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-gray-900 dark:text-white font-black text-base">{dept.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">Head: <span className="text-purple-600 dark:text-purple-400 font-semibold">{dept.head}</span></p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${dept.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {dept.status}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-4">{dept.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-900 dark:text-white font-black text-lg">{dept.memberCount}</p>
                <p className="text-gray-500 text-xs">Members</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-900 dark:text-white font-black text-base">৳{dept.budget.toLocaleString()}</p>
                <p className="text-gray-500 text-xs">Budget/mo</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEdit(dept)} className="flex-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 py-2 rounded-lg font-bold transition">Edit</button>
              <button onClick={() => toggleStatus(dept.id)} className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 rounded-lg font-bold transition">
                {dept.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => setDeleteId(dept.id)} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 px-3 py-2 rounded-lg font-bold transition">🗑</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-gray-900 dark:text-white font-black text-lg mb-5">{editId ? 'Edit Department' : 'Add Department'}</h2>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Department Name *', type: 'text', placeholder: 'e.g. Marketing' },
                { key: 'head', label: 'Department Head', type: 'text', placeholder: 'e.g. Fatema Khatun' },
                { key: 'memberCount', label: 'Member Count', type: 'number', placeholder: '0' },
                { key: 'budget', label: 'Monthly Budget (৳)', type: 'number', placeholder: '100000' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-gray-500 text-xs mb-1 block font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    value={String((form as Record<string, unknown>)[f.key] ?? '')}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-gray-500 text-xs mb-1 block font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block font-medium">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Department['status'] })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold transition">{editId ? 'Save Changes' : 'Add Department'}</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-80 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-gray-900 dark:text-white font-black mb-2">Delete Department?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { persist(departments.filter(d => d.id !== deleteId)); setDeleteId(null) }} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-bold transition">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
