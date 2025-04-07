import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { keycloakAdmin } from '@/lib/keycloak-admin'

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()
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
      console.error('User info response:', await userInfoResponse.text())
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const userInfo = await userInfoResponse.json()
    console.log('User info:', userInfo)

    // Verify current password by attempting to get a new token
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          username: userInfo.preferred_username,
          password: currentPassword,
          grant_type: 'password',
        }),
      }
    )

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text()
      console.error('Password verification failed:', errorText)
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Use keycloakAdmin to reset the password
    await keycloakAdmin.resetUserPassword(userInfo.sub, newPassword)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { message: 'Failed to change password' },
      { status: 500 }
    )
  }
} 