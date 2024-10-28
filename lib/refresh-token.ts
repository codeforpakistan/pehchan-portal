import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from '@/lib/keycloak-config'
import { cookies } from 'next/headers'

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
}

export async function refreshAccessToken(): Promise<TokenResponse | null> {
  const cookieStore = cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(KEYCLOAK_URLS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: KEYCLOAK_CONFIG.CLIENT_ID,
        client_secret: KEYCLOAK_CONFIG.CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}
