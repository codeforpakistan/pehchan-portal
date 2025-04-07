import { NextResponse } from 'next/server'
import { keycloakAdmin } from '@/lib/keycloak-admin'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import Sendgrid from '@sendgrid/mail'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in Keycloak
    const keycloakUser = await keycloakAdmin.getUserByEmail(email)
    
    if (!keycloakUser) {
      // Don't reveal if user exists or not
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      })
    }

    // Generate a unique reset token
    const resetToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Store the reset token in Supabase
    const { error: dbError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: keycloakUser.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (dbError) {
      console.error('Error storing reset token:', dbError)
      throw new Error('Failed to process password reset request')
    }

    // Send reset email
    Sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    const msg = {
      to: email,
      from: 'civicflow@codeforpakistan.org',
      templateId: 'd-96afeb4e087b41bd9213a6dfac50646a', // You'll need to create a new template for password reset
      dynamicTemplateData: {
        resetUrl,
        firstName: keycloakUser.firstName || 'User',
        expiresIn: '1 hour'
      }
    }
    
    await Sendgrid.send(msg)

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
} 