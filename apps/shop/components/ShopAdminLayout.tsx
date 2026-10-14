'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getShopAdmin } from '@/lib/shopAdminAuth'
import ShopAdminSidebar from './ShopAdminSidebar'
import ShopAdminTopBar from './ShopAdminTopBar'

export default function ShopAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const admin = getShopAdmin()
    if (!admin) {
      router.replace('/admin')
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#1d2129] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#82b541] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ShopAdminSidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <ShopAdminTopBar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
