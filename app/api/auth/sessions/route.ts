import { keycloakAdmin } from '@/lib/keycloak-admin'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { KEYCLOAK_URLS } from '@/lib/keycloak-config'

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Fetch active user sessions from Keycloak
 *     description: Retrieves all active user sessions from Keycloak using the access token stored in cookies, and formats the session data.
 *     responses:
 *       200:
 *         description: Successfully fetched active user sessions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   clientId:
 *                     type: string
 *                     description: The ID of the client associated with the session.
 *                     example: "my-client-id"
 *                   clientName:
 *                     type: string
 *                     description: The name of the client associated with the session.
 *                     example: "My Client"
 *                   active:
 *                     type: boolean
 *                     description: Whether the session is currently active.
 *                     example: true
 *                   lastAccess:
 *                     type: string
 *                     format: date-time
 *                     description: The time when the session was last accessed.
 *                     example: "2024-11-25T12:34:56.789Z"
 *                   started:
 *                     type: string
 *                     format: date-time
 *                     description: The time when the session started.
 *                     example: "2024-11-25T12:00:00.000Z"
 *                   ipAddress:
 *                     type: string
 *                     description: The IP address from which the session originated.
 *                     example: "192.168.1.1"
 *       401:
 *         description: No access token found or the access token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the lack of an access token.
 *                   example: "No access token found"
 *       500:
 *         description: Failed to fetch user sessions due to a server-side error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating a failure in fetching sessions.
 *                   example: "Failed to fetch user sessions"
 */


interface KeycloakSession {
  id?: string
  username?: string
  userId?: string
  ipAddress?: string
  start?: number
  lastAccess?: number
  clients?: { [key: string]: string }
}

export async function GET() {
  try {
    const accessToken = cookies().get('access_token')?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    // Get user info to get the user ID
    const userInfoResponse = await fetch(
      `${KEYCLOAK_URLS.USERINFO}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    )
    const userInfo = await userInfoResponse.json()

    // Get sessions using the admin client
    const sessions = await keycloakAdmin.getUserSessions(userInfo.sub)

    console.log('Sessions:', sessions)

    // Transform the sessions data to match our interface
    const formattedSessions = sessions.map((session: KeycloakSession) => {
      // Get the first client name from the clients object, if it exists
      const clientId = session.clients ? Object.keys(session.clients)[0] : undefined
      const clientName = clientId && session.clients?.[clientId]

      return {
        clientId,
        clientName,
        active: true,
        lastAccess: session.lastAccess ? new Date(session.lastAccess).toISOString() : undefined,
        started: session.start ? new Date(session.start).toISOString() : undefined,
        ipAddress: session.ipAddress
      }
    })

    return NextResponse.json(formattedSessions)

  } catch (error: any) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user sessions' },
      { status: 500 }
    )
  }
}