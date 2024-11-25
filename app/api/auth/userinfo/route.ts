import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const allowedOrigin = process.env.NODE_ENV === 'production' 
  ? process.env.FBR_PORTAL_URL ?? 'https://default-production-url.com'
  : 'http://localhost:3001'

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

/**
 * @swagger
 * /api/auth/userinfo:
 *   get:
 *     summary: Get user information
 *     description: Retrieve authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sub:
 *                   type: string
 *                 email:
 *                   type: string
 *                 email_verified:
 *                   type: boolean
 *                 name:
 *                   type: string
 *                 profile:
 *                   type: object
 *                   properties:
 *                     cnic:
 *                       type: string
 *                     phone:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: Request) {
  try {
    // Get the access token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing or invalid token' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
          }
        }
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
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
          }
        }
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
    }, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
      }
    })

  } catch (error) {
    console.error('UserInfo error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch user information' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
        }
      }
    )
  }
}