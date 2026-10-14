'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAboutContent, saveAboutContent, AboutContent, TeamMember } from '@/lib/siteData'

function emptyMember(): TeamMember {
  return { id: '', name: '', role: '', photo: '', bio: '' }
}

export default function AboutPage() {
  const [data, setData] = useState<AboutContent | null>(null)
  const [saved, setSaved] = useState(false)
  const [memberModal, setMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [memberForm, setMemberForm] = useState<TeamMember>(emptyMember())
  const [countryInput, setCountryInput] = useState('')

  useEffect(() => { setData(getAboutContent()) }, [])

  if (!data) return <AdminLayout><div className="text-gray-400">Loading...</div></AdminLayout>

  function handleSave() {
    if (!data) return
    saveAboutContent(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function openAddMember() { setEditingMember(null); setMemberForm(emptyMember()); setMemberModal(true) }
  function openEditMember(m: TeamMember) { setEditingMember(m); setMemberForm({...m}); setMemberModal(true) }

  function saveMember() {
    if (!data) return
    let members: TeamMember[]
    if (editingMember) {
      members = data.teamMembers.map(m => m.id === editingMember.id ? memberForm : m)
    } else {
      members = [...data.teamMembers, { ...memberForm, id: Date.now().toString() }]
    }
    setData({ ...data, teamMembers: members })
    setMemberModal(false)
  }

  function deleteMember(id: string) {
    if (!data) return
    setData({ ...data, teamMembers: data.teamMembers.filter(m => m.id !== id) })
  }

  function addCountry() {
    if (!countryInput.trim() || !data) return
    if (!data.countries.includes(countryInput.trim())) {
      setData({ ...data, countries: [...data.countries, countryInput.trim()] })
    }
    setCountryInput('')
  }

  function removeCountry(c: string) {
    if (!data) return
    setData({ ...data, countries: data.countries.filter(x => x !== c) })
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">About Section</h1>
            <p className="text-gray-400 text-sm mt-0.5">Edit company information</p>
          </div>
          <button onClick={handleSave} className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Company Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">About</label>
                <textarea rows={4} value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Mission</label>
                <textarea rows={2} value={data.mission} onChange={e => setData({...data, mission: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Vision</label>
                <textarea rows={2} value={data.vision} onChange={e => setData({...data, vision: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Company Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'years', label: 'Years' },
                { key: 'clients', label: 'Clients' },
                { key: 'projects', label: 'Projects' },
                { key: 'teamSize', label: 'Team Size' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                  <input
                    type="number"
                    value={data.stats[key as keyof typeof data.stats]}
                    onChange={e => setData({ ...data, stats: { ...data.stats, [key]: Number(e.target.value) } })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Team Members</h2>
              <button onClick={openAddMember} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">+ Add Member</button>
            </div>
            <div className="space-y-3">
              {data.teamMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-gray-400 text-xs">{m.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditMember(m)} className="text-xs text-gray-400 hover:text-gray-200">Edit</button>
                    <button onClick={() => deleteMember(m.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Countries Served</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {data.countries.map(c => (
                <span key={c} className="flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                  {c}
                  <button onClick={() => removeCountry(c)} className="text-gray-500 hover:text-red-400 transition-colors">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={countryInput} onChange={e => setCountryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCountry())} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Add country..." />
              <button onClick={addCountry} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition-colors">Add</button>
            </div>
          </div>
        </div>
      </div>

      {memberModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">{editingMember ? 'Edit Member' : 'Add Team Member'}</h2>
              <button onClick={() => setMemberModal(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                <input value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                <input value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="CEO, Developer, etc." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Photo URL</label>
                <input value={memberForm.photo} onChange={e => setMemberForm({...memberForm, photo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
                <textarea rows={3} value={memberForm.bio} onChange={e => setMemberForm({...memberForm, bio: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none" placeholder="Short bio..." />
              </div>
            </div>
            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button onClick={() => setMemberModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={saveMember} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
