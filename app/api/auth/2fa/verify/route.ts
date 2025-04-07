import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  try {
    const accessToken = cookies().get('access_token')?.value
    const { code } = await request.json()
    
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

    // Get the stored TOTP secret
    const { data: settings, error: fetchError } = await supabase
      .from('user_2fa_settings')
      .select('totp_secret')
      .eq('user_id', userInfo.sub)
      .single()

    if (fetchError || !settings?.totp_secret) {
      return NextResponse.json(
        { message: '2FA not setup' },
        { status: 400 }
      )
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: settings.totp_secret
    })

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid code' },
        { status: 400 }
      )
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )

    // Enable 2FA and store backup codes
    const { error: updateError } = await supabase
      .from('user_2fa_settings')
      .update({
        totp_enabled: true,
        backup_codes: backupCodes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userInfo.sub)

    if (updateError) {
      console.error('Error enabling 2FA:', updateError)
      throw new Error('Failed to enable 2FA')
    }

    return NextResponse.json({
      success: true,
      backupCodes,
    })

  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { message: 'Failed to verify 2FA' },
      { status: 500 }
    )
  }
} 