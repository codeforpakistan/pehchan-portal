import { NextResponse } from 'next/server'
import { registerSSOClient } from '@/lib/sso'
import { keycloakAdmin } from '@/lib/keycloak-admin'

export async function POST(request: Request) {
  try {
    const { clientId, redirectUris, allowedOrigins, scopes } = await request.json()

    // Enhanced validation
    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid clientId: must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!redirectUris || !Array.isArray(redirectUris) || redirectUris.length === 0) {
      return NextResponse.json(
        { message: 'redirectUris must be a non-empty array of URLs' },
        { status: 400 }
      )
    }

    // Validate URLs
    for (const uri of redirectUris) {
      try {
        new URL(uri)
      } catch {
        return NextResponse.json(
          { message: `Invalid redirect URI: ${uri}` },
          { status: 400 }
        )
      }
    }

    // Check if client already exists
    const existingClients = await keycloakAdmin.findClient(clientId)
    if (existingClients && existingClients.length > 0) {
      return NextResponse.json(
        { message: 'Client ID already exists' },
        { status: 409 }
      )
    }

    const client = await registerSSOClient({
      clientId,
      redirectUris,
      allowedOrigins,
      scopes
    })

    // Get the client secret
    const clients = await keycloakAdmin.findClient(clientId)
    const clientSecret = clients[0]?.secret

    if (!clientSecret) {
      throw new Error('Failed to retrieve client secret')
    }

    return NextResponse.json({ 
      success: true, 
      clientId: client.id,
      clientSecret: clientSecret, // Important for the client to save
      message: 'Client registered successfully',
      config: {
        authorizationEndpoint: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth`,
        tokenEndpoint: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
        userinfoEndpoint: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
        endSessionEndpoint: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`,
        requiredScopes: ['openid', 'profile', 'email'],
        grantTypes: ['authorization_code', 'refresh_token'],
      }
    })
  } catch (error) {
    console.error('Client registration error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to register client' },
      { status: 500 }
    )
  }
} 