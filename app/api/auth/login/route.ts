import { NextResponse } from 'next/server'
import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from '@/lib/keycloak-config'

export async function POST(request: Request) {
  try {
    const { username, password, clientId, redirectUri, state } = await request.json()

    console.log('Login request:', { username, clientId, redirectUri, state }) // Debug log

    // Get tokens from Keycloak using password grant
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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Keycloak error response:', errorText)
      throw new Error(`Authentication failed: ${errorText}`)
    }

    const tokens = await tokenResponse.json()

    // Check if this is an SSO login request
    const isSsoLogin = clientId && redirectUri
    console.log('Is SSO login?', isSsoLogin)

    if (isSsoLogin) {
      console.log('Processing SSO redirect to:', redirectUri)

      // Create the redirect URL with tokens
      const finalRedirectUrl = new URL(redirectUri)
      finalRedirectUrl.searchParams.set('access_token', tokens.access_token)
      finalRedirectUrl.searchParams.set('id_token', tokens.id_token || '')
      if (state) {
        finalRedirectUrl.searchParams.set('state', state)
      }
      
      return NextResponse.json({ 
        redirect: finalRedirectUrl.toString() 
      })
    }

    // Regular Pehchan login
    console.log('Processing regular Pehchan login')
    const response = NextResponse.json({ 
      isAuthenticated: true,
      message: 'Login successful'
    })
    
    response.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    })
    
    response.cookies.set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.refresh_expires_in
    })

    return response

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
