import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value

  let decodedToken = null
  if (accessToken) {
    try {
      // Decode without verification since we don't have the public key
      decodedToken = jwt.decode(accessToken)
    } catch (error) {
      console.error('Token decode error:', error)
    }
  }

  return NextResponse.json({
    isAuthenticated: !!accessToken,
    tokenInfo: decodedToken,
    accessTokenExists: !!accessToken,
    refreshTokenExists: !!refreshToken,
    cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))
  })
}
