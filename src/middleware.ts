import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Make sure /api/auth routes are not affected by middleware
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  
  // ...rest of your middleware logic...
}

export const config = {
  matcher: [
    // Add your matchers but exclude api/auth routes
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
