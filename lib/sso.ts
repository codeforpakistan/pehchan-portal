import { keycloakAdmin } from './keycloak-admin'
import KcAdminClient from '@keycloak/keycloak-admin-client'

interface SSOClient {
  clientId: string
  redirectUris: string[]
  allowedOrigins?: string[]
  scopes?: string[]
}

export async function registerSSOClient(client: SSOClient) {
  try {
    // Create a new admin client instance for this operation
    const adminClient = new KcAdminClient({
      baseUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realmName: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    })

    // Authenticate with admin credentials
    await adminClient.auth({
      grantType: 'client_credentials',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    })
    
    const clientConfig = {
      clientId: client.clientId,
      enabled: true,
      protocol: 'openid-connect',
      publicClient: false,
      redirectUris: client.redirectUris,
      webOrigins: client.allowedOrigins || [],
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: true,
      serviceAccountsEnabled: false,
      authorizationServicesEnabled: false,
      attributes: {
        'oauth2.device.authorization.grant.enabled': 'false',
        'backchannel.logout.session.required': 'true',
        'backchannel.logout.revoke.offline.tokens': 'false',
      },
      defaultClientScopes: [
        'web-origins',
        'roles',
        'profile',
        'email'
      ],
      optionalClientScopes: client.scopes || [],
    }

    const createdClient = await adminClient.clients.create(clientConfig)
    return createdClient
  } catch (error) {
    console.error('Error registering SSO client:', error)
    throw error
  }
}

export async function validateSSORequest(clientId: string, redirectUri: string) {
  try {
    await keycloakAdmin.init()
    
    const clients = await keycloakAdmin.findClient(clientId)
    if (!clients || clients.length === 0) {
      throw new Error('Invalid client ID')
    }

    const client = clients[0]
    const validRedirectUris = client.redirectUris || []
    
    if (!validRedirectUris.includes(redirectUri)) {
      throw new Error('Invalid redirect URI')
    }

    return true
  } catch (error) {
    console.error('Error validating SSO request:', error)
    throw error
  }
}

export async function generatePKCE() {
  const verifier = generateRandomString(128)
  const challenge = base64URLEncode(await sha256(verifier))
  return { verifier, challenge }
}

function generateRandomString(length: number) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function base64URLEncode(str: string) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function sha256(str: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
} 