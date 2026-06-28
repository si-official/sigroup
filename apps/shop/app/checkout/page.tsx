'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useCart } from '@/context/CartContext'

export default function CheckoutPage() {
  const { items, total } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
  })

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price })),
          total,
        }),
      })
      const data = await res.json()
      if (data.GatewayPageURL) {
        window.location.href = data.GatewayPageURL
      } else {
        alert('Payment init failed. Please try again.')
      }
    } catch {
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-gray-900 mb-2">Customer Information</h3>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'আপনার নাম' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'email@example.com' },
              { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '01XXXXXXXXX' },
              { key: 'address', label: 'Address', type: 'text', placeholder: 'Dhaka, Bangladesh' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  required
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              🔒 Secure payment powered by <strong>SSLCommerz</strong> — bKash, Nagad, Cards & more
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? 'Redirecting to payment...' : `Pay ৳${total.toLocaleString()} via SSLCommerz`}
            </button>
          </form>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            {items.map(({ product }) => (
              <div key={product.id} className="flex justify-between text-sm text-gray-600 mb-3 pb-3 border-b border-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.category} · Digital Download</p>
                </div>
                <span className="font-semibold">৳{product.price.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-gray-900 text-xl mt-4">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
