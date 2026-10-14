'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSchoolAdmin, SchoolAdmin } from '@/lib/schoolAdminAuth'
import SchoolAdminSidebar from './SchoolAdminSidebar'
import SchoolAdminTopBar from './SchoolAdminTopBar'

interface Props {
  children: React.ReactNode
  breadcrumb: string
}

export default function SchoolAdminLayout({ children, breadcrumb }: Props) {
  const router = useRouter()
  const [admin, setAdmin] = useState<SchoolAdmin | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const a = getSchoolAdmin()
    if (!a) {
      router.replace('/admin')
    } else {
      setAdmin(a)
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-[#1CAB87] text-lg font-bold animate-pulse">লোড হচ্ছে...</div>
      </div>
    )
  }

  if (!admin) return null

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0d1117]">
        <SchoolAdminSidebar darkMode={darkMode} setDarkMode={setDarkMode} admin={admin} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SchoolAdminTopBar breadcrumb={breadcrumb} admin={admin} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
