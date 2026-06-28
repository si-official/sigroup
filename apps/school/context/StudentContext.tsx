'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Student, EnrolledCourse } from '@/lib/types'

interface StudentContextType {
  student: Student | null
  isEnrolled: (courseId: string) => boolean
  getProgress: (courseId: string) => EnrolledCourse | undefined
  completeLesson: (courseId: string, lessonId: string) => void
  saveQuizScore: (courseId: string, score: number) => void
  enroll: (courseId: string) => void
  login: (name: string, email: string) => void
  logout: () => void
}

const StudentContext = createContext<StudentContextType | null>(null)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('si_student')
    if (saved) setStudent(JSON.parse(saved))
  }, [])

  const save = (s: Student) => {
    setStudent(s)
    localStorage.setItem('si_student', JSON.stringify(s))
  }

  const login = (name: string, email: string) => {
    const existing = localStorage.getItem('si_student')
    if (existing) { setStudent(JSON.parse(existing)); return }
    save({ id: Date.now().toString(), name, email, enrolledCourses: [] })
  }

  const logout = () => { setStudent(null); localStorage.removeItem('si_student') }

  const isEnrolled = (courseId: string) =>
    student?.enrolledCourses.some((e) => e.courseId === courseId) ?? false

  const getProgress = (courseId: string) =>
    student?.enrolledCourses.find((e) => e.courseId === courseId)

  const enroll = (courseId: string) => {
    if (!student || isEnrolled(courseId)) return
    const updated = {
      ...student,
      enrolledCourses: [...student.enrolledCourses, {
        courseId, enrolledAt: new Date().toISOString(),
        progress: 0, completedLessons: [],
      }],
    }
    save(updated)
  }

  const completeLesson = (courseId: string, lessonId: string) => {
    if (!student) return
    const updated = {
      ...student,
      enrolledCourses: student.enrolledCourses.map((e) => {
        if (e.courseId !== courseId) return e
        const completed = e.completedLessons.includes(lessonId)
          ? e.completedLessons
          : [...e.completedLessons, lessonId]
        return { ...e, completedLessons: completed }
      }),
    }
    save(updated)
  }

  const saveQuizScore = (courseId: string, score: number) => {
    if (!student) return
    const updated = {
      ...student,
      enrolledCourses: student.enrolledCourses.map((e) =>
        e.courseId === courseId
          ? { ...e, quizScore: score, certificateIssued: score >= 70 }
          : e
      ),
    }
    save(updated)
  }

  return (
    <StudentContext.Provider value={{ student, isEnrolled, getProgress, completeLesson, saveQuizScore, enroll, login, logout }}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const ctx = useContext(StudentContext)
  if (!ctx) throw new Error('useStudent must be used within StudentProvider')
  return ctx
}
