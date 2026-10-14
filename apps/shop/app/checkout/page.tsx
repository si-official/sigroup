'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useCart } from '@/context/CartContext'

type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'bank'

const paymentMethods = [
  { id: 'bkash' as PaymentMethod, label: 'bKash', icon: '📱', color: 'border-pink-200 bg-pink-50', activeColor: 'border-pink-500 bg-pink-50 ring-2 ring-pink-300', desc: 'Pay via bKash mobile banking' },
  { id: 'nagad' as PaymentMethod, label: 'Nagad', icon: '💳', color: 'border-orange-200 bg-orange-50', activeColor: 'border-orange-500 bg-orange-50 ring-2 ring-orange-300', desc: 'Pay via Nagad mobile banking' },
  { id: 'card' as PaymentMethod, label: 'Card (SSLCommerz)', icon: '💳', color: 'border-blue-200 bg-blue-50', activeColor: 'border-blue-500 bg-blue-50 ring-2 ring-blue-300', desc: 'Visa, Mastercard, AMEX' },
  { id: 'bank' as PaymentMethod, label: 'Bank Transfer', icon: '🏦', color: 'border-gray-200 bg-gray-50', activeColor: 'border-gray-500 bg-gray-50 ring-2 ring-gray-400', desc: 'Direct bank transfer' },
]

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [method, setMethod] = useState<PaymentMethod>('bkash')
  const [form, setForm] = useState({ name: '', email: '', phone: '', trxId: '' })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <Link href="/" className="bg-[#82b541] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#6fa033] transition inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required'
    if (!form.phone.trim() || form.phone.length < 11) e.phone = 'Valid phone number required'
    if ((method === 'bkash' || method === 'nagad') && !form.trxId.trim()) e.trxId = 'Transaction ID is required'
    if (!agreed) e.agreed = 'Please accept the terms'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      clearCart?.()
    }, 1800)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
            <div className="w-20 h-20 bg-[#82b541]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-1">Thank you, <strong>{form.name}</strong>!</p>
            <p className="text-gray-500 mb-6">Your order has been received. Download links will be sent to <strong>{form.email}</strong> within 15 minutes after payment verification.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-bold text-gray-900">ORD-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-black text-[#82b541]">৳{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium capitalize text-gray-900">{method}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/customer/dashboard" className="bg-[#82b541] hover:bg-[#6fa033] text-white font-bold py-3 rounded-lg transition">
                View My Downloads
              </Link>
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm transition">
                Continue Shopping →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const bkashNumber = '01712345678'
  const nagadNumber = '01812345678'

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: form */}
            <div className="lg:col-span-3 space-y-5">

              {/* Billing info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Billing Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', cols: 2 },
                    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'email@example.com', cols: 1 },
                    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '01XXXXXXXXX', cols: 1 },
                  ].map(f => (
                    <div key={f.key} className={f.cols === 2 ? 'col-span-2' : ''}>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none transition ${errors[f.key] ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#82b541]'}`}
                      />
                      {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {paymentMethods.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setMethod(pm.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border-2 transition text-left ${method === pm.id ? pm.activeColor : pm.color + ' hover:border-gray-300'}`}
                    >
                      <span className="text-xl">{pm.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{pm.label}</p>
                        <p className="text-xs text-gray-500">{pm.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* bKash instructions */}
                {method === 'bkash' && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-bold text-pink-800">bKash Payment Instructions</p>
                    <ol className="text-sm text-pink-700 space-y-1 list-decimal list-inside">
                      <li>Open bKash app → Send Money</li>
                      <li>Enter merchant number: <strong className="font-mono">{bkashNumber}</strong></li>
                      <li>Amount: <strong>৳{total.toLocaleString()}</strong></li>
                      <li>Reference: <strong>SISHOP</strong></li>
                      <li>Complete and note the Transaction ID</li>
                    </ol>
                    <div>
                      <label className="block text-sm font-bold text-pink-800 mb-1.5">bKash Transaction ID *</label>
                      <input
                        value={form.trxId}
                        onChange={e => setForm({ ...form, trxId: e.target.value })}
                        placeholder="e.g., 8N3A4B2C1D"
                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-white ${errors.trxId ? 'border-red-300' : 'border-pink-200 focus:border-pink-400'}`}
                      />
                      {errors.trxId && <p className="text-xs text-red-500 mt-1">{errors.trxId}</p>}
                    </div>
                  </div>
                )}

                {/* Nagad instructions */}
                {method === 'nagad' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-bold text-orange-800">Nagad Payment Instructions</p>
                    <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                      <li>Open Nagad app → Send Money</li>
                      <li>Enter number: <strong className="font-mono">{nagadNumber}</strong></li>
                      <li>Amount: <strong>৳{total.toLocaleString()}</strong></li>
                      <li>Complete and note your Transaction ID</li>
                    </ol>
                    <div>
                      <label className="block text-sm font-bold text-orange-800 mb-1.5">Nagad Transaction ID *</label>
                      <input
                        value={form.trxId}
                        onChange={e => setForm({ ...form, trxId: e.target.value })}
                        placeholder="e.g., NAG-XXXXXXXXX"
                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none bg-white ${errors.trxId ? 'border-red-300' : 'border-orange-200 focus:border-orange-400'}`}
                      />
                      {errors.trxId && <p className="text-xs text-red-500 mt-1">{errors.trxId}</p>}
                    </div>
                  </div>
                )}

                {/* Card */}
                {method === 'card' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔒</span>
                      <p className="text-sm font-bold text-blue-800">Secure Card Payment via SSLCommerz</p>
                    </div>
                    <p className="text-sm text-blue-700">You'll be redirected to SSLCommerz secure payment page after clicking "Complete Purchase". Supports Visa, Mastercard, and all major BD bank cards.</p>
                  </div>
                )}

                {/* Bank transfer */}
                {method === 'bank' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-bold text-gray-800 mb-2">Bank Transfer Details</p>
                    <div className="text-sm text-gray-700 space-y-1 font-mono bg-white border border-gray-100 rounded p-3">
                      <p>Bank: <strong>Dutch Bangla Bank Ltd</strong></p>
                      <p>Account: <strong>1234567890123</strong></p>
                      <p>Name: <strong>SI Group Bangladesh</strong></p>
                      <p>Branch: <strong>Gulshan, Dhaka</strong></p>
                      <p>Routing: <strong>090275477</strong></p>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Transaction / Reference ID *</label>
                      <input
                        value={form.trxId}
                        onChange={e => setForm({ ...form, trxId: e.target.value })}
                        placeholder="Bank transaction reference"
                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none ${errors.trxId ? 'border-red-300' : 'border-gray-200 focus:border-gray-400'}`}
                      />
                      {errors.trxId && <p className="text-xs text-red-500 mt-1">{errors.trxId}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#82b541]"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to SI Shop's{' '}
                    <a href="#" className="text-[#82b541] hover:underline">Terms of Service</a>,{' '}
                    <a href="#" className="text-[#82b541] hover:underline">Refund Policy</a>, and the product's license terms.
                    Digital products are non-refundable once downloaded.
                  </span>
                </label>
                {errors.agreed && <p className="text-xs text-red-500 mt-1 ml-7">{errors.agreed}</p>}
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-[100px]">
                <h3 className="font-black text-gray-900 text-lg mb-4">Order Summary</h3>

                <div className="space-y-3 mb-4">
                  {items.map(({ product }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="w-14 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{product.category.replace('-', ' ')} · Digital Download</p>
                      </div>
                      <span className="font-bold text-gray-900 flex-shrink-0 text-sm">
                        {product.price === 0 ? 'Free' : `৳${product.price.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>VAT / Tax</span>
                    <span>৳0</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 text-lg">
                    <span>Total</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#82b541] hover:bg-[#6fa033] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-4 rounded-lg transition text-base shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Complete Purchase — ৳${total.toLocaleString()}`
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span>🔒 256-bit SSL</span>
                  <span>•</span>
                  <span>📥 Instant Download</span>
                  <span>•</span>
                  <span>✉️ Email Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
