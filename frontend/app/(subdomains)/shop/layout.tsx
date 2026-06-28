import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SI Shop | Online Store',
  description: 'Shop online at SI Group',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
