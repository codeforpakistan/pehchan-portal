import { NextResponse } from 'next/server'
import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from '@/lib/keycloak-config'

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user
 *     description: Login with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               clientId:
 *                 type: string
 *               redirectUri:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Authentication failed
 */
export async function POST(request: Request) {
  try {
    const { username, password, clientId, redirectUri } = await request.json()

    console.log('Login request:', { username, clientId, redirectUri }) // Debug log

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

    // If this is an SSO login request
    if (clientId && redirectUri) {
      console.log('Processing SSO redirect to:', redirectUri)

      // Create the redirect URL with tokens
      const finalRedirectUrl = new URL(redirectUri)
      finalRedirectUrl.searchParams.set('access_token', tokens.access_token)
      finalRedirectUrl.searchParams.set('id_token', tokens.id_token || '')
      
      return NextResponse.json({ 
        redirect: finalRedirectUrl.toString() 
      })
    }

    // Regular Pehchan login
    const response = NextResponse.json({ isAuthenticated: true })
    
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
