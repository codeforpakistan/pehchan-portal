import { NextResponse } from 'next/server'
import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from '@/lib/keycloak-config'
import { keycloakAdmin } from '@/lib/keycloak-admin'

export async function POST(request: Request) {
  try {
    const { username, password, clientId, redirectUri } = await request.json()

    console.log('Login request:', { username, clientId, redirectUri }) // Debug log

    // If this is an SSO login request, get the client secret
    let clientSecret = KEYCLOAK_CONFIG.CLIENT_SECRET
    if (clientId) {
      try {
        const clients = await keycloakAdmin.findClient(clientId)
        if (!clients || clients.length === 0) {
          console.error('Client not found:', clientId)
          throw new Error('Invalid client ID')
        }
        const client = clients[0]
        if (!client.secret) {
          console.error('Client has no secret:', client)
          throw new Error('Client configuration error')
        }
        clientSecret = client.secret
        console.log('Using client secret for:', clientId)
      } catch (error) {
        console.error('Error fetching client:', error)
        throw new Error('Failed to validate client')
      }
    }

    const tokenResponse = await fetch(KEYCLOAK_URLS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: clientId || KEYCLOAK_CONFIG.CLIENT_ID,
        client_secret: clientSecret!,
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
