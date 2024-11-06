"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, validate email format
      if (!formData.username.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific Keycloak errors
        if (data.error === 'invalid_grant') {
          throw new Error('Invalid email or password')
        }
        if (data.error === 'invalid_client') {
          throw new Error('Authentication service error. Please try again later.')
        }
        throw new Error(data.message || 'Login failed')
      }

      toast({
        title: "Success",
        description: "Login successful!",
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
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
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
