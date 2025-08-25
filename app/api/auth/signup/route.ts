import { NextResponse } from "next/server"

import { keycloakAdmin } from "@/lib/keycloak-admin"
import { supabase } from "@/lib/supabase"

// Helper function to validate and normalize CNIC
function validateAndNormalizeCNIC(cnic: string): string | null {
  const normalizedCNIC = (cnic || "").replace(/\D/g, "")
  if (normalizedCNIC.length !== 13) {
    return null
  }
  return normalizedCNIC
}

/**
 * Email existence check (used before sending OTP)
 * POST /api/auth/signup?action=check-email
 */
async function handleCheckEmail(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Email is required" }, { status: 400 })
  }

  const trimmed = email.trim().toLowerCase()

  // 1) Check in Keycloak
  let kcExists = false
  try {
    const kcUser = await keycloakAdmin.getUserByEmail(trimmed)
    kcExists = Boolean(kcUser?.id)
  } catch {
    kcExists = false
  }

  // 2) Check in Supabase
  let sbExists = false
  try {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("email", trimmed)
      .limit(1)
      .maybeSingle()

    sbExists = Boolean(data?.id)
  } catch (e) {
    console.error("Supabase email check exception:", e)
    sbExists = false
  }

  return NextResponse.json({ exists: kcExists || sbExists })
}

/**
 * Signup user after OTP verification
 * POST /api/auth/signup
 */
async function handleSignup(request: Request) {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    cnic,
    emailVerified,
  } = await request.json()

  if (!email || !phoneNumber || !cnic || !password) {
    return NextResponse.json(
      { message: "Email, phone number, CNIC and password are required" },
      { status: 400 }
    )
  }

  const trimmedEmail = String(email).trim().toLowerCase()

  // Validate and normalize CNIC
  const normalizedCNIC = validateAndNormalizeCNIC(String(cnic))
  if (!normalizedCNIC) {
    return NextResponse.json(
      {
        message: "Invalid CNIC format. Please enter a valid 13-digit CNIC",
      },
      { status: 400 }
    )
  }

  // Re-check email duplication
  try {
    const existing = await keycloakAdmin.getUserByEmail(trimmedEmail)
    if (existing?.id) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      )
    }
  } catch {
    // not found is fine
  }

  // Create user in Keycloak
  await keycloakAdmin.createUser({
    username: trimmedEmail,
    email: trimmedEmail,
    firstName,
    lastName,
    enabled: true,
    emailVerified: Boolean(emailVerified),
    attributes: {
      phoneNumber: [phoneNumber],
      phoneNumberVerified: ["true"],
      cnic: [normalizedCNIC],
    },
    credentials: [
      {
        type: "password",
        value: String(password),
        temporary: false,
      },
    ],
  })

  // Get the Keycloak user ID
  const keycloakUserDetails = await keycloakAdmin.getUserByEmail(trimmedEmail)
  if (!keycloakUserDetails?.id) {
    throw new Error("Failed to retrieve Keycloak user details")
  }

  // Insert into Supabase
  const { error: supabaseError } = await supabase
    .from("users")
    .insert({
      keycloak_id: keycloakUserDetails.id,
      full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
      email: trimmedEmail,
      phone: phoneNumber,
      cnic: normalizedCNIC,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (supabaseError) {
    console.error("Supabase user creation failed:", supabaseError)
    await keycloakAdmin.deleteUser(keycloakUserDetails.id)
    throw new Error("Failed to create user profile")
  }

  return NextResponse.json({
    success: true,
    userId: keycloakUserDetails.id,
    message:
      "Account created successfully. Please verify your email to complete the setup.",
  })
}

/**
 * Route handler
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "check-email") {
      return handleCheckEmail(request)
    } else {
      return handleSignup(request)
    }
  } catch (error) {
    console.error("Signup route error:", error)
    const message =
      error instanceof Error ? error.message : "Failed to create account"
    if (/email.*exist/i.test(message)) {
      return NextResponse.json({ message }, { status: 409 })
    }
    return NextResponse.json({ message }, { status: 500 })
  }
}
