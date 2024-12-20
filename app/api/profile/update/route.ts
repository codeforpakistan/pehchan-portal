import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
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
    const { full_name, phone, cnic, avatar_url } = await request.json()

    // Update profile in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        full_name,
        phone,
        cnic,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('keycloak_id', userInfo.sub)

    if (error) {
      console.error('Profile update error:', error)
      throw error
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 