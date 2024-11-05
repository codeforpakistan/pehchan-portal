import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname)
  
  // Add your public paths that should bypass auth
  const publicPaths = [
    '/images/',      // Allow access to images
    '/login',
    '/signup',
    '/',
    '/api/auth',
    '_next',
    'favicon.ico'
  ]

  // Get auth tokens
  const session = request.cookies.get('session')?.value
  const accessToken = request.cookies.get('access_token')?.value

  console.log('Auth tokens:', { session, accessToken })

  // Check if the requested path starts with any of the public paths
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  console.log('Is public path?', isPublicPath)

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes (including dashboard)
  if (!session || !accessToken) {
    console.log('No valid session, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated user tries to access login/signup
  if (session && accessToken && (
    request.nextUrl.pathname === '/login' || 
    request.nextUrl.pathname === '/signup'
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth (to allow login/logout)
     * - _next (static files)
     * - images (public assets)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
