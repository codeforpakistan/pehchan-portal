import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { mockNextResponse } from '../tests/mocks/next-server';

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse
}));

// Mock Supabase auth helpers
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn().mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })
    }
  })
}));

// Helper function to create a mock NextRequest
const createMockRequest = (url: string) => {
  return {
    url,
    nextUrl: new URL(url),
    headers: new Headers(),
    cookies: new Map(),
    method: 'GET',
    geo: {},
    ip: '127.0.0.1',
    page: {},
    ua: {},
    cf: {},
    signal: new AbortController().signal,
    body: null,
    bodyUsed: false,
    cache: 'default',
    credentials: 'same-origin',
    destination: '',
    integrity: '',
    keepalive: false,
    mode: 'cors',
    redirect: 'follow',
    referrer: '',
    referrerPolicy: 'no-referrer',
    duplex: 'half',
    priority: 'auto',
    clone: () => createMockRequest(url),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  } as unknown as NextRequest;
};

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access to public paths', async () => {
    const request = createMockRequest('http://localhost:3000/login');
    const response = await middleware(request);
    expect(response).toBeUndefined();
  });

  it('should allow access to API paths', async () => {
    const request = createMockRequest('http://localhost:3000/api/auth/login');
    const response = await middleware(request);
    expect(response).toBeUndefined();
  });

  it('should redirect to login for protected paths when not authenticated', async () => {
    const request = createMockRequest('http://localhost:3000/dashboard');
    const response = await middleware(request);
    expect(mockNextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/login');
  });
}); 