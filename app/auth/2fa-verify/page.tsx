'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function TwoFactorVerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      try {
        const response = await fetch('/api/auth/2fa/status')
        const data = await response.json()
        
        if (data.enabled && data.verified) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error)
      }
    }

    checkVerification()
  }, [router])

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        credentials: 'include' // Important for cookies
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify 2FA')
      }

      toast({
        title: "Success",
        description: "2FA verification successful",
      })

      // Force a hard redirect to ensure middleware runs
      window.location.href = '/dashboard'

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify 2FA",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Please enter the verification code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleVerify}
            disabled={isLoading || code.length !== 6}
            className="w-full"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 