import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
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

    // Get 2FA status from Supabase
    const { data: settings, error } = await supabase
      .from('user_2fa_settings')
      .select('totp_enabled')
      .eq('user_id', userInfo.sub)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching 2FA status:', error)
      throw new Error('Failed to fetch 2FA status')
    }

    return NextResponse.json({
      enabled: settings?.totp_enabled || false
    })

  } catch (error) {
    console.error('2FA status check error:', error)
    return NextResponse.json(
      { message: 'Failed to check 2FA status' },
      { status: 500 }
    )
  }
} 