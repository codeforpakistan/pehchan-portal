import { NextResponse } from 'next/server'
import { KEYCLOAK_URLS, KEYCLOAK_CONFIG } from '@/lib/keycloak-config'

export async function POST(request: Request) {
  try {
    const { action, username, credential } = await request.json()

    // Base URL for WebAuthn
    const webAuthnBaseUrl = `${KEYCLOAK_URLS.BASE}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect`

    console.log('Action:', action)
    console.log('Username:', username)

    switch (action) {
      case 'authenticate':
        // First initiate WebAuthn authentication
        const authResponse = await fetch(`${webAuthnBaseUrl}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: KEYCLOAK_CONFIG.CLIENT_ID,
            response_type: 'code',
            scope: 'openid',
            redirect_uri: KEYCLOAK_CONFIG.REDIRECT_URI,
            acr_values: 'webauthn-passwordless',
            username,
          }).toString(),
        })

        // Extract WebAuthn parameters from the HTML response
        const html = await authResponse.text()
        
        // Get the origin for rpId
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const rpId = new URL(origin).hostname // This will give us 'localhost' in development
        
        // Parse the challenge from the script section
        const challengeMatch = html.match(/challenge\s*:\s*'([^']+)'/)
        if (!challengeMatch) {
          throw new Error('Failed to extract WebAuthn parameters')
        }

        return NextResponse.json({
          challenge: challengeMatch[1],
          rpId: rpId, // Use the local hostname instead of Keycloak's domain
          type: 'webauthn.get',
          userVerification: 'preferred',
        })

      case 'register':
        const regResponse = await fetch(`${webAuthnBaseUrl}/ws/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            authenticatorAttachment: 'platform',
            requireResidentKey: true,
            userVerification: 'preferred',
            attestation: 'none',
          }),
        })

        if (!regResponse.ok) {
          const error = await regResponse.text()
          throw new Error(`Registration failed: ${error}`)
        }

        return NextResponse.json(await regResponse.json())
        const regData = await regResponse.json()
        return NextResponse.json(regData)

      case 'register-finish':
        // Complete WebAuthn registration
        const finishRegResponse = await fetch(`${webAuthnBaseUrl}/register/finish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            username,
            credential,
          }),
        })

        if (!finishRegResponse.ok) {
          const error = await finishRegResponse.text()
          throw new Error(`Registration completion failed: ${error}`)
        }

        return NextResponse.json(await finishRegResponse.json())

      case 'authenticate-finish':
        // Complete WebAuthn authentication
        const finishAuthResponse = await fetch(`${webAuthnBaseUrl}/authenticate/finish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            username,
            credential,
          }),
        })

        if (!finishAuthResponse.ok) {
          const error = await finishAuthResponse.text()
          throw new Error(`Authentication completion failed: ${error}`)
        }

        const tokens = await finishAuthResponse.json()
        
        // After successful authentication, exchange the assertion for tokens
        const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: KEYCLOAK_CONFIG.CLIENT_ID,
            client_secret: KEYCLOAK_CONFIG.CLIENT_SECRET!,
            username,
            scope: 'openid',
          }),
        })

        if (!tokenResponse.ok) {
          throw new Error('Failed to get tokens')
        }

        return NextResponse.json(await tokenResponse.json())

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Passkey operation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Passkey operation failed' },
      { status: 500 }
    )
  }
} 