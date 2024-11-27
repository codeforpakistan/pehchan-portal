import { NextResponse } from 'next/server'
import Sendgrid from '@sendgrid/mail'
import { keycloakAdmin } from '@/lib/keycloak-admin'
import jwt from 'jsonwebtoken'

const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || 'your-secret-key'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Find user in Keycloak
    const user = await keycloakAdmin.getUserByEmail(email)
    console.log(user)
    
    if (!user) {
      // Return success even if user not found (security best practice)
      return NextResponse.json({ success: true })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      RESET_TOKEN_SECRET,
      { expiresIn: '1h' }
    )

    // Create reset URL
    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`

    // Send email using SendGrid
    Sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)
    
    const msg = {
      to: email,
      from: 'civicflow@codeforpakistan.org',
      templateId: 'd-25d9e6f70e8e463f8a8297560b19b488',
      dynamicTemplateData: {
        resetUrl: resetUrl
      }
    }
    
    await Sendgrid.send(msg)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
} 