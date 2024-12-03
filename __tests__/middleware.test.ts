import { middleware } from '@/middleware'
import { corsConfig } from '@/config/cors'

// Mock NextRequest and NextResponse
const mockNextRequest = (options = {}) => {
  const defaultOptions = {
    method: 'GET',
    url: 'http://localhost:3000',
    headers: new Headers(),
    cookies: { get: () => undefined },
    nextUrl: { pathname: '/' },
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  const headers = new Headers(mergedOptions.headers)
  
  return {
    ...mergedOptions,
    headers: {
      get: (name: string) => headers.get(name),
      set: (name: string, value: string) => headers.set(name, value),
    },
    nextUrl: {
      pathname: mergedOptions.nextUrl.pathname,
    },
  }
}

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    next: () => ({
      headers: new Map(),
      set: function(key: string, value: string) {
        this.headers.set(key, value)
      },
      get: function(key: string) {
        return this.headers.get(key)
      }
    }),
    redirect: (url: string) => ({
      headers: new Map(),
      status: 307,
      url,
      set: function(key: string, value: string) {
        this.headers.set(key, value)
      },
      get: function(key: string) {
        return this.headers.get(key)
      }
    }),
  }
}))

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CORS handling', () => {
    it('should allow requests from origins in corsConfig', async () => {
      const allowedOrigin = 'http://localhost:3000'
      const req = mockNextRequest({
        headers: { origin: allowedOrigin },
      })

      const response = await middleware(req as any)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should handle OPTIONS preflight requests correctly', async () => {
      const req = mockNextRequest({
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      })

      const response = await middleware(req as any)
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    })
  })

  describe('Authentication', () => {
    it('should redirect to login for protected routes without auth tokens', async () => {
      const req = mockNextRequest({
        nextUrl: { pathname: '/dashboard' },
      })

      const response = await middleware(req as any)
      expect(response.status).toBe(307)
      expect(response.url).toContain('/login')
    })

    it('should allow access to public paths without auth', async () => {
      const req = mockNextRequest({
        nextUrl: { pathname: '/images/test.png' },
      })

      const response = await middleware(req as any)
      expect(response.status).not.toBe(307)
    })

    it('should redirect authenticated users away from login/signup', async () => {
      const req = mockNextRequest({
        nextUrl: { pathname: '/login' },
        cookies: {
          get: (name: string) => ({
            session: { value: 'valid-session' },
            access_token: { value: 'valid-token' },
          }[name]),
        },
      })

      const response = await middleware(req as any)
      expect(response.status).toBe(307)
      expect(response.url).toContain('/dashboard')
    })
  })

  describe('Public paths', () => {
    const publicPaths = [
      '/images/test.png',
      '/login',
      '/signup',
      '/',
      '/api/auth/login',
      '/_next/static/chunks/main.js',
      '/favicon.ico'
    ]

    test.each(publicPaths)('should allow access to public path: %s', async (path) => {
      const req = mockNextRequest({
        nextUrl: { pathname: path },
      })

      const response = await middleware(req as any)
      expect(response.status).not.toBe(307)
    })
  })
}) 