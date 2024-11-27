import { NextResponse } from 'next/server'
import { keycloakAdmin } from '@/lib/keycloak-admin'
import jwt from 'jsonwebtoken'

const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    const decoded = jwt.verify(token, RESET_TOKEN_SECRET) as {
      userId: string
      email: string
    }

    await keycloakAdmin.resetUserPassword(decoded.userId, password)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
} 