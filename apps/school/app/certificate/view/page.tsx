'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStudent } from '@/context/StudentContext'
import { courses } from '@/lib/courses'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

function CertificateContent() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('id') ?? ''
  const { student, getProgress } = useStudent()
  const course = courses.find((c) => c.id === courseId)
  const progress = getProgress(courseId)

  if (!student || !course || !progress?.certificateIssued) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto text-center py-20 px-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Certificate Not Available</h1>
          <p className="text-gray-500 mb-6">Complete the course and pass the quiz (70%+) to get your certificate.</p>
          <Link href="/dashboard" className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition">
            Go to Dashboard
          </Link>
        </div>
      </>
    )
  }

  const issueDate = new Date(progress.enrolledAt).toLocaleDateString('en-BD', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const certId = `SI-CERT-${course.id}-${student.id.slice(-6).toUpperCase()}`

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-6">
          <button
            onClick={() => window.print()}
            className="bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-500 transition mr-3"
          >
            🖨 Print / Save PDF
          </button>
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
        </div>

        <div id="certificate" className="bg-white border-8 border-yellow-600 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl print:shadow-none">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-40 h-40 border-8 border-yellow-600 rounded-full" />
            <div className="absolute bottom-10 right-10 w-40 h-40 border-8 border-yellow-600 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-4 border-yellow-600 rounded-full" />
          </div>

          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-2xl">SI</span>
              </div>
            </div>
            <p className="text-yellow-600 font-semibold text-sm uppercase tracking-[0.3em] mb-2">SI School — sigroup.com.bd</p>

            <h1 className="text-5xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Certificate
            </h1>
            <p className="text-gray-500 text-lg mb-8">of Completion</p>

            <p className="text-gray-600 text-lg mb-3">This is to certify that</p>
            <h2 className="text-4xl font-black text-yellow-700 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              {student.name}
            </h2>
            <p className="text-gray-600 text-lg mb-6">has successfully completed the course</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-8 py-4 inline-block mb-8">
              <h3 className="text-2xl font-black text-gray-900">{course.title}</h3>
              <p className="text-gray-500 text-sm mt-1">Quiz Score: {progress.quizScore}% · {course.totalHours}</p>
            </div>

            <div className="flex justify-around items-end mt-4">
              <div className="text-center">
                <div className="w-32 border-t-2 border-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">MD. Shahidul Islam</p>
                <p className="text-xs text-gray-400">Course Director, SI Group</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">🏆</div>
                <p className="text-xs text-gray-400 font-mono">{certId}</p>
                <p className="text-xs text-gray-400">Issued: {issueDate}</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-t-2 border-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">SI School</p>
                <p className="text-xs text-gray-400">school.sigroup.com.bd</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CertificateContent />
    </Suspense>
  )
}
