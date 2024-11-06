import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    // Get the access token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing or invalid token' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    // Verify token with Keycloak
    const userInfoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const keycloakUser = await userInfoResponse.json()

    // Get additional user data from Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from('users')
      .select('*')
      .eq('keycloak_id', keycloakUser.sub)
      .single()

    if (supabaseError) {
      console.error('Supabase error:', supabaseError)
    }

    // Combine and return user information
    return NextResponse.json({
      // Basic profile info
      sub: keycloakUser.sub,
      email: keycloakUser.email,
      email_verified: keycloakUser.email_verified,
      name: keycloakUser.name,
      given_name: keycloakUser.given_name,
      family_name: keycloakUser.family_name,
      
      // Additional Pehchan-specific info
      profile: {
        cnic: supabaseUser?.cnic,
        phone: supabaseUser?.phone,
        // Add any other relevant fields
      }
    })

  } catch (error) {
    console.error('UserInfo error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch user information' },
      { status: 500 }
    )
  }
} 