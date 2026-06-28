import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SI Group | Leading Conglomerate in Bangladesh',
  description: 'SI Group – trusted business group of Bangladesh',
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
