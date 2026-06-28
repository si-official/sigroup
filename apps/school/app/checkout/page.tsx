/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { courses } from '@/lib/courses'
import { useStudent } from '@/context/StudentContext'
import Link from 'next/link'

function CheckoutContent() {
  const params = useSearchParams()
  const courseId = params.get('course')
  const course = courses.find((c) => c.id === courseId)
  const { student, enroll, isEnrolled } = useStudent()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: student?.name ?? '', email: student?.email ?? '', phone: '' })

  if (!course) return <div className="text-center py-20 text-gray-500">Course not found</div>
  if (isEnrolled(course.id)) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-6">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Already Enrolled!</h2>
        <Link href={`/courses/${course.slug}/learn`} className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition">
          Continue Learning →
        </Link>
      </div>
    )
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, courseId: course.id, amount: course.price, productName: course.title }),
      })
      const data = await res.json()
      if (data.GatewayPageURL) {
        window.location.href = data.GatewayPageURL
      } else {
        alert('Payment failed to initialize')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Enroll in Course</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handlePay} className="space-y-4">
          <h3 className="font-bold text-gray-900">Your Information</h3>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'আপনার নাম' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
            { key: 'phone', label: 'Phone', type: 'tel', placeholder: '01XXXXXXXXX' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            🔒 Secure payment via <strong>SSLCommerz</strong> — bKash, Nagad, Card
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-yellow-500 transition disabled:opacity-50">
            {loading ? 'Redirecting...' : `Pay ৳${course.price.toLocaleString()}`}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
          <div className="bg-yellow-50 rounded-xl h-36 flex items-center justify-center mb-4 text-5xl">🎓</div>
          <h3 className="font-black text-gray-900 mb-1">{course.title}</h3>
          <p className="text-gray-500 text-sm mb-4">by {course.instructor}</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li>✅ {course.totalHours} video content</li>
            <li>✅ {course.totalLessons} lessons</li>
            <li>✅ Quiz + Certificate</li>
            <li>✅ Lifetime access</li>
          </ul>
          <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-xl">
            <span>Total</span>
            <span>৳{course.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </>
  )
}
