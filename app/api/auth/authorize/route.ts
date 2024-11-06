import { NextResponse } from 'next/server'
import { createLoginUrl } from '@/lib/keycloak-config'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const redirectUri = searchParams.get('redirect_uri')
    
    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Generate a state parameter to prevent CSRF
    const state = Math.random().toString(36).substring(7)
    
    // Store the original redirect URI and client ID in cookies
    const response = NextResponse.redirect(createLoginUrl(state))
    
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    response.cookies.set('oauth_redirect_uri', redirectUri, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    })

    return response
  } catch (error) {
    console.error('Authorization error:', error)
    return NextResponse.json(
      { message: 'Authorization failed' },
      { status: 500 }
    )
  }
} 