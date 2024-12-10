"use client"

export const dynamic = 'force-dynamic'
export const runtime = 'edge'


import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const searchParams = useSearchParams()
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const serviceName = searchParams.get('service_name')
  const [isPasskeySupported, setIsPasskeySupported] = useState(false)

  // Store client info in session
  useEffect(() => {
    if (clientId && redirectUri) {
      sessionStorage.setItem('oauth_client', JSON.stringify({
        clientId,
        redirectUri,
        serviceName
      }))
    }
  }, [clientId, redirectUri, serviceName])

  // Check if browser supports WebAuthn/passkeys
  useEffect(() => {
    setIsPasskeySupported(
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential === 'function'
    )
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          ...(clientId && { clientId }),
          ...(redirectUri && { redirectUri }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.redirect) {
        window.location.href = data.redirect
        return
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      })
      router.push('/dashboard')

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle passkey registration
  const handlePasskeyRegistration = async () => {
    if (!formData.username) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your username first",
      })
      return
    }

    try {
      // Get registration options from server
      const optionsRes = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username: formData.username,
        }),
      })
      
      const options = await optionsRes.json()

      // Start registration
      const credential = await startRegistration(options)

      // Complete registration
      const verificationRes = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-finish',
          username: formData.username,
          credential,
        }),
      })

      if (!verificationRes.ok) {
        throw new Error('Failed to register passkey')
      }

      toast({
        title: "Success",
        description: "Passkey registered successfully",
      })

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register passkey",
      })
    }
  }

  // Function to handle passkey authentication
  const handlePasskeyLogin = async () => {
    try {
      // Get WebAuthn options
      const optionsRes = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'authenticate',
          username: formData.username,
        }),
      })

      const options = await optionsRes.json()
      
      // Start WebAuthn authentication
      const credential = await startAuthentication({
        optionsJSON: {
          challenge: options.challenge,
          rpId: options.rpId,
          allowCredentials: [],
          userVerification: options.userVerification,
        }
      })

      // Complete authentication
      const verificationRes = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'authenticate-finish',
          username: formData.username,
          credential,
        }),
      })

      const result = await verificationRes.json()
      if (result.access_token) {
        toast({
          title: "Success",
          description: "Logged in successfully with passkey",
        })
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Passkey login failed",
      })
    }
  }

  return (
    <div className="bg-background flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {serviceName ? (
              <>Login to access {serviceName}</>
            ) : (
              <>Login to Pehchan</>
            )}
          </CardTitle>
          {clientId && (
            <CardDescription className="text-center">
              Using Pehchan ID for secure access
            </CardDescription>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                required
              />
            </div>
            
            {isPasskeySupported && (
              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasskeyLogin}
                >
                  Sign in with Passkey
                </Button>
                <div className="text-sm text-muted-foreground text-center">
                  or use your password below
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in with Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
