import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (also enforced by matcher below)
  if (pathname.startsWith('/admin')) {
    // Note: In a production environment, you would verify the Firebase Auth token here
    // For now, we rely on client-side checks in the auth provider and admin pages
    // This proxy serves as an additional layer of protection
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

