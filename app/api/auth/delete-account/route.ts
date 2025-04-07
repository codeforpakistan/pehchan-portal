import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { keycloakAdmin } from '@/lib/keycloak-admin'

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

    // Delete user data from Supabase
    const { error: supabaseError } = await supabase
      .from('user_2fa_settings')
      .delete()
      .eq('user_id', userInfo.sub)

    if (supabaseError) {
      console.error('Error deleting user data from Supabase:', supabaseError)
      // Continue with Keycloak deletion even if Supabase deletion fails
    }

    // Delete user from Keycloak using the admin client
    await keycloakAdmin.deleteUser(userInfo.sub)

    // Clear all cookies
    const response = NextResponse.json({ success: true })
    response.cookies.delete('access_token')
    response.cookies.delete('session')
    response.cookies.delete('2fa_verified')

    return response

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { message: 'Failed to delete account' },
      { status: 500 }
    )
  }
} 