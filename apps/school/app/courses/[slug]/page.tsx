import { courses } from '@/lib/data'
import CourseDetailClient from './CourseDetailClient'

export function generateStaticParams() {
  return courses.map(c => ({ slug: c.slug }))
}

export default function Page() {
  return <CourseDetailClient />
}
