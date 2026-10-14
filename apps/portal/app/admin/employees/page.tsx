'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Employee, DEFAULT_EMPLOYEES, Role, ROLE_COLORS } from '@/lib/adminData'

const STORAGE_KEY = 'si_admin_employees'
const departments = ['Management', 'Operations', 'Sales', 'Technology', 'Support', 'Finance', 'Marketing']
const roles: Role[] = ['super_admin', 'admin', 'manager', 'staff', 'partner', 'client']

const emptyForm: Omit<Employee, 'id' | 'permissions'> = {
  name: '', email: '', phone: '', role: 'staff', department: 'Sales',
  status: 'active', salary: 30000, joinDate: new Date().toISOString().slice(0, 10),
}

function StatusBadge({ status }: { status: Employee['status'] }) {
  const map = {
    active: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    on_leave: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${map[status]}`}>{status.replace('_', ' ')}</span>
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    setEmployees(saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES)
  }, [])

  const save = (list: Employee[]) => {
    setEmployees(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase()
    return (
      (!q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) &&
      (!filterDept || e.department === filterDept) &&
      (!filterRole || e.role === filterRole) &&
      (!filterStatus || e.status === filterStatus)
    )
  })

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (emp: Employee) => {
    setEditId(emp.id)
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, role: emp.role, department: emp.department, status: emp.status, salary: emp.salary, joinDate: emp.joinDate })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.email) return
    if (editId) {
      save(employees.map((e) => e.id === editId ? { ...e, ...form } : e))
    } else {
      save([...employees, { id: `e${Date.now()}`, ...form, permissions: [] }])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    save(employees.filter((e) => e.id !== id))
    setDeleteId(null)
  }

  const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <AdminLayout title="Employees" breadcrumb={[{ label: 'Employees' }]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">👥 Employee Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{employees.length} total employees</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-xl text-sm transition">
            📤 Export
          </button>
          <button onClick={openAdd} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition">
            + Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: employees.length, color: 'text-purple-600' },
          { label: 'Active', value: employees.filter(e => e.status === 'active').length, color: 'text-emerald-600' },
          { label: 'On Leave', value: employees.filter(e => e.status === 'on_leave').length, color: 'text-amber-600' },
          { label: 'Inactive', value: employees.filter(e => e.status === 'inactive').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 min-w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-400"
        />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Roles</option>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          <option>active</option><option>inactive</option><option>on_leave</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Salary</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {initials(emp.name)}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">{emp.name}</p>
                      <p className="text-gray-500 text-xs">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">{emp.department}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[emp.role]}`}>
                    {emp.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm font-medium">৳{emp.salary.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{emp.joinDate}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(emp)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold mr-3">Edit</button>
                  <button onClick={() => setDeleteId(emp.id)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-gray-900 dark:text-white font-black text-lg mb-5">{editId ? 'Edit Employee' : 'Add New Employee'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Rahim Uddin' },
                { key: 'email', label: 'Email *', type: 'email', placeholder: 'rahim@sigroup.com.bd' },
                { key: 'phone', label: 'Phone', type: 'text', placeholder: '01700000000' },
                { key: 'salary', label: 'Salary (৳)', type: 'number', placeholder: '30000' },
                { key: 'joinDate', label: 'Join Date', type: 'date', placeholder: '' },
              ].map((f) => (
                <div key={f.key} className={f.key === 'name' || f.key === 'email' ? 'col-span-2' : ''}>
                  <label className="text-gray-500 text-xs mb-1 block font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    value={String((form as Record<string, unknown>)[f.key] ?? '')}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-gray-500 text-xs mb-1 block font-medium">Department</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block font-medium">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {roles.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500 text-xs mb-1 block font-medium">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Employee['status'] })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold transition">{editId ? 'Save Changes' : 'Add Employee'}</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-gray-900 dark:text-white font-black text-lg mb-2">Delete Employee?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-bold transition">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
