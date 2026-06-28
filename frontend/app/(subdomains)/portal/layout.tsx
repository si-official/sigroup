import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SI Portal | Employee & Client Portal',
  description: 'SI Group internal portal',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
