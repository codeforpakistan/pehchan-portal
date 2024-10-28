import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { refreshAccessToken } from './lib/refresh-token'

export async function middleware(request: NextRequest) {
  // Skip public routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  ) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('access_token')?.value

  if (!accessToken) {
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (refreshToken) {
      // Try to refresh the token
      const tokens = await refreshAccessToken()

      if (tokens) {
        const response = NextResponse.next()

        // Update cookies with new tokens
        response.cookies.set('access_token', tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: tokens.expires_in,
        })

        response.cookies.set('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: tokens.refresh_expires_in,
        })

        return response
      }
    }

    // Redirect to login if no valid tokens
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|login|signup).*)',
  ],
}
