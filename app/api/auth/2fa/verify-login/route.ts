import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const accessToken = cookies().get('access_token')?.value

    console.log('Verifying 2FA with code:', code)

    if (!accessToken) {
      console.log('No access token found')
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user info from Keycloak
    const userInfoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      console.log('Invalid token response:', userInfoResponse.status)
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const userInfo = await userInfoResponse.json()
    console.log('User info from Keycloak:', userInfo)

    // Get 2FA settings from Supabase
    const { data: settings, error } = await supabase
      .from('user_2fa_settings')
      .select('totp_secret')
      .eq('user_id', userInfo.sub)
      .single()

    console.log('2FA settings from Supabase:', settings, 'Error:', error)

    if (error || !settings?.totp_secret) {
      console.log('2FA not configured or error:', error)
      return NextResponse.json(
        { message: '2FA not configured' },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: settings.totp_secret
    })

    console.log('TOTP verification result:', isValid)

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Create response with success message
    const response = NextResponse.json({ success: true })

    // Set 2FA verified flag in session
    response.cookies.set('2fa_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour
    })

    return response

  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { message: 'Failed to verify 2FA' },
      { status: 500 }
    )
  }
} 