// Keycloak configuration with type safety
interface KeycloakConfig {
  URL: string
  REALM: string
  CLIENT_ID: string
  CLIENT_SECRET?: string
  REDIRECT_URI: string
}

if (!process.env.NEXT_PUBLIC_KEYCLOAK_URL) {
  throw new Error('NEXT_PUBLIC_KEYCLOAK_URL is not defined')
}

if (!process.env.NEXT_PUBLIC_KEYCLOAK_REALM) {
  throw new Error('NEXT_PUBLIC_KEYCLOAK_REALM is not defined')
}

if (!process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID) {
  throw new Error('NEXT_PUBLIC_KEYCLOAK_CLIENT_ID is not defined')
}

// Only check for CLIENT_SECRET in server-side code
const isServer = typeof window === 'undefined'
if (isServer && !process.env.KEYCLOAK_CLIENT_SECRET) {
  throw new Error('KEYCLOAK_CLIENT_SECRET is not defined (required for server-side operations)')
}

export const KEYCLOAK_CONFIG: KeycloakConfig = {
  URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  ...(isServer && { CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET }),
  REDIRECT_URI: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
}

// Useful URLs derived from the config
export const KEYCLOAK_URLS = {
  BASE: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  AUTH: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth`,
  TOKEN: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
  USERINFO: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
  LOGOUT: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`,
  WEBAUTHN: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/webauthn`
}

// Helper function to get headers for Keycloak requests
export const getKeycloakHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Helper function to create login URL with all necessary parameters
export const createLoginUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CONFIG.CLIENT_ID,
    redirect_uri: KEYCLOAK_CONFIG.REDIRECT_URI,
    state,
    response_type: 'code',
    scope: 'openid profile email',
  })

  return `${KEYCLOAK_URLS.AUTH}?${params.toString()}`
}

// Helper function to create logout URL
export const createLogoutUrl = (redirectUri: string) => {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CONFIG.CLIENT_ID,
    post_logout_redirect_uri: redirectUri,
  })

  return `${KEYCLOAK_URLS.LOGOUT}?${params.toString()}`
}

// Add to existing file
export const createAuthorizationUrl = (clientId: string, redirectUri: string, state: string) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid profile email'
  })

  return `${KEYCLOAK_URLS.AUTH}?${params.toString()}`
}
