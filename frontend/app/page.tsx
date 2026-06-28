import { redirect } from 'next/navigation'

// Root redirects to /main (middleware handles subdomain routing in production)
export default function RootPage() {
  redirect('/main')
}
