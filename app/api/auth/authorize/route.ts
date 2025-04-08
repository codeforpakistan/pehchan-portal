import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const redirectUri = searchParams.get('redirect_uri')
    const state = searchParams.get('state')
    const responseType = searchParams.get('response_type')

    // Validate required parameters
    if (!clientId || !redirectUri || !state || responseType !== 'code') {
      return NextResponse.json(
        { message: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Store OAuth parameters in cookies for after login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('oauth_client_id', clientId)
    response.cookies.set('oauth_redirect_uri', redirectUri)
    response.cookies.set('oauth_state', state)

    return response

  } catch (error) {
    console.error('Authorization error:', error)
    return NextResponse.json(
      { message: 'Authorization failed' },
      { status: 500 }
    )
  }
} 