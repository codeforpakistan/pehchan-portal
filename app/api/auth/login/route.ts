import { NextResponse } from "next/server"

import { keycloakAdmin } from "@/lib/keycloak-admin"
import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from "@/lib/keycloak-config"

export async function POST(request: Request) {
  try {
    const { username, password, clientId, redirectUri, state } =
      await request.json()
    console.log("Login request:", { username, clientId, redirectUri, state })

    // Default client secret
    let clientSecret = KEYCLOAK_CONFIG.CLIENT_SECRET

    // SSO login: fetch client secret dynamically
    if (clientId) {
      try {
        const clients = await keycloakAdmin.findClient(clientId)
        if (!clients || clients.length === 0)
          throw new Error("Invalid client ID")
        const client = clients[0]
        if (!client.secret) throw new Error("Client configuration error")
        clientSecret = client.secret
      } catch (error) {
        console.error("Error fetching client:", error)
        throw new Error("Failed to validate client")
      }
    }

    // Fetch tokens from Keycloak
    const tokenResponse = await fetch(KEYCLOAK_URLS.TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: clientId || KEYCLOAK_CONFIG.CLIENT_ID,
        client_secret: clientSecret!,
        username,
        password,
        scope: "openid profile email",
      }),
    })

    // Parse Keycloak response safely
    let tokens: any
    try {
      const text = await tokenResponse.text()
      console.log("Keycloak raw response:", text)
      tokens = JSON.parse(text)
    } catch (e) {
      console.error("JSON parse error:", e)
      throw new Error("Invalid response from Keycloak")
    }

    if (!tokenResponse.ok) {
      console.error("Keycloak error response:", tokens)
      const friendlyMessageMap: Record<string, string> = {
        invalid_grant: "Invalid username or password.",
        invalid_client: "Client authentication failed.",
      }
      const message =
        tokens.error && friendlyMessageMap[tokens.error]
          ? friendlyMessageMap[tokens.error]
          : tokens.error_description || tokens.error || "Authentication failed."
      throw new Error(message)
    }

    // SSO login redirect
    const isSsoLogin = clientId && redirectUri
    if (isSsoLogin) {
      const finalRedirectUrl = new URL(redirectUri)
      finalRedirectUrl.searchParams.set("access_token", tokens.access_token)
      finalRedirectUrl.searchParams.set("id_token", tokens.id_token || "")
      if (state) finalRedirectUrl.searchParams.set("state", state)
      return NextResponse.json({ redirect: finalRedirectUrl.toString() })
    }

    // Regular login
    const response = NextResponse.json({
      isAuthenticated: true,
      message: "Login successful",
    })

    response.cookies.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
    })

    response.cookies.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.refresh_expires_in,
    })

    return response
  } catch (error: any) {
    console.error("Login error:", error)
    let message = "An unexpected error occurred. Please try again."
    if (error instanceof Error) message = error.message
    else if (error?.message) message = error.message
    else if (typeof error === "string") message = error

    return NextResponse.json(
      {
        isAuthenticated: false,
        message,
      },
      { status: 401 }
    )
  }
}
