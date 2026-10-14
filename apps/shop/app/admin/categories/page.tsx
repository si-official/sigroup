'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { Plus, Edit2, Trash2, Tag, Package, Code, Smartphone, Puzzle, FileCode, Layout } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  productCount: number
  color: string
}

const defaultCategories: Category[] = [
  { id: 'c1', name: 'Software', slug: 'software', icon: 'Code', description: 'Full software systems — ERP, POS, HMS, CRM', productCount: 3, color: 'bg-blue-500' },
  { id: 'c2', name: 'Mobile Apps', slug: 'mobile-app', icon: 'Smartphone', description: 'Flutter & Android apps with source code', productCount: 2, color: 'bg-purple-500' },
  { id: 'c3', name: 'Templates', slug: 'template', icon: 'Layout', description: 'React, Next.js, HTML admin & landing templates', productCount: 2, color: 'bg-pink-500' },
  { id: 'c4', name: 'Plugins', slug: 'plugin', icon: 'Puzzle', description: 'WordPress, WooCommerce & Laravel packages', productCount: 2, color: 'bg-orange-500' },
  { id: 'c5', name: 'Scripts', slug: 'script', icon: 'FileCode', description: 'PHP scripts, utilities and lightweight tools', productCount: 1, color: 'bg-teal-500' },
  { id: 'c6', name: 'UI Kits', slug: 'ui-kit', icon: 'Package', description: 'Figma, HTML & React UI component kits', productCount: 1, color: 'bg-indigo-500' },
]

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Code, Smartphone, Layout, Puzzle, FileCode, Package,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState(defaultCategories)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: 'Code', color: 'bg-blue-500' })

  function openAdd() {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', icon: 'Code', color: 'bg-blue-500' })
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon, color: cat.color })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c))
    } else {
      const newCat: Category = {
        id: 'c' + Date.now(),
        ...form,
        productCount: 0,
      }
      setCategories(prev => [...prev, newCat])
    }
    setShowForm(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500']

  return (
    <ShopAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{categories.length} Categories</h2>
          <p className="text-sm text-gray-500">Organize your product catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const Icon = iconMap[cat.icon] ?? Tag
          return (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${cat.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#82b541] hover:bg-[#82b541]/10 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-3">{cat.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">/{cat.slug}</span>
                <span className="text-sm font-semibold text-gray-700">{cat.productCount} products</span>
              </div>
            </div>
          )
        })}

        {/* Add card */}
        <button
          onClick={openAdd}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 hover:border-[#82b541] hover:bg-[#82b541]/5 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#82b541] min-h-[160px]"
        >
          <Plus size={24} />
          <span className="text-sm font-medium">Add Category</span>
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-semibold text-gray-900 text-lg mb-5">{editing ? 'Edit Category' : 'Add Category'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] font-mono"
                  placeholder="category-slug"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-full ${c} transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Icon</label>
                <select
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] bg-white"
                >
                  {Object.keys(iconMap).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-[#82b541] hover:bg-[#6ea032] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {editing ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ShopAdminLayout>
  )
}
