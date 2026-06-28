'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { api, Project } from '@/lib/portalApi'

const statusColor: Record<string, string> = {
  completed: 'bg-green-900 text-green-300',
  in_progress: 'bg-blue-900 text-blue-300',
  review: 'bg-yellow-900 text-yellow-300',
  pending: 'bg-gray-800 text-gray-400',
  on_hold: 'bg-red-900 text-red-300',
}

// Mock data for UI preview (replaced by API on live)
const mockProjects: Project[] = [
  { id: 1, title: 'SI Group Website Redesign', status: 'in_progress', progress: 65, deadline: '2024-08-15', budget: 150000, manager: 'Rahul Dev', description: 'Full website overhaul with new branding', milestones: [
    { id: 1, title: 'Design Mockups', completed: true, due_date: '2024-06-01' },
    { id: 2, title: 'Frontend Development', completed: true, due_date: '2024-07-01' },
    { id: 3, title: 'Backend Integration', completed: false, due_date: '2024-07-20' },
    { id: 4, title: 'Testing & Launch', completed: false, due_date: '2024-08-15' },
  ]},
  { id: 2, title: 'Mobile App Development', status: 'review', progress: 90, deadline: '2024-07-30', budget: 200000, manager: 'Nadia Dev', description: 'Android & iOS app', milestones: [] },
  { id: 3, title: 'ERP System Setup', status: 'pending', progress: 10, deadline: '2024-10-01', budget: 500000, manager: 'Karim Ahmed', description: 'Full ERP implementation', milestones: [] },
]

export default function DashboardPage() {
  const { user, token, loading, isLoggedIn } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [selected, setSelected] = useState<Project | null>(null)

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/')
  }, [loading, isLoggedIn, router])

  useEffect(() => {
    if (token) {
      api.projects(token).then(setProjects).catch(() => {}) // fallback to mock
    }
  }, [token])

  if (loading || !user) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-purple-400">Loading...</div>

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Welcome back, {user.name} 👋</h1>
          <p className="text-gray-400 mt-1">{user.company || 'SI Group Client'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Projects', value: projects.filter(p => p.status === 'in_progress').length, icon: '🚀', color: 'border-blue-800' },
            { label: 'In Review', value: projects.filter(p => p.status === 'review').length, icon: '🔍', color: 'border-yellow-800' },
            { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: '✅', color: 'border-green-800' },
            { label: 'Total Projects', value: projects.length, icon: '📁', color: 'border-purple-800' },
          ].map((s) => (
            <div key={s.label} className={`bg-gray-900 border ${s.color} rounded-2xl p-5`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <h2 className="text-lg font-bold text-white mb-4">My Projects</h2>
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-purple-700 transition"
              onClick={() => setSelected(selected?.id === p.id ? null : p)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold">{p.title}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">Manager: {p.manager} · Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[p.status] || 'bg-gray-800 text-gray-400'}`}>
                    {p.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-sm">৳{p.budget.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span><span>{p.progress}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full">
                  <div className={`h-2 rounded-full transition-all ${p.progress >= 80 ? 'bg-green-500' : p.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                    style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {/* Milestones */}
              {selected?.id === p.id && p.milestones.length > 0 && (
                <div className="mt-4 border-t border-gray-800 pt-4">
                  <p className="text-gray-400 text-xs font-semibold uppercase mb-3">Milestones</p>
                  <div className="space-y-2">
                    {p.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <span className={m.completed ? 'text-green-400' : 'text-gray-600'}>
                          {m.completed ? '✅' : '⭕'}
                        </span>
                        <span className={`text-sm ${m.completed ? 'text-gray-300 line-through' : 'text-white'}`}>{m.title}</span>
                        <span className="text-gray-500 text-xs ml-auto">{new Date(m.due_date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
