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
        grantType: 'client_credentials',
        clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
        clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
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

  async resetUserPassword(userId: string, password: string) {
    await this.init()
    return this.adminClient.users.resetPassword({
      id: userId,
      credential: {
        temporary: false,
        type: 'password',
        value: password,
      },
    })
  }

  async deleteUser(userId: string) {
    await this.init()
    return this.adminClient.users.del({
      id: userId,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!
    })
  }

  async createClient(clientConfig: any) {
    await this.init()
    return this.adminClient.clients.create(clientConfig)
  }

  async findClient(clientId: string) {
    await this.init()
    return this.adminClient.clients.find({ clientId })
  }
}

export const keycloakAdmin = new KeycloakAdmin()
