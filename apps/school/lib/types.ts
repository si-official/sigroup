export interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl?: string
  type: 'video' | 'quiz' | 'reading'
  free?: boolean
}

export interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  instructor: string
  instructorTitle: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  language: string
  price: number
  originalPrice?: number
  thumbnail: string
  rating: number
  students: number
  totalLessons: number
  totalHours: string
  badge?: string
  sections: Section[]
  quiz: QuizQuestion[]
  objectives: string[]
  requirements: string[]
}

export interface EnrolledCourse {
  courseId: string
  enrolledAt: string
  progress: number
  completedLessons: string[]
  quizScore?: number
  certificateIssued?: boolean
}

export interface Student {
  id: string
  name: string
  email: string
  enrolledCourses: EnrolledCourse[]
}
