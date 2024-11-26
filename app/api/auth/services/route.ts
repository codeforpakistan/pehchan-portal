import { KEYCLOAK_URLS, getKeycloakHeaders } from '@/lib/keycloak-config'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/user/services:
 *   get:
 *     tags:
 *       -  Authentication
 *     summary: Fetch user services from Keycloak
 *     description: Retrieves user service data from Keycloak using the access token stored in cookies.
 *     responses:
 *       200:
 *         description: Successfully fetched user services.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userInfo:
 *                   type: object
 *                   description: The user information fetched from Keycloak.
 *                   example:
 *                     sub: "12345"
 *                     email: "user@example.com"
 *                     name: "John Doe"
 *       401:
 *         description: No access token found or access token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating lack of access token.
 *                   example: "No access token found"
 *       500:
 *         description: Failed to fetch user services due to server-side error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating a failure in fetching data.
 *                   example: "Failed to fetch user services"
 */


export async function GET() {
  try {
    const accessToken = cookies().get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    const response = await fetch(KEYCLOAK_URLS.USERINFO, {
      headers: getKeycloakHeaders(accessToken)
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user services')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user services' },
      { status: 500 }
    )
  }
} 