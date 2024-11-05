import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/login' || 
                      path === '/signup' ||
                      path.startsWith('/api/auth')

  // Get the token from session
  const token = request.cookies.get('token')?.value

  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to login if trying to access protected route without token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && (path === '/login' || path === '/signup')) {
    // Redirect to dashboard if trying to access login/signup while authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
