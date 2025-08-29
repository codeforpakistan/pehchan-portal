import { NextResponse } from "next/server"
import Sendgrid from "@sendgrid/mail"

import { normalizePhoneNumber } from "@/lib/phone"
import { sendSMS } from "@/lib/sms"
import { supabase } from "@/lib/supabase"
import { generateOTP } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { phoneNumber, email } = await request.json()
    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    const otp = generateOTP(6) // actual OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 mins

    // Store OTP in database
    const { error: dbError } = await supabase.from("otp_verification").insert({
      phone_number: normalizedPhone,
      email: email,
      otp,
      expires_at: expiresAt,
    })
    if (dbError) throw dbError

    // Send SMS
    await sendSMS(normalizedPhone, `Your verification code is: ${otp}`)

    // Send Email if provided
    if (email) {
      Sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)
      const msg = {
        to: email,
        from: "civicflow@codeforpakistan.org",
        templateId: "d-070a0738fac147eb878f87b86eed664c",
        dynamicTemplateData: { VCODE: otp },
      }
      await Sendgrid.send(msg)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("OTP generation error:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to send OTP",
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { phoneNumber, email, otp } = await request.json()
    if (!otp || (!phoneNumber && !email)) {
      return NextResponse.json(
        { message: "OTP and either phone number or email are required" },
        { status: 400 }
      )
    }

    const normalizedPhone = phoneNumber
      ? normalizePhoneNumber(phoneNumber)
      : null

    const { data, error } = await supabase
      .from("otp_verification")
      .select("*")
      .or(`phone_number.eq.${normalizedPhone},email.eq.${email}`)
      .eq("otp", otp)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from("otp_verification")
      .update({ verified: true })
      .eq("id", data.id)
    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to verify OTP",
      },
      { status: 500 }
    )
  }
}
