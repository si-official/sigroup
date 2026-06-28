'use client'
import Link from 'next/link'
import { useStudent } from '@/context/StudentContext'

export default function Navbar() {
  const { student, logout } = useStudent()
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">SI</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">SI School</p>
            <p className="text-xs text-gray-400">school.sigroup.com.bd</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-yellow-700 text-sm font-medium">Courses</Link>
          {student ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-yellow-700 text-sm font-medium">Dashboard</Link>
              <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
            </>
          ) : (
            <Link href="/dashboard" className="bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-500 transition">
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
