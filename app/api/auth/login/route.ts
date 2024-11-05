import { NextResponse } from 'next/server'
import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from '@/lib/keycloak-config'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    console.log('Login attempt for:', username)

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
        scope: 'openid profile email',
      }),
    })

    // First get the raw text
    const rawResponse = await tokenResponse.text()
    console.log('Raw Keycloak response:', rawResponse)

    // Try to parse it as JSON
    let tokens
    try {
      tokens = JSON.parse(rawResponse)
    } catch (e) {
      console.error('Failed to parse token response:', e)
      return NextResponse.json({
        success: false,
        message: 'Invalid response from authentication server',
      }, { status: 500 })
    }

    if (!tokenResponse.ok) {
      console.error('Token error:', tokens)
      return NextResponse.json({
        success: false,
        message: tokens.error_description || 'Authentication failed',
        error: tokens.error
      }, { status: tokenResponse.status })
    }

    // Get user info using the access token
    const userInfoResponse = await fetch(KEYCLOAK_URLS.USERINFO, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    // Get additional user data from Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from('users')
      .select('*')
      .eq('keycloak_id', userInfo.sub)
      .single()

    if (supabaseError) {
      console.error('Failed to fetch Supabase user data:', supabaseError)
      // Don't throw error, just log it - we still want login to succeed
    }

    // Create the response with cookies
    const response = NextResponse.json({ 
      success: true,
      user: {
        ...userInfo,
        profile: supabaseUser || null // Add Supabase data if available
      }
    })

    // Set secure cookies
    response.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    })

    response.cookies.set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.refresh_expires_in,
    })

    return response

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message
    }, { status: 500 })
  }
}
