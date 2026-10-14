import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SI Group | Leading Technology Conglomerate in Bangladesh',
  description: 'SI Group – Bangladesh\'s most trusted technology conglomerate. Web development, mobile apps, education, e-commerce and more. Serving 12+ countries.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
