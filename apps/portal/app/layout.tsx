import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SI Portal | Client & Partner Portal',
  description: 'SI Group secure portal — project tracking, invoices, support',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  )
}
