import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { supabase } from "@/lib/supabase"

// --- Utility Validations ---
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  return /^[0-9]{10,15}$/.test(phone) // 10 se 15 digits
}

function validateCNIC(cnic: string): boolean {
  return /^[0-9]{13}$/.test(cnic) // Pakistan CNIC: 13 digits
}

export async function POST(request: Request) {
  try {
    const accessToken = cookies().get("access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user info from Keycloak
    const userInfoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const userInfo = await userInfoResponse.json()
    const { full_name, phone, cnic, avatar_url, email } = await request.json()

    // --- Field Validations ---
    if (!full_name || full_name.trim().length < 3) {
      return NextResponse.json(
        { message: "Full name must be at least 3 characters long" },
        { status: 400 }
      )
    }

    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      )
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { message: "Phone number must be 10–15 digits" },
        { status: 400 }
      )
    }

    if (cnic && !validateCNIC(cnic)) {
      return NextResponse.json(
        { message: "CNIC must be 13 digits" },
        { status: 400 }
      )
    }

    // --- Update profile in Supabase ---
    const { error } = await supabase
      .from("users")
      .update({
        full_name,
        phone,
        cnic,
        avatar_url,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("keycloak_id", userInfo.sub)

    if (error) {
      console.error("Profile update error:", error)
      throw error
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    )
  }
}
