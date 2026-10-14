'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const links = [
  { label: 'Home',      href: '#home' },
  { label: 'About',     href: '#about' },
  { label: 'Platforms', href: '#platforms' },
  { label: 'SI Shop',   href: '#shop' },
  { label: 'Software',  href: '#software-market' },
  { label: 'SI School', href: '#school' },
  { label: 'Contact',   href: '#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-black/95 backdrop-blur-xl shadow-lg shadow-black/50 border-b border-white/10'
        : 'bg-black/80 backdrop-blur-md border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo — circular icon + GROUP text */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-600/30 blur-md group-hover:bg-red-600/50 transition-all duration-300" />
            <img
              src="/si-group-icon.png"
              alt="SI"
              className="relative h-10 w-10 rounded-full object-cover shadow-xl shadow-black/60 ring-2 ring-white/10 group-hover:ring-red-500/50 transition-all duration-300"
            />
          </div>
          <div className="hidden sm:block leading-none">
            <span className="font-black text-lg tracking-widest text-white drop-shadow-lg" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
              GROUP
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="relative px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200 select-none"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center flex-shrink-0">
          <a
            href="https://portal.sigroup.com.bd"
            className="bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white px-5 py-2 rounded-xl text-sm font-black transition-all shadow-lg shadow-red-600/40 hover:shadow-red-600/60 hover:-translate-y-0.5 border border-white/20 whitespace-nowrap"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)', boxShadow: '0 4px 0 rgba(100,0,0,0.5), 0 2px 12px rgba(220,38,38,0.4)' }}
          >
            Client Portal ↗
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-white/10 transition flex-shrink-0"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 rounded-full transition-all duration-300 bg-white ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 rounded-full transition-all duration-300 bg-white ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 rounded-full transition-all duration-300 bg-white ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/98 border-t border-white/10 px-5 py-4 space-y-2 shadow-2xl">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center font-semibold py-2.5 px-4 rounded-xl transition-all text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href="https://portal.sigroup.com.bd"
              className="block bg-gradient-to-b from-red-500 to-red-700 text-white px-5 py-3 rounded-xl text-sm font-black text-center transition shadow-lg border border-white/20"
            >
              Client Portal ↗
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
