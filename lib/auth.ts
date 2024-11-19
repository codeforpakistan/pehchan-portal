export async function getAccessToken() {
  const response = await fetch('/api/auth/token')
  if (!response.ok) {
    throw new Error('Failed to get access token')
  }
  const { accessToken } = await response.json()
  return accessToken
} 