"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { startRegistration } from '@simplewebauthn/browser'
import { useAuth } from '@/hooks/use-auth'

function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
  const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (base64.length % 4)) % 4
  const padded = base64 + '='.repeat(padLen)
  const binary = atob(padded)
  const buffer = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i)
  }
  return buffer
}

export default function PasskeysPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [userInfoLoading, setUserInfoLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setUserInfoLoading(true)
        const res = await fetch('/api/auth/check')
        console.log('Auth check status:', res.status)
        
        if (!res.ok) {
          const error = await res.text()
          console.error('Failed to fetch auth check:', error)
          return
        }
        const data = await res.json()
        console.log('Auth check data:', data)
        if (data.isAuthenticated && data.user) {
          setUserInfo(data.user)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setUserInfoLoading(false)
      }
    }
    fetchUserInfo()
  }, [])

  if (authLoading || userInfoLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || !userInfo) {
    return null
  }

  const handleAddPasskey = async () => {
    console.log('Adding passkey for user:', userInfo)
    if (!userInfo?.preferred_username) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get user information",
      })
      return
    }

    setIsRegistering(true)
    try {
      // Get registration options
      const optionsRes = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username: userInfo.preferred_username,
        }),
      })
      
      const options = await optionsRes.json()
      console.log('Registration options:', options) // Debug log

      // Format options for WebAuthn API
      const publicKey = {
        challenge: base64URLStringToBuffer(options.challenge),
        rp: {
          id: options.rpId,
          name: 'Pehchan',
        },
        user: {
          id: btoa(String.fromCharCode(...Array.from(new Uint8Array(16)))),
          name: userInfo.preferred_username,
          displayName: userInfo.name || userInfo.preferred_username,
        },
        pubKeyCredParams: [
          { type: "public-key" as const, alg: -7 },
          { type: "public-key" as const, alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as AuthenticatorAttachment,
          requireResidentKey: true,
          userVerification: 'preferred' as UserVerificationRequirement,
        },
        timeout: 60000,
      }

      // Start registration
      const credential = await startRegistration({
        optionsJSON: {
          ...publicKey,
          challenge: options.challenge, // Use raw challenge string
        }
      })

      // Complete registration
      const verificationRes = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-finish',
          credential,
        }),
      })

      if (!verificationRes.ok) {
        throw new Error('Failed to register passkey')
      }

      toast({
        title: "Success",
        description: "Passkey added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add passkey",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Passkeys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Add a new passkey</h3>
              <p className="text-sm text-muted-foreground">
                Register a new passkey for passwordless login
              </p>
            </div>
            <Button 
              onClick={handleAddPasskey}
              disabled={isRegistering}
            >
              {isRegistering ? "Adding..." : "Add Passkey"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 