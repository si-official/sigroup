import Link from 'next/link'
import { Course } from '@/lib/types'

export default function CourseCard({ course }: { course: Course }) {
  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <Link href={`/courses/${course.slug}`}>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 h-44 flex items-center justify-center relative">
          <span className="text-6xl">🎓</span>
          {course.badge && (
            <span className="absolute top-3 left-3 bg-yellow-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">{course.badge}</span>
          )}
          {discount && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">-{discount}%</span>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex gap-2 mb-2">
          <span className="text-xs bg-yellow-50 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">{course.category}</span>
          <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{course.level}</span>
        </div>
        <Link href={`/courses/${course.slug}`}>
          <h3 className="font-bold text-gray-900 mb-1 hover:text-yellow-700 transition line-clamp-2">{course.title}</h3>
        </Link>
        <p className="text-gray-500 text-xs mb-1">by {course.instructor}</p>
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          <span className="text-yellow-500">{'★'.repeat(Math.round(course.rating))}</span>
          <span>{course.rating}</span>
          <span>·</span>
          <span>{course.students.toLocaleString()} students</span>
          <span>·</span>
          <span>{course.totalHours}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-gray-900">৳{course.price.toLocaleString()}</span>
            {course.originalPrice && (
              <span className="text-gray-400 text-sm line-through ml-2">৳{course.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <Link href={`/courses/${course.slug}`} className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500 transition">
            View →
          </Link>
        </div>
      </div>
    </div>
  )
}
