import { NextResponse } from 'next/server'
import { keycloakAdmin } from '@/lib/keycloak-admin'

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, cnic, password } = await request.json()

    // Split full name into first and last name
    const [firstName, ...lastNameParts] = fullName.split(' ')
    const lastName = lastNameParts.join(' ')

    // Create user in Keycloak
    const userData = {
      username: email,
      email,
      enabled: true,
      emailVerified: false,
      firstName,
      lastName,
      attributes: {
        phoneNumber: [phone],
        CNIC: [cnic],  // Changed from cnic to CNIC to match Keycloak config
      },
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    }

    await keycloakAdmin.createUser(userData)

    // Get Keycloak user ID
    const keycloakUser = await keycloakAdmin.getUserByEmail(email)
    
    if (!keycloakUser) {
      throw new Error('User creation failed')
    }

    // Here you can also store the user in your database with keycloakUser.id

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please log in.',
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
