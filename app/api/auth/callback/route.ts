import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { KEYCLOAK_URLS, KEYCLOAK_CONFIG } from '@/lib/keycloak-config'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const cookieStore = cookies()
    
    // Verify state parameter
    const savedState = cookieStore.get('oauth_state')?.value
    const redirectUri = cookieStore.get('oauth_redirect_uri')?.value

    if (!savedState || savedState !== state) {
      throw new Error('Invalid state parameter')
    }

    if (!code) {
      throw new Error('Authorization code is missing')
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(KEYCLOAK_URLS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KEYCLOAK_CONFIG.CLIENT_ID,
        client_secret: KEYCLOAK_CONFIG.CLIENT_SECRET!,
        code,
        redirect_uri: KEYCLOAK_CONFIG.REDIRECT_URI,
        scope: 'openid profile email'  // Request additional scopes
      }),
    })

    const tokens = await tokenResponse.json()

    // Get additional user info from Supabase if needed
    const { data: supabaseUser } = await supabase
      .from('users')
      .select('*')
      .eq('keycloak_id', tokens.decoded_token.sub)
      .single()

    // Construct the final redirect URL with tokens and basic user info
    const finalRedirectUrl = new URL(redirectUri!)
    finalRedirectUrl.searchParams.set('access_token', tokens.access_token)
    finalRedirectUrl.searchParams.set('id_token', tokens.id_token)
    
    const response = NextResponse.redirect(finalRedirectUrl)
    
    // Clear the OAuth cookies
    response.cookies.delete('oauth_state')
    response.cookies.delete('oauth_redirect_uri')

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
} 