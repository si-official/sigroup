'use client'
import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCourseBySlug } from '@/lib/courses'
import { useStudent } from '@/context/StudentContext'

export default function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const course = getCourseBySlug(slug)
  const { saveQuizScore, isEnrolled } = useStudent()
  const router = useRouter()

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [showResult, setShowResult] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  if (!course) notFound()
  if (!isEnrolled(course.id)) { router.push(`/courses/${slug}`); return null }

  const questions = course.quiz
  const q = questions[current]

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selected]
    if (current < questions.length - 1) {
      setAnswers(newAnswers)
      setSelected(null)
      setShowExplanation(false)
      setCurrent(current + 1)
    } else {
      const correct = newAnswers.filter((a, i) => a === questions[i].correctIndex).length
      const score = Math.round((correct / questions.length) * 100)
      saveQuizScore(course.id, score)
      setAnswers(newAnswers)
      setShowResult(true)
    }
  }

  if (showResult) {
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= 70
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">{passed ? '🏆' : '📚'}</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          <p className="text-gray-500 mb-6">
            {correct}/{questions.length} correct — {score}%
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-4 rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${score}%` }} />
            </div>
            <p className={`text-sm font-bold mt-2 ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
              {passed ? '✅ Passed (70% required)' : '⚠️ Need 70% to pass'}
            </p>
          </div>
          <div className="flex gap-3">
            {passed && (
              <Link href={`/certificate/${course.id}`}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition text-sm">
                Get Certificate 🏆
              </Link>
            )}
            <Link href={`/courses/${slug}/learn`}
              className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-bold hover:bg-yellow-500 transition text-sm">
              {passed ? 'Back to Course' : 'Retry Quiz'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8">
        {/* Progress */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-semibold text-gray-500">Question {current + 1} of {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i < current ? 'bg-yellow-500' : i === current ? 'bg-yellow-300' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">{q.question}</h2>

        <div className="space-y-3 mb-6">
          {q.options.map((opt, idx) => {
            let cls = 'border-2 border-gray-100 hover:border-yellow-300 bg-white'
            if (selected !== null) {
              if (idx === q.correctIndex) cls = 'border-2 border-green-500 bg-green-50'
              else if (idx === selected) cls = 'border-2 border-red-400 bg-red-50'
              else cls = 'border-2 border-gray-100 bg-gray-50 opacity-50'
            }
            return (
              <button key={idx} onClick={() => handleSelect(idx)}
                className={`w-full text-left px-5 py-4 rounded-xl transition font-medium text-gray-800 ${cls}`}>
                <span className="inline-block w-7 h-7 bg-gray-100 rounded-lg text-center text-sm mr-3 font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {showExplanation && (
          <div className={`rounded-xl p-4 mb-6 text-sm ${selected === q.correctIndex ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-bold mb-1">{selected === q.correctIndex ? '✅ Correct!' : '❌ Incorrect'}</p>
            <p>{q.explanation}</p>
          </div>
        )}

        {selected !== null && (
          <button onClick={handleNext}
            className="w-full bg-yellow-600 text-white py-3.5 rounded-xl font-bold hover:bg-yellow-500 transition">
            {current < questions.length - 1 ? 'Next Question →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}
