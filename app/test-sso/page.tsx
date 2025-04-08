'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility function to generate a random string
function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  return Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

// Utility function to generate PKCE challenge and verifier
async function generatePKCE() {
  const verifier = generateRandomString(32)
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  const challenge = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return { verifier, challenge }
}

export default function TestSSOPage() {
  const [clientId, setClientId] = useState('test-client')
  const [redirectUri, setRedirectUri] = useState('http://localhost:3001/auth/callback')
  const [loginUrl, setLoginUrl] = useState('')

  const handleGenerateLoginUrl = async () => {
    try {
      const { verifier, challenge } = await generatePKCE()
      const state = generateRandomString(32)
      
      // Store verifier and state in localStorage for verification
      localStorage.setItem('pkce_verifier', verifier)
      localStorage.setItem('oauth_state', state)

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256'
      })

      const url = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth?${params.toString()}`
      setLoginUrl(url)
    } catch (error) {
      console.error('Error generating login URL:', error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>SSO Test Client</CardTitle>
          <CardDescription>
            Test the SSO flow by generating a login URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="redirectUri">Redirect URI</Label>
            <Input
              id="redirectUri"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerateLoginUrl}>
            Generate Login URL
          </Button>
          {loginUrl && (
            <div className="mt-4 p-4 bg-muted rounded">
              <p className="text-sm font-mono break-all">{loginUrl}</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => window.open(loginUrl, '_blank')}
              >
                Open Login Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 