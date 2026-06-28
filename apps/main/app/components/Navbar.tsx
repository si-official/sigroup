'use client'
import { useState } from 'react'
import Link from 'next/link'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Partnership', href: '#partnership' },
  { label: 'Presence', href: '#presence' },
  { label: 'Contact', href: '#footer' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-lg">SI</span>
          </div>
          <div>
            <p className="font-bold text-blue-900 text-lg leading-none">SI Group</p>
            <p className="text-xs text-gray-500">sigroup.com.bd</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-gray-600 hover:text-blue-900 font-medium transition text-sm">
              {l.label}
            </a>
          ))}
          <a href="https://portal.sigroup.com.bd" className="bg-blue-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-800 transition">
            Portal
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-gray-700 font-medium py-1">
              {l.label}
            </a>
          ))}
          <a href="https://portal.sigroup.com.bd" className="block bg-blue-900 text-white px-5 py-2 rounded-full text-sm font-semibold text-center">
            Portal
          </a>
        </div>
      )}
    </nav>
  )
}
