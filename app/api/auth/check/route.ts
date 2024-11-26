import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify authentication status
 *     description: Validates the user's authentication status using an access token stored in cookies. Fetches user details from Keycloak and optionally retrieves additional profile data from Supabase.
 *     responses:
 *       200:
 *         description: Returns the authentication status and user information if authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   description: Indicates whether the user is authenticated.
 *                   example: true
 *                 user:
 *                   type: object
 *                   description: User details from Keycloak and Supabase.
 *                   properties:
 *                     sub:
 *                       type: string
 *                       description: User's unique identifier in Keycloak.
 *                       example: "user123"
 *                     email:
 *                       type: string
 *                       description: User's email address.
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       description: User's full name.
 *                       example: "John Doe"
 *                     profile:
 *                       type: object
 *                       description: Additional user profile information from Supabase.
 *                       properties:
 *                         cnic:
 *                           type: string
 *                           description: User's CNIC number.
 *                           example: "12345-6789012-3"
 *                         phone:
 *                           type: string
 *                           description: User's phone number.
 *                           example: "+1234567890"
 *       401:
 *         description: User is not authenticated or access token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   description: Indicates whether the user is authenticated.
 *                   example: false
 *       500:
 *         description: An error occurred during the authentication check.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   description: Indicates whether the user is authenticated.
 *                   example: false
 */


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
