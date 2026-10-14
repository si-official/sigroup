import { products } from '@/lib/data'
import ItemPageClient from './ItemPageClient'

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }))
}

export default function Page() {
  return <ItemPageClient />
}
