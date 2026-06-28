import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

export const metadata: Metadata = {
  title: 'SI Shop | Software & Digital Products',
  description: 'Buy software, templates and digital products from SI Group',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
