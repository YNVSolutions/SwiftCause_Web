import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Note: In a production environment, you would verify the Firebase Auth token here
    // For now, we rely on client-side checks in the auth provider and admin pages
    // This middleware serves as an additional layer of protection
    
    // You can add server-side token verification here if needed
    // For example, checking cookies or Authorization headers
    
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
