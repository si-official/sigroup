import Link from 'next/link'
import { Course } from '@/lib/types'
import { getInstructor } from '@/lib/data'

interface Props {
  course: Course
}

const badgeColors: Record<string, string> = {
  Bestseller: 'bg-yellow-400 text-yellow-900',
  New: 'bg-blue-500 text-white',
  Hot: 'bg-red-500 text-white',
  Free: 'bg-[#1CAB87] text-white',
  Featured: 'bg-purple-500 text-white',
}

export default function CourseCard({ course }: Props) {
  const instructor = getInstructor(course.instructorId)
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0

  return (
    <Link href={`/courses/${course.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.badge && (
          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold ${badgeColors[course.badge] || 'bg-gray-500 text-white'}`}>
            {course.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-[#FF6B35] text-white text-xs font-bold px-2 py-0.5 rounded">
            {discount}% ছাড়
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[#1a1a2e] text-sm leading-snug line-clamp-2 mb-1 group-hover:text-[#1CAB87] transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{instructor?.name || 'SI School'}</p>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-500 font-bold text-xs">{course.rating}</span>
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-400">({course.reviews.toLocaleString()})</span>
          <span className="text-xs text-gray-400 ml-1">{course.enrollments.toLocaleString()} শিক্ষার্থী</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>{course.totalLessons} টি লেসন</span>
          <span>·</span>
          <span>{course.totalDuration}</span>
          <span>·</span>
          <span className="capitalize">{course.level === 'beginner' ? 'শুরুর স্তর' : course.level === 'intermediate' ? 'মধ্যম স্তর' : 'উন্নত স্তর'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {course.price === 0 ? (
              <span className="text-lg font-black text-[#1CAB87]">বিনামূল্যে</span>
            ) : (
              <>
                <span className="text-lg font-black text-[#1a1a2e]">৳{course.price.toLocaleString()}</span>
                {course.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">৳{course.originalPrice.toLocaleString()}</span>
                )}
              </>
            )}
          </div>
          <button className="bg-[#1CAB87] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#17976d] transition">
            এখনই ভর্তি হন
          </button>
        </div>
      </div>
    </Link>
  )
}
