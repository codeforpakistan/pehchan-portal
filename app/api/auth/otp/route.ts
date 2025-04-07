import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendSMS } from '@/lib/sms'
import { generateOTP } from '@/lib/utils'
import { normalizePhoneNumber } from '@/lib/phone'

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    // Generate OTP
    const otp = generateOTP(6)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_verification')
      .insert({
        phone_number: normalizedPhone,
        otp,
        expires_at: expiresAt,
      })

    if (dbError) {
      throw dbError
    }

    // Send SMS
    await sendSMS(normalizedPhone, `Your verification code is: ${otp}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OTP generation error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { message: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    // Verify OTP
    const { data, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_verification')
      .update({ verified: true })
      .eq('id', data.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to verify OTP' },
      { status: 500 }
    )
  }
} 