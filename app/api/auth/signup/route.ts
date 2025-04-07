import { NextResponse } from 'next/server'
import { keycloakAdmin } from '@/lib/keycloak-admin'

// Helper function to validate and normalize CNIC
function validateAndNormalizeCNIC(cnic: string): string | null {
  // Remove all non-digit characters
  const normalizedCNIC = cnic.replace(/\D/g, '')
  
  // Check if it's a valid 13-digit CNIC
  if (normalizedCNIC.length !== 13) {
    return null
  }
  
  return normalizedCNIC
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phoneNumber, password, cnic } = await request.json()

    // Validate required fields
    if (!email || !phoneNumber || !cnic) {
      return NextResponse.json(
        { message: 'Email, phone number, and CNIC are required' },
        { status: 400 }
      )
    }

    // Validate and normalize CNIC
    const normalizedCNIC = validateAndNormalizeCNIC(cnic)
    if (!normalizedCNIC) {
      return NextResponse.json(
        { message: 'Invalid CNIC format. Please enter a valid 13-digit CNIC' },
        { status: 400 }
      )
    }

    // Create user in Keycloak using the admin utility
    const user = await keycloakAdmin.createUser({
      username: email,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: false, // Start with email not verified
      attributes: {
        phoneNumber: [phoneNumber],
        phoneNumberVerified: ['true'], // Mark phone as verified since we've verified via OTP
        cnic: [normalizedCNIC], // Store normalized CNIC
      },
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    })

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      message: 'Account created successfully. Please verify your email to complete the setup.'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    )
  }
} 