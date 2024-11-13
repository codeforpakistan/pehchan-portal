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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
