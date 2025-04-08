import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { clientId, clientSecret } = await request.json()
    const accessToken = cookies().get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { message: 'No active session' },
        { status: 401 }
      )
    }

    // Verify client credentials
    if (clientId !== process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 
        clientSecret !== process.env.KEYCLOAK_CLIENT_SECRET) {
      return NextResponse.json(
        { message: 'Invalid client credentials' },
        { status: 401 }
      )
    }

    // Exchange the access token for a new token with the requested client
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          client_id: clientId,
          client_secret: clientSecret,
          subject_token: accessToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        }),
      }
    )

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { message: 'Failed to exchange token' },
        { status: 400 }
      )
    }

    const tokens = await tokenResponse.json()

    return NextResponse.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
      refresh_token: tokens.refresh_token,
    })

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { message: 'Failed to exchange token' },
      { status: 500 }
    )
  }
} 