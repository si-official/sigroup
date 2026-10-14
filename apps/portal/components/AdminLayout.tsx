'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import AdminSidebar from '@/components/AdminSidebar'
import TopBar from '@/components/TopBar'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  breadcrumb?: { label: string; href?: string }[]
}

export default function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  const { currentAdmin, authLoading, sidebarCollapsed } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && currentAdmin === null) {
      router.push('/')
    }
  }, [authLoading, currentAdmin, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!currentAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <AdminSidebar />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-[280px]'
        }`}
      >
        <TopBar title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
