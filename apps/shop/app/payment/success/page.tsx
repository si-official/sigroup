'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useCart } from '@/context/CartContext'
import { useEffect } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const tranId = params.get('tran_id')
  const { clearCart } = useCart()

  useEffect(() => { clearCart() }, [clearCart])

  const downloadUrl = `/api/download/${tranId}?token=${token}`

  return (
    <div className="max-w-lg mx-auto text-center py-20 px-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-5xl">✅</span>
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-3">Payment Successful!</h1>
      <p className="text-gray-500 mb-2">Transaction ID: <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">{tranId}</code></p>
      <p className="text-gray-500 mb-8">Your download is ready. This link expires in 24 hours.</p>

      <a
        href={downloadUrl}
        className="block w-full bg-green-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition mb-4"
      >
        ⬇ Download Your Files
      </a>

      <p className="text-gray-400 text-sm mb-6">Download link also sent to your email</p>

      <Link href="/account" className="text-green-700 font-semibold hover:underline">
        View Order History →
      </Link>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </>
  )
}
