'use client'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const { count } = useCart()
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">SI</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">SI Shop</p>
            <p className="text-xs text-gray-400">shop.sigroup.com.bd</p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-green-700 text-sm font-medium">Products</Link>
          <Link href="/account" className="text-gray-600 hover:text-green-700 text-sm font-medium">My Orders</Link>
          <Link href="/cart" className="relative bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition">
            🛒 Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
