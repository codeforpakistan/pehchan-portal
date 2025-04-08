import { keycloakAdmin } from '@/lib/keycloak-admin'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { KEYCLOAK_URLS } from '@/lib/keycloak-config'

interface KeycloakSession {
  id?: string
  username?: string
  userId?: string
  ipAddress?: string
  start?: number
  lastAccess?: number
  clients?: { [key: string]: string }
}

export const dynamic = 'force-dynamic'

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
        id: session.id,
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

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

    // Delete the session using the admin client
    await keycloakAdmin.deleteUserSession(userInfo.sub, sessionId)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Session logout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to logout from session' },
      { status: 500 }
    )
  }
}