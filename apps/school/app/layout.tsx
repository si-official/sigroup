import type { Metadata } from 'next'
import './globals.css'
import { StudentProvider } from '@/context/StudentContext'

export const metadata: Metadata = {
  title: 'SI School | Online Learning Platform',
  description: 'বাংলায় শিখুন — Web Dev, Data Science, Design ও আরও অনেক কিছু',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="antialiased bg-gray-50">
        <StudentProvider>{children}</StudentProvider>
      </body>
    </html>
  )
}
