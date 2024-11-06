import { NextResponse } from 'next/server'
import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from '@/lib/keycloak-config'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log('Login attempt for:', username)
    console.log('Keycloak URL:', KEYCLOAK_URLS.TOKEN)
    console.log('Client ID:', KEYCLOAK_CONFIG.CLIENT_ID)

    const tokenResponse = await fetch(KEYCLOAK_URLS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: KEYCLOAK_CONFIG.CLIENT_ID,
        client_secret: KEYCLOAK_CONFIG.CLIENT_SECRET!,
        username,
        password,
        scope: 'openid profile email'
      }),
    })

    console.log('Keycloak response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Keycloak error response:', errorText)
      throw new Error(`Authentication failed: ${errorText}`)
    }

    const tokens = await tokenResponse.json()
    console.log('Token received:', tokens.access_token ? 'Yes' : 'No')

    const apiResponse = NextResponse.json({ isAuthenticated: true })
    
    apiResponse.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    })
    
    apiResponse.cookies.set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.refresh_expires_in
    })

    return apiResponse

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        isAuthenticated: false,
        message: error instanceof Error ? error.message : 'Authentication failed'
      },
      { status: 401 }
    )
  }
}
