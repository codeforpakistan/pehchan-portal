import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { corsConfig } from '@/config/cors'
import { supabase } from '@/lib/supabase'

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false
  if (corsConfig.allowedOrigins.includes('*')) return true
  return corsConfig.allowedOrigins.includes(origin)
}

export async function middleware(request: NextRequest) {
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
    '/images/',
    '/login',
    '/signup',
    '/',
    '/api/auth',
    '/forgot-password',
    '/reset-password',
    '/auth/2fa-verify',
    '/_next',
    '/favicon.ico'
  ]

  // Get auth tokens
  const accessToken = request.cookies.get('access_token')?.value

  console.log('Auth tokens:', { accessToken })

  // Check if the requested path is exactly one of the public paths
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/images/')
  )

  console.log('Is public path?', isPublicPath)

  // If it's a public path, allow access
  if (isPublicPath) {
    return response
  }

  // For protected routes (including dashboard)
  if (!accessToken) {
    console.log('No valid session, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user info from Keycloak
  try {
    const userInfoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      console.log('Invalid token, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const userInfo = await userInfoResponse.json()
    console.log('User info:', userInfo)

    // Check if 2FA is required
    const { data: settings, error } = await supabase
      .from('user_2fa_settings')
      .select('totp_enabled')
      .eq('user_id', userInfo.sub)
      .single()

    console.log('2FA settings:', settings, 'Error:', error)

    // If 2FA is enabled but not verified
    if (settings?.totp_enabled && !request.cookies.get('2fa_verified')) {
      console.log('2FA required but not verified')
      
      // If already on 2FA verification page, allow access
      if (request.nextUrl.pathname === '/auth/2fa-verify') {
        return response
      }
      
      console.log('Redirecting to 2FA verification')
      return NextResponse.redirect(new URL('/auth/2fa-verify', request.url))
    }

  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
