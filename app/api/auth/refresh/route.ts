import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/auth/refresh:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Refresh user authentication status
 *     description: Validates the access token and retrieves updated user information from Keycloak and Supabase.
 *     responses:
 *       200:
 *         description: User authentication status refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   description: Indicates if the user is authenticated.
 *                   example: true
 *                 user:
 *                   type: object
 *                   description: User data from Keycloak and Supabase.
 *                   properties:
 *                     sub:
 *                       type: string
 *                       description: Keycloak user ID.
 *                       example: "12345678-abcd-efgh-ijkl-9876543210"
 *                     email:
 *                       type: string
 *                       description: User's email from Keycloak.
 *                       example: "user@example.com"
 *                     profile:
 *                       type: object
 *                       description: Additional user data from Supabase.
 *                       nullable: true
 *       401:
 *         description: Authentication failed or the user is not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   description: Indicates if the user is authenticated.
 *                   example: false
 */


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