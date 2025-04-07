import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { keycloakAdmin } from '@/lib/keycloak-admin'
import { supabase } from '@/lib/supabase'
import { authenticator } from 'otplib'

export async function POST() {
  try {
    const accessToken = cookies().get('access_token')?.value
    
    if (!accessToken) {
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
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const userInfo = await userInfoResponse.json()

    // Generate TOTP secret
    const secret = authenticator.generateSecret()
    
    // Generate QR code URL
    const qrCodeUrl = authenticator.keyuri(
      userInfo.email,
      'Pehchan',
      secret
    )

    // Store the secret in Supabase (temporarily, until verified)
    const { error } = await supabase
      .from('user_2fa_settings')
      .upsert({
        user_id: userInfo.sub,
        totp_secret: secret,
        totp_enabled: false,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error storing TOTP secret:', error)
      throw new Error('Failed to setup 2FA')
    }

    return NextResponse.json({
      secret,
      qrCodeUrl,
    })

  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { message: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
} 