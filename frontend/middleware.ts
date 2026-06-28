import { NextRequest, NextResponse } from 'next/server'
import { DOMAIN, getSubdomainFromHost, SUBDOMAINS } from '@/config/subdomains'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Skip static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const subdomain = getSubdomainFromHost(host)
  const targetPath = SUBDOMAINS[subdomain].path

  // Avoid redirect loop
  if (pathname.startsWith(targetPath)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `${targetPath}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
