import { NextResponse } from 'next/server'
import { KEYCLOAK_URLS, KEYCLOAK_CONFIG } from '@/lib/keycloak-config'
import { cookies } from 'next/headers'

// Helper function to extract WebAuthn parameters
function extractWebAuthnParams(html: string, request: Request) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const rpId = new URL(origin).hostname

  const challengeMatch = html.match(/challenge\s*:\s*'([^']+)'/)
  if (!challengeMatch) {
    throw new Error('Failed to extract WebAuthn parameters')
  }

  return {
    challenge: challengeMatch[1],
    rpId,
  }
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

export async function POST(request: Request) {
  try {
    const { action, username, credential } = await request.json()
    const webAuthnBaseUrl = `${KEYCLOAK_URLS.BASE}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect`

    // Only check auth for register-finish and authenticate-finish
    if (action === 'register-finish' || action === 'authenticate-finish') {
      const accessToken = cookies().get('access_token')?.value
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    switch (action) {
      case 'authenticate': {
        const authResponse = await fetch(`${webAuthnBaseUrl}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: KEYCLOAK_CONFIG.CLIENT_ID,
            response_type: 'code',
            scope: 'openid',
            redirect_uri: KEYCLOAK_CONFIG.REDIRECT_URI,
            acr_values: 'webauthn-passwordless',
            username,
          }).toString(),
        })

        const html = await authResponse.text()
        const { challenge, rpId } = extractWebAuthnParams(html, request)

        return NextResponse.json({
          challenge,
          rpId,
          type: 'webauthn.get',
          userVerification: 'preferred',
        })
      }

      case 'register': {
        if (!username) {
          return NextResponse.json(
            { error: 'Username is required' },
            { status: 400 }
          )
        }

        const regResponse = await fetch(`${webAuthnBaseUrl}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: KEYCLOAK_CONFIG.CLIENT_ID,
            response_type: 'code',
            scope: 'openid',
            redirect_uri: KEYCLOAK_CONFIG.REDIRECT_URI,
            acr_values: 'webauthn-register-passwordless',
            username,
          }).toString(),
        })

        const html = await regResponse.text()
        const { challenge, rpId } = extractWebAuthnParams(html, request)

        // Generate a random user ID instead of encoding username
        const userId = Buffer.from(crypto.randomUUID()).toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')

        return NextResponse.json({
          challenge,
          rpId,
          rp: {
            name: 'Pehchan',
            id: rpId
          },
          user: {
            id: userId,
            name: username,
            displayName: username
          },
          pubKeyCredParams: [
            { type: "public-key" as const, alg: -7 },
            { type: "public-key" as const, alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            requireResidentKey: true,
            userVerification: 'preferred'
          },
          timeout: 60000
        })
      }

      case 'register-finish': {
        console.log('Register finish - credential:', credential)
        console.log('Credential response:', credential.response)

        const accessToken = cookies().get('access_token')?.value
        if (!accessToken) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Ensure all required data exists
        if (!credential.response.clientDataJSON || 
            !credential.response.attestationObject || 
            !credential.id || 
            !credential.response.authenticatorData || 
            !credential.response.publicKey) {
          return NextResponse.json(
            { error: 'Missing required credential data' },
            { status: 400 }
          )
        }

        const finishRegResponse = await fetch(`${KEYCLOAK_URLS.BASE}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/webauthn/register/finish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: new URLSearchParams({
            clientDataJSON: credential.response.clientDataJSON,
            attestationObject: credential.response.attestationObject,
            credentialId: credential.id,
            authenticatorData: credential.response.authenticatorData,
            publicKey: credential.response.publicKey,
            client_id: KEYCLOAK_CONFIG.CLIENT_ID,
          }).toString(),
        })

        console.log('Finish response status:', finishRegResponse.status)
        const responseData = await finishRegResponse.text()
        console.log('Finish response:', responseData)

        if (!finishRegResponse.ok) {
          throw new Error(`Registration completion failed: ${responseData}`)
        }

        return NextResponse.json({ success: true })
      }

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