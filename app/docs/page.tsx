"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DocsPage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopied(section)
    toast({
      title: "Copied to clipboard",
      description: `${section} code copied successfully`,
    })
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Pehchan API Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Integrate Pehchan authentication and SSO into your applications with our comprehensive API.
        </p>
      </div>

      <Tabs defaultValue="auth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="sso">SSO Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
              <CardDescription>Register new users with email and phone verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Endpoint</h3>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/auth/signup</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard("POST /api/auth/signup", "endpoint")}
                    >
                      {copied === "endpoint" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Request Body</h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify({
                        email: "user@example.com",
                        password: "secure_password",
                        firstName: "John",
                        lastName: "Doe",
                        phoneNumber: "+1234567890"
                      }, null, 2)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify({
                        email: "user@example.com",
                        password: "secure_password",
                        firstName: "John",
                        lastName: "Doe",
                        phoneNumber: "+1234567890"
                      }, null, 2), "request")}
                    >
                      {copied === "request" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify({
                        success: true,
                        message: "User registered successfully",
                        userId: "user-uuid"
                      }, null, 2)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify({
                        success: true,
                        message: "User registered successfully",
                        userId: "user-uuid"
                      }, null, 2), "response")}
                    >
                      {copied === "response" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Login</CardTitle>
              <CardDescription>Authenticate users with email and password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Endpoint</h3>
                  <code className="bg-muted px-2 py-1 rounded">POST /api/auth/login</code>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify({
                      email: "user@example.com",
                      password: "secure_password"
                    }, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify({
                      access_token: "jwt_token",
                      refresh_token: "refresh_token",
                      expires_in: 3600
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Info Retrieval</CardTitle>
              <CardDescription>Get authenticated user's information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Endpoint</h3>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/auth/user</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard("GET /api/auth/user", "endpoint")}
                    >
                      {copied === "endpoint" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Headers</h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify({
                        "Authorization": "Bearer your-access-token"
                      }, null, 2)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify({
                        "Authorization": "Bearer your-access-token"
                      }, null, 2), "headers")}
                    >
                      {copied === "headers" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify({
                        id: "user-uuid",
                        email: "user@example.com",
                        firstName: "John",
                        lastName: "Doe",
                        phoneNumber: "+1234567890",
                        emailVerified: true,
                        phoneVerified: true,
                        createdAt: "2024-01-01T00:00:00.000Z",
                        updatedAt: "2024-01-01T00:00:00.000Z"
                      }, null, 2)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify({
                        id: "user-uuid",
                        email: "user@example.com",
                        firstName: "John",
                        lastName: "Doe",
                        phoneNumber: "+1234567890",
                        emailVerified: true,
                        phoneVerified: true,
                        createdAt: "2024-01-01T00:00:00.000Z",
                        updatedAt: "2024-01-01T00:00:00.000Z"
                      }, null, 2), "response")}
                    >
                      {copied === "response" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SSO Client Registration</CardTitle>
              <CardDescription>Register your application for SSO integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Endpoint</h3>
                  <code className="bg-muted px-2 py-1 rounded">POST /api/sso/register</code>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify({
                      clientName: "Your App Name",
                      redirectUris: ["https://your-app.com/callback"],
                      allowedOrigins: ["https://your-app.com"]
                    }, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify({
                      clientId: "your-client-id",
                      clientSecret: "your-client-secret",
                      redirectUris: ["https://your-app.com/callback"]
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SSO Login Flow</CardTitle>
              <CardDescription>Implement the SSO login flow in your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Initiate Login</h3>
                  <code className="bg-muted px-2 py-1 rounded">
                    GET /api/sso/login?client_id=your-client-id&redirect_uri=https://your-app.com/callback
                  </code>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Token Exchange</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify({
                      grant_type: "authorization_code",
                      code: "authorization_code",
                      client_id: "your-client-id",
                      client_secret: "your-client-secret",
                      redirect_uri: "https://your-app.com/callback"
                    }, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Get User Info</h3>
                  <code className="bg-muted px-2 py-1 rounded">GET /api/sso/userinfo</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Include Authorization header: Bearer your-access-token
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Always use HTTPS for all API calls</li>
              <li>Store client secrets securely</li>
              <li>Implement proper token storage and refresh mechanisms</li>
              <li>Validate all redirect URIs</li>
              <li>Implement proper error handling</li>
              <li>Use PKCE for enhanced security in SSO flows</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Authentication endpoints: 10 requests per minute</li>
              <li>SSO endpoints: 20 requests per minute</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 