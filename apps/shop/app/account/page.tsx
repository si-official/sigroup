'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

// Mock order data — replace with API call
const mockOrders = [
  {
    id: 'SI-1719123456-ABC123',
    date: '2024-06-23',
    items: [{ name: 'HR Management System', price: 5000 }],
    total: 5000,
    status: 'paid',
    downloadToken: 'abc-token-123',
  },
  {
    id: 'SI-1719000000-XYZ789',
    date: '2024-06-15',
    items: [{ name: 'POS System', price: 4000 }, { name: 'Inventory Management', price: 3500 }],
    total: 7500,
    status: 'paid',
    downloadToken: 'xyz-token-789',
  },
]

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [orders] = useState(mockOrders)

  if (!loggedIn) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-500 text-sm mb-6">Enter your email to view your orders</p>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => email && setLoggedIn(true)}
              className="w-full bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition"
            >
              View My Orders
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">{email}</p>
          </div>
          <button onClick={() => setLoggedIn(false)} className="text-sm text-gray-500 hover:text-gray-700">
            Sign out
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-4">No orders yet</p>
            <Link href="/" className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(order.date).toLocaleDateString('bn-BD')}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-semibold text-gray-800">৳{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
                  <span className="font-black text-gray-900">Total: ৳{order.total.toLocaleString()}</span>
                  {order.status === 'paid' && (
                    <a
                      href={`/api/download/${order.id}?token=${order.downloadToken}`}
                      className="bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition"
                    >
                      ⬇ Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
