import KcAdminClient from '@keycloak/keycloak-admin-client'
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth'
import { KEYCLOAK_CONFIG, KEYCLOAK_URLS } from './keycloak-config';

class KeycloakAdmin {
  private adminClient: KcAdminClient
  private _accessToken?: string;

  constructor() {
    this.adminClient = new KcAdminClient({
      baseUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realmName: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    })
  }

  async init() {
    try {
      await this.adminClient.auth({
        grantType: 'client_credentials',
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      } as Credentials)
    } catch (error) {
      console.error('Keycloak admin client initialization failed:', error)
      throw error
    }
  }

  async createUser(userData: {
    username: string
    email: string
    firstName: string
    lastName: string
    enabled: boolean
    emailVerified: boolean
    attributes?: Record<string, any>
    credentials?: Array<{ type: string; value: string; temporary: boolean }>
  }) {
    await this.init()
    return this.adminClient.users.create(userData)
  }

  async getUserByEmail(email: string) {
    await this.init()
    const users = await this.adminClient.users.find({ email })
    return users[0]
  }

  async getUserSessions(userId: string) {
    await this.init()
    return this.adminClient.users.listSessions({
      id: userId,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!
    })
  }

  get accessToken() {
    return this._accessToken;
  }

  async getAccessToken() {
    const response = await fetch(`${KEYCLOAK_URLS.TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: KEYCLOAK_CONFIG.CLIENT_ID,
        client_secret: KEYCLOAK_CONFIG.CLIENT_SECRET!,
      }),
    });
    const data = await response.json();
    this._accessToken = data.access_token;
    return this._accessToken;
  }
}

export const keycloakAdmin = new KeycloakAdmin()
