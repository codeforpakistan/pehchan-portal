import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const accessToken = cookies().get('access_token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ isAuthenticated: false })
    }

    // Get fresh user info from Keycloak
    const userInfoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      return NextResponse.json({ isAuthenticated: false })
    }

    const keycloakUser = await userInfoResponse.json()

    // Get fresh Supabase profile data
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from('users')
      .select('*')
      .eq('keycloak_id', keycloakUser.sub)
      .single()

    if (supabaseError) {
      console.error('Failed to fetch Supabase user data:', supabaseError)
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        ...keycloakUser,
        profile: supabaseUser || null
      }
    })
  } catch (error) {
    console.error('Auth refresh error:', error)
    return NextResponse.json({ isAuthenticated: false })
  }
} 