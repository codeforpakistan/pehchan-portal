import KcAdminClient from '@keycloak/keycloak-admin-client'
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth'

class KeycloakAdmin {
  private adminClient: KcAdminClient

  constructor() {
    this.adminClient = new KcAdminClient({
      baseUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realmName: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    })
  }

  async init() {
    try {
      await this.adminClient.auth({
        username: 'pehchan_admin',
        password: 'pehchan@#$',
        grantType: 'password',
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
}

export const keycloakAdmin = new KeycloakAdmin()
