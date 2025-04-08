import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { code, client_id, client_secret, redirect_uri } = await request.json()

    if (!code || !client_id || !client_secret || !redirect_uri) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify client credentials
    const { data: client, error: clientError } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('client_id', client_id)
      .eq('client_secret', client_secret)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { message: 'Invalid client credentials' },
        { status: 401 }
      )
    }

    // Verify redirect URI
    if (!client.redirect_uris.includes(redirect_uri)) {
      return NextResponse.json(
        { message: 'Invalid redirect URI' },
        { status: 400 }
      )
    }

    // Exchange code for tokens using Keycloak
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          code,
          redirect_uri,
        }),
      }
    )

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { message: 'Failed to exchange code for tokens' },
        { status: 400 }
      )
    }

    const tokens = await tokenResponse.json()

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: 'Bearer',
    })

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { message: 'Failed to exchange code for tokens' },
      { status: 500 }
    )
  }
} 