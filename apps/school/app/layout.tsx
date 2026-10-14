import type { Metadata } from 'next'
import './globals.css'
import { StudentProvider } from '@/context/StudentContext'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'SI School | বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম',
  description: 'বাংলায় শিখুন — SSC, HSC, IELTS, Programming, Design ও আরও অনেক কিছু',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="antialiased bg-gray-50">
        <AuthProvider>
          <StudentProvider>{children}</StudentProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
