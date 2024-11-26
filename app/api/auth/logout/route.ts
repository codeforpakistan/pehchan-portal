import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log out the user
 *     description: Ends the user's session in Keycloak and clears all authentication-related cookies.
 *     responses:
 *       200:
 *         description: User has been logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating successful logout.
 *                   example: "Logged out successfully"
 *       500:
 *         description: An error occurred during the logout process.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating logout failure.
 *                   example: "Failed to logout"
 */


export async function POST() {
  try {
    const accessTokenCookie = cookies().get('access_token')
    
    if (accessTokenCookie?.value) {
      // End the Keycloak session
      const endSessionUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`
      
      const response = await fetch(endSessionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessTokenCookie.value}`
        }
      })

      if (!response.ok) {
        console.error('Keycloak session end failed:', await response.text())
      }
    }

    // Clear all auth-related cookies
    cookies().delete('session')
    cookies().delete('access_token')
    cookies().delete('refresh_token')
    cookies().delete('id_token')  // If you're using ID tokens
    
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Failed to logout' },
      { status: 500 }
    )
  }
} 