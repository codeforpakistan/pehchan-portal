import { NextResponse } from 'next/server'
import KcAdminClient from '@keycloak/keycloak-admin-client'

export async function POST(request: Request) {
  try {
    const { clientName, redirectUris, baseUrl } = await request.json()

    if (!clientName || !redirectUris || !baseUrl) {
      return NextResponse.json(
        { message: 'clientName, redirectUris, and baseUrl are required' },
        { status: 400 }
      )
    }

    // Initialize Keycloak admin client
    const kcAdminClient = new KcAdminClient({
      baseUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realmName: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    })

    // Authenticate admin client
    await kcAdminClient.auth({
      grantType: 'client_credentials',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
    })

    // Create new client
    const client = await kcAdminClient.clients.create({
      clientId: clientName,
      name: clientName,
      enabled: true,
      protocol: 'openid-connect',
      publicClient: true,
      redirectUris: redirectUris,
      baseUrl: baseUrl,
      webOrigins: [baseUrl],
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      serviceAccountsEnabled: false,
      authorizationServicesEnabled: false,
      attributes: {
        'backchannel.logout.session.required': 'true',
        'backchannel.logout.revoke.offline.tokens': 'false',
      },
    })

    // Get client secret
    const clientSecret = await kcAdminClient.clients.getClientSecret({
      id: client.id!,
    })

    return NextResponse.json({
      success: true,
      clientId: client.id,
      clientSecret: clientSecret.value,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      authUrl: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth`,
      tokenUrl: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
      userInfoUrl: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
    })

  } catch (error) {
    console.error('SSO client provisioning error:', error)
    return NextResponse.json(
      { message: 'Failed to provision SSO client' },
      { status: 500 }
    )
  }
} 