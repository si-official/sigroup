import { categories } from '@/lib/data'
import CategoryPageClient from './CategoryPageClient'

export function generateStaticParams() {
  return [{ cat: 'all' }, ...categories.map(c => ({ cat: c.id }))]
}

export default function Page() {
  return <CategoryPageClient />
}
