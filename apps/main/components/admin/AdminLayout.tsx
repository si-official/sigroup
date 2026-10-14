'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminUser } from '@/lib/adminAuth'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'

interface Props {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const user = getAdminUser()
    if (!user) {
      router.replace('/admin')
      return
    }
    const saved = localStorage.getItem('si_admin_dark')
    if (saved !== null) setDarkMode(saved === 'true')
    setReady(true)
  }, [router])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('si_admin_dark', String(darkMode))
  }, [darkMode])

  function toggleDark() {
    setDarkMode(p => !p)
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-purple-500 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <AdminSidebar darkMode={darkMode} toggleDark={toggleDark} />
        <AdminTopBar darkMode={darkMode} toggleDark={toggleDark} />
        <main className="ml-[260px] pt-14 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
