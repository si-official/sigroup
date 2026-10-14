import './globals.css'
import { AdminProvider } from '@/context/AdminContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  )
}
