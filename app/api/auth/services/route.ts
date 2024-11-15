import { KEYCLOAK_URLS, getKeycloakHeaders } from '@/lib/keycloak-config'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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