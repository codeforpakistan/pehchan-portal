export const keycloakAdmin = {
  init: jest.fn().mockResolvedValue(undefined),
  auth: jest.fn().mockResolvedValue({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600
  }),
  users: {
    find: jest.fn().mockResolvedValue([{
      id: 'mock-user-id',
      email: 'ali@codeforpakistan.org',
      firstName: 'Ali',
      lastName: 'Raza',
      enabled: true,
      emailVerified: true
    }])
  }
} 