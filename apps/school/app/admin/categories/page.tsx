'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'
import { courses } from '@/lib/data'

interface Category {
  id: string
  name: string
  nameBn: string
  icon: string
  status: 'active' | 'inactive'
}

const initialCategories: Category[] = [
  { id: '1', name: 'Academic', nameBn: 'একাডেমিক', icon: '📚', status: 'active' },
  { id: '2', name: 'Programming', nameBn: 'প্রোগ্রামিং', icon: '💻', status: 'active' },
  { id: '3', name: 'Design', nameBn: 'ডিজাইন', icon: '🎨', status: 'active' },
  { id: '4', name: 'Language', nameBn: 'ভাষা', icon: '🌐', status: 'active' },
  { id: '5', name: 'Business', nameBn: 'ব্যবসা', icon: '💼', status: 'active' },
  { id: '6', name: 'Skills', nameBn: 'দক্ষতা', icon: '🛠', status: 'active' },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNameBn, setNewNameBn] = useState('')
  const [newIcon, setNewIcon] = useState('📂')

  const courseCount = (name: string) => courses.filter(c => c.category.toLowerCase().includes(name.toLowerCase())).length

  const addCategory = () => {
    if (!newName || !newNameBn) return
    setCategories(prev => [...prev, {
      id: Date.now().toString(),
      name: newName, nameBn: newNameBn, icon: newIcon, status: 'active'
    }])
    setNewName(''); setNewNameBn(''); setNewIcon('📂'); setShowAdd(false)
  }

  const toggleStatus = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c))
  }

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <SchoolAdminLayout breadcrumb="ক্যাটাগরি">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">ক্যাটাগরি</h1>
          <button onClick={() => setShowAdd(true)}
            className="bg-[#1CAB87] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#17976d] transition">
            + নতুন ক্যাটাগরি
          </button>
        </div>

        {showAdd && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-[#1CAB87]/30 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white">নতুন ক্যাটাগরি যোগ করুন</h3>
            <div className="grid grid-cols-3 gap-3">
              <input value={newNameBn} onChange={e => setNewNameBn(e.target.value)} placeholder="বাংলা নাম"
                className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30" />
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="English Name"
                className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30" />
              <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="আইকন (emoji)"
                className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1CAB87] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30" />
            </div>
            <div className="flex gap-2">
              <button onClick={addCategory} className="bg-[#1CAB87] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#17976d] transition">যোগ করুন</button>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white/60 text-sm transition px-3 py-2">বাতিল</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className={`bg-white dark:bg-[#161b22] rounded-xl border shadow-sm p-5 ${cat.status === 'inactive' ? 'border-gray-100 dark:border-white/5 opacity-60' : 'border-gray-100 dark:border-white/10'}`}>
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{cat.nameBn}</h3>
              <p className="text-gray-400 dark:text-white/40 text-xs mb-1">{cat.name}</p>
              <p className="text-[#1CAB87] text-xs font-semibold mb-3">{courseCount(cat.name)}টি কোর্স</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40'}`}>
                  {cat.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
                <button onClick={() => toggleStatus(cat.id)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition">টগল</button>
                <button onClick={() => deleteCategory(cat.id)} className="text-xs text-red-400 hover:text-red-600 transition ml-auto">মুছুন</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
