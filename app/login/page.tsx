"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const dynamic = "force-dynamic"
export const runtime = "edge"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ username: "", password: "" })

  const searchParams = useSearchParams()
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const serviceName = searchParams.get("service_name")
  const state = searchParams.get("state")

  useEffect(() => {
    if (clientId && redirectUri) {
      sessionStorage.setItem(
        "oauth_client",
        JSON.stringify({ clientId, redirectUri, serviceName, state })
      )
    } else {
      sessionStorage.removeItem("oauth_client")
    }
  }, [clientId, redirectUri, serviceName, state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const oauthClient = sessionStorage.getItem("oauth_client")
      const clientInfo = oauthClient ? JSON.parse(oauthClient) : {}

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          ...(clientInfo.clientId && clientInfo.redirectUri
            ? {
                clientId: clientInfo.clientId,
                redirectUri: clientInfo.redirectUri,
                state: clientInfo.state,
              }
            : {}),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : "Login failed. Please try again."
        throw new Error(message)
      }

      sessionStorage.removeItem("oauth_client")

      if (data.redirect && clientInfo.clientId && clientInfo.redirectUri) {
        window.location.href = data.redirect
        return
      }

      toast({ title: "Success", description: data.message })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {serviceName
              ? `Login to access ${serviceName}`
              : "Login to Pehchan"}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm mt-4">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
