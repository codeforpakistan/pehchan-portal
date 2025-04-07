import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { corsConfig } from '@/config/cors'

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false
  if (corsConfig.allowedOrigins.includes('*')) return true
  return corsConfig.allowedOrigins.includes(origin)
}

export function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname)
  
  const origin = request.headers.get('origin')
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    if (corsConfig.allowedOrigins.includes('*')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
    } else if (origin && isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }

  // Create response early so we can add CORS headers to all responses
  const response = NextResponse.next()
  
  if (corsConfig.allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  } else if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Add your public paths that should bypass auth
  const publicPaths = [
    '/images/',      // Allow access to images
    '/login',
    '/signup',
    '/',
    '/api/auth',
    '/forgot-password',
    '/reset-password',
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
    return response
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

  return response
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
