import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SI School | Education Platform',
  description: 'SI Group Education Portal',
}

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
