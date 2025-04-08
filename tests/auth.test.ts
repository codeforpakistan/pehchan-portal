import { describe, it, expect, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '../app/api/auth/login/route'

// Mock global fetch
const mockResponse = {
  ok: true,
  text: () => Promise.resolve(JSON.stringify({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 300
  }))
} as Response;

(global.fetch as jest.Mock) = jest.fn().mockImplementation(() => Promise.resolve(mockResponse));

// Mock the Keycloak admin client
jest.mock('../lib/keycloak-admin', () => ({
  keycloakAdmin: {
    init: jest.fn().mockImplementation(() => Promise.resolve()),
    auth: jest.fn().mockImplementation(() => Promise.resolve({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 300
    })),
    findClient: jest.fn().mockImplementation(() => Promise.resolve([{
      id: 'test-client',
      clientId: 'test-client',
      secret: 'test-secret'
    }]))
  }
}))

// Helper function to create a mock NextRequest
const createMockRequest = (body: Record<string, unknown>) => {
  return {
    json: jest.fn().mockImplementation(() => Promise.resolve(body)),
    headers: new Headers()
  } as unknown as NextRequest
}

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle SSO login request', async () => {
    const request = createMockRequest({
      username: 'test@example.com',
      password: 'test-password',
      clientId: 'test-client',
      redirectUri: 'http://localhost:3000/callback'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('redirect')
    expect(data.redirect).toContain('access_token=mock-access-token')
  })

  it('should return 400 for missing required fields', async () => {
    // Mock fetch to return error for missing fields
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ error: 'Missing required fields' }))
      } as Response)
    )

    const request = createMockRequest({
      username: 'test@example.com',
      password: 'test-password'
      // Missing clientId and redirectUri
    })

    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error', 'Missing required fields')
  })

  it('should return 401 for invalid credentials', async () => {
    // Mock fetch to return error for invalid credentials
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify({ error: 'Invalid credentials' }))
      } as Response)
    )

    const request = createMockRequest({
      username: 'test@example.com',
      password: 'wrong-password',
      clientId: 'test-client',
      redirectUri: 'http://localhost:3000/callback'
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
}) 