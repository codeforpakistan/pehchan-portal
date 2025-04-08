import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { KEYCLOAK_URLS, KEYCLOAK_CONFIG } from '@/lib/keycloak-config'
import { supabase } from '@/lib/supabase'
import { validateSSORequest } from '@/lib/sso'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const cookieStore = cookies()
    
    // Get stored OAuth data
    const savedState = cookieStore.get('oauth_state')?.value
    const redirectUri = cookieStore.get('oauth_redirect_uri')?.value
    const clientId = cookieStore.get('oauth_client_id')?.value
    const codeVerifier = cookieStore.get('oauth_code_verifier')?.value

    if (!savedState || savedState !== state) {
      throw new Error('Invalid state parameter')
    }

    if (!code || !redirectUri || !clientId) {
      throw new Error('Missing required parameters')
    }

    // Validate client and redirect URI
    await validateSSORequest(clientId, redirectUri)

    // Exchange code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: KEYCLOAK_CONFIG.CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier || '',
      scope: 'openid profile email'
    })

    const tokenResponse = await fetch(KEYCLOAK_URLS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const tokens = await tokenResponse.json()

    // Get additional user info from Supabase if needed
    const { data: supabaseUser } = await supabase
      .from('users')
      .select('*')
      .eq('keycloak_id', tokens.decoded_token.sub)
      .single()

    // Construct the final redirect URL with tokens and basic user info
    const finalRedirectUrl = new URL(redirectUri)
    finalRedirectUrl.searchParams.set('access_token', tokens.access_token)
    finalRedirectUrl.searchParams.set('id_token', tokens.id_token)
    finalRedirectUrl.searchParams.set('token_type', 'Bearer')
    finalRedirectUrl.searchParams.set('expires_in', tokens.expires_in.toString())
    
    const response = NextResponse.redirect(finalRedirectUrl)
    
    // Clear the OAuth cookies
    response.cookies.delete('oauth_state')
    response.cookies.delete('oauth_redirect_uri')
    response.cookies.delete('oauth_client_id')
    response.cookies.delete('oauth_code_verifier')

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    )
  }
} 