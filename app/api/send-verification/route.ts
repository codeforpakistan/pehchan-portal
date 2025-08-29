import { NextResponse } from "next/server"
import Sendgrid from "@sendgrid/mail"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      )
    }

    Sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)

    const msg = {
      to: email,
      from: "civicflow@codeforpakistan.org",
      templateId: "d-070a0738fac147eb878f87b86eed664c",
      dynamicTemplateData: { VCODE: code },
    }

    await Sendgrid.send(msg)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}
