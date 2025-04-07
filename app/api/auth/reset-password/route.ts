import { NextResponse } from 'next/server'
import { keycloakAdmin } from '@/lib/keycloak-admin'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate the reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    const expiresAt = new Date(resetToken.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Reset password in Keycloak
    await keycloakAdmin.resetUserPassword(resetToken.user_id, password)

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token)

    return NextResponse.json({ 
      message: 'Password has been reset successfully' 
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    )
  }
} 