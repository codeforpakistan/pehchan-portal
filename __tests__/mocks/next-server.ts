export const mockRedirect = jest.fn().mockImplementation((url: string) => ({
  url,
  status: 302,
  headers: new Headers({ Location: url })
}));

export const mockNextResponse = {
  next: jest.fn(),
  redirect: mockRedirect,
  json: jest.fn()
}; 