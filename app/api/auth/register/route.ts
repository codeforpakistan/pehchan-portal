import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { keycloakAdmin } from '@/lib/keycloak-admin'

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Registers a new user by creating their account in both Keycloak and Supabase.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - cnic
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The user's full name.
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 description: The user's phone number.
 *                 example: +1234567890
 *               cnic:
 *                 type: string
 *                 description: The user's CNIC (or national ID number).
 *                 example: 12345-6789012-3
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: StrongP@ssw0rd
 *     responses:
 *       200:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the registration was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Message describing the operation result.
 *                   example: Registration successful! Please log in.
 *       500:
 *         description: Registration failed due to server-side error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the registration was successful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message describing what went wrong.
 *                   example: Failed to create user profile.
 */


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
    console.log('Keycloak user:', keycloakUser)
    
    if (!keycloakUser) {
      throw new Error('User creation failed')
    }

    // Create user in Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from('users')
      .insert({
        keycloak_id: keycloakUser.id,
        full_name: fullName,
        email: email,
        phone: phone,
        cnic: cnic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (supabaseError) {
      console.error('Supabase user creation failed:', supabaseError)
      // You might want to delete the Keycloak user if Supabase insertion fails
      throw new Error('Failed to create user profile')
    }

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
