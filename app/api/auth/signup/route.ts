import { NextResponse } from "next/server"

import { keycloakAdmin } from "@/lib/keycloak-admin"
import { supabase } from "@/lib/supabase"

// Helper function to validate and normalize CNIC
function validateAndNormalizeCNIC(cnic: string): string | null {
  const normalizedCNIC = cnic.replace(/\D/g, "")
  return normalizedCNIC.length === 13 ? normalizedCNIC : null
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phoneNumber, password, cnic } =
      await request.json()

    console.log("📥 Signup data received from frontend:", {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      cnic,
    })

    if (!email || !phoneNumber || !cnic) {
      return NextResponse.json(
        { message: "Email, phone number, and CNIC are required" },
        { status: 400 }
      )
    }

    const normalizedCNIC = validateAndNormalizeCNIC(cnic)
    if (!normalizedCNIC) {
      return NextResponse.json(
        { message: "Invalid CNIC format. Please enter a valid 13-digit CNIC" },
        { status: 400 }
      )
    }

    // Create user in Keycloak
    const keycloakUser = await keycloakAdmin.createUser({
      username: email,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: true,
      attributes: {
        phoneNumber: [phoneNumber],
        phoneNumberVerified: ["true"],
        cnic: [normalizedCNIC],
      },
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
    })

    const keycloakUserDetails = await keycloakAdmin.getUserByEmail(email)
    if (!keycloakUserDetails?.id) {
      throw new Error("Failed to retrieve Keycloak user details")
    }

    console.log("✅ Keycloak user created:", keycloakUserDetails)

    // 👇 checking fullname
    console.log("📝 Saving user with full_name:", `${firstName} ${lastName}`)

    // Try saving in Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from("users")
      .insert({
        keycloak_id: keycloakUserDetails.id,
        full_name: `${firstName} ${lastName}`,
        email,
        phone: phoneNumber,
        cnic: normalizedCNIC,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (supabaseError) {
      console.error("❌ Supabase user creation failed:", supabaseError)
      await keycloakAdmin.deleteUser(keycloakUserDetails.id)
      throw new Error("Failed to create user profile")
    }

    console.log("✅ User saved in Supabase:", supabaseUser)

    return NextResponse.json({
      success: true,
      userId: keycloakUserDetails.id,
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 }
    )
  }
}
