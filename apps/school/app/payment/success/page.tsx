'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useStudent } from '@/context/StudentContext'
import { courses } from '@/lib/courses'

function SuccessContent() {
  const params = useSearchParams()
  const courseId = params.get('courseId')
  const { enroll } = useStudent()
  const course = courses.find((c) => c.id === courseId)

  useEffect(() => { if (courseId) enroll(courseId) }, [courseId, enroll])

  return (
    <div className="max-w-lg mx-auto text-center py-20 px-6">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-black text-gray-900 mb-3">Enrollment Successful!</h1>
      <p className="text-gray-500 mb-6">আপনি সফলভাবে <strong>{course?.title}</strong> এ enroll করেছেন।</p>
      <Link href={`/courses/view?slug=${course?.slug}`} className="block w-full bg-yellow-600 text-white py-4 rounded-2xl font-bold hover:bg-yellow-500 transition mb-3">
        Start Learning Now →
      </Link>
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">Go to Dashboard</Link>
    </div>
  )
}

export default function PaymentSuccess() {
  return (<><Navbar /><Suspense fallback={<div className="text-center py-20">Loading...</div>}><SuccessContent /></Suspense></>)
}
