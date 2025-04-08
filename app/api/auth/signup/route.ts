import { NextResponse } from 'next/server'
import { keycloakAdmin } from '@/lib/keycloak-admin'
import { supabase } from '@/lib/supabase'

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
    const keycloakUser = await keycloakAdmin.createUser({
      username: email,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: true, // Set to true since we've verified via OTP
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

    // Get the Keycloak user ID
    const keycloakUserDetails = await keycloakAdmin.getUserByEmail(email)
    if (!keycloakUserDetails?.id) {
      throw new Error('Failed to retrieve Keycloak user details')
    }

    // Create user in Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from('users')
      .insert({
        keycloak_id: keycloakUserDetails.id,
        full_name: `${firstName} ${lastName}`,
        email: email,
        phone: phoneNumber,
        cnic: normalizedCNIC,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (supabaseError) {
      console.error('Supabase user creation failed:', supabaseError)
      // Rollback Keycloak user creation
      await keycloakAdmin.deleteUser(keycloakUserDetails.id)
      throw new Error('Failed to create user profile')
    }

    return NextResponse.json({ 
      success: true, 
      userId: keycloakUserDetails.id,
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