import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const accessToken = cookies().get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ isAuthenticated: false })
    }

    // Get Keycloak user info
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

    // Get Supabase profile data
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
        ...keycloakUser,  // Keep all Keycloak data
        profile: supabaseUser || null  // Add Supabase data under profile key
      }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ isAuthenticated: false })
  }
}
