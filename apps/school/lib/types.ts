export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'coaching_center' | 'student'

// ─── New canonical types (Phase 1 spec) ───────────────────────────────────────

export interface SchoolUser {
  id: string; name: string; email: string; password: string
  role: UserRole; avatar?: string; phone?: string
  createdAt: string; status: 'active' | 'suspended' | 'pending'
}

export interface StudentUser extends SchoolUser {
  role: 'student'
  enrolledCourses: string[]
  completedLessons: string[]
  xp: number
}

export interface InstructorUser extends SchoolUser {
  role: 'instructor'
  bio: string; expertise: string[]; education: string
  totalEarnings: number; pendingWithdrawal: number
  totalStudents: number; rating: number
  verified: boolean; coachingCenterId?: string
}

export interface CoachingCenterUser extends SchoolUser {
  role: 'coaching_center'
  brandName: string; description: string
  address: string; totalEarnings: number; pendingWithdrawal: number
  verified: boolean; instructorIds: string[]
}

export interface Lesson {
  id: string; title: string; duration: string
  type: 'video' | 'pdf' | 'quiz' | 'live'
  videoUrl?: string; isFree: boolean; order: number
}

export interface Chapter {
  id: string; title: string; lessons: Lesson[]; order: number
}

export interface Course {
  id: string; slug: string; title: string; subtitle: string
  description: string; thumbnail: string; previewVideoId?: string
  previewVideo?: string
  price: number; originalPrice?: number
  category: string; subcategory?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  language: 'bangla' | 'english' | 'both'
  instructorId: string; coachingCenterId?: string
  chapters: Chapter[]
  totalLessons: number; totalDuration: string
  rating: number; reviews: number; enrollments: number
  badge?: 'Bestseller' | 'New' | 'Hot' | 'Free' | 'Featured'
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  commissionRate: number
  whatYouLearn: string[]; requirements: string[]
  targetAudience?: string
  certificate: boolean; liveClasses: boolean
  liveClassLink?: string
  createdAt: string; updatedAt?: string; tags: string[]
}

export interface WithdrawalRequest {
  id: string; userId: string; userRole: UserRole
  amount: number; method: 'bkash' | 'nagad' | 'bank' | 'rocket'
  accountNumber: string; accountName: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string; processedAt?: string
}

export interface Category {
  id: string; label?: string; labelBn?: string; icon: string; count?: number; color?: string
  // Legacy fields
  name?: string; bangla?: string; subcategories?: string[]
}

// ─── Legacy aliases for backward compatibility ────────────────────────────────

export interface User extends SchoolUser {
  status: 'active' | 'suspended' | 'pending'
}

export interface Instructor extends SchoolUser {
  role: 'instructor'
  bio: string; expertise: string[]
  totalCourses?: number; totalStudents: number; rating: number
  totalEarnings: number; pendingWithdrawal: number
  verified: boolean; institution?: string; education?: string
  coachingCenterId?: string
}

export interface CoachingCenter extends SchoolUser {
  role: 'coaching_center'
  brandName: string; brandLogo?: string; description: string
  instructors?: string[]; instructorIds?: string[]
  totalCourses?: number; totalStudents?: number
  totalEarnings: number; pendingWithdrawal: number
  verified: boolean; address?: string; website?: string
}

export interface Student {
  id: string; name: string; email: string
  password?: string; role?: UserRole; avatar?: string
  createdAt?: string; status?: 'active' | 'suspended' | 'pending'
  enrolledCourses: EnrolledCourse[]
  completedCourses?: string[]
  completedLessons?: string[]
  xp?: number; certificates?: string[]
}

export interface Enrollment {
  id: string; studentId: string; courseId: string
  enrolledAt: string; progress: number
  completedLessons: string[]; certificateIssued: boolean
  amountPaid: number; paymentMethod: string
}

export interface Review {
  id: string; studentId: string; studentName: string
  courseId: string; rating: number; comment: string; createdAt: string
}

export interface EnrolledCourse {
  courseId: string; enrolledAt: string; progress: number
  completedLessons: string[]; quizScore?: number; certificateIssued?: boolean
}

export interface QuizQuestion {
  id: string; question: string; options: string[]
  correctIndex: number; explanation: string
}
