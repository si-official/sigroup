import { sellers } from '@/lib/data'
import AuthorPageClient from './AuthorPageClient'

export function generateStaticParams() {
  return sellers.map(s => ({ id: s.id }))
}

export default function Page() {
  return <AuthorPageClient />
}
