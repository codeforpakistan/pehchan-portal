"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"

export default function DeveloperDocsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Pehchan Developer Documentation</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn how to integrate Pehchan SSO into your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              To get started with Pehchan SSO integration, you'll need to:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Request a client ID by emailing <a href="mailto:ali@codeforpakistan.org" className="text-primary hover:underline">ali@codeforpakistan.org</a></li>
              <li>Receive your client ID</li>
              <li>Implement the SSO flow in your application</li>
            </ol>
          </CardContent>
        </Card>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login Flow</TabsTrigger>
            <TabsTrigger value="userinfo">User Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login Flow</CardTitle>
                <CardDescription>
                  How to implement the Pehchan login flow in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Redirect to Pehchan Login</h3>
                    <p className="mb-2">Redirect your users to the Pehchan login page with the following parameters:</p>
                    <div className="bg-muted p-4 rounded-md relative">
                      <pre className="text-sm">
                        {`const authUrl = new URL('https://pehchan.codeforpakistan.org/login')
authUrl.searchParams.append('client_id', 'your-client-id')
authUrl.searchParams.append('redirect_uri', 'https://your-app.com/auth/callback')
authUrl.searchParams.append('state', 'random-state-string')`}
                      </pre>
                      <CopyButton text={`const authUrl = new URL('https://pehchan.codeforpakistan.org/login')
authUrl.searchParams.append('client_id', 'your-client-id')
authUrl.searchParams.append('redirect_uri', 'https://your-app.com/auth/callback')
authUrl.searchParams.append('state', 'random-state-string')`} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Note: The <code>client_id</code> is provided when you request access. The <code>redirect_uri</code> must match the URL where you want to receive the authentication response.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">2. Handle the Callback</h3>
                    <p className="mb-2">After successful login, users will be redirected back to your application with the following parameters:</p>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm">
                        {`// URL: https://your-app.com/auth/callback?access_token=...&id_token=...&state=...
const urlParams = new URLSearchParams(window.location.search)
const accessToken = urlParams.get('access_token')
const idToken = urlParams.get('id_token')
const state = urlParams.get('state')

// Verify state matches what you sent
if (state !== 'random-state-string') {
  // Handle error
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="userinfo">
            <Card>
              <CardHeader>
                <CardTitle>User Info Endpoint</CardTitle>
                <CardDescription>
                  How to fetch user information using the access token
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Fetch User Information</h3>
                    <p className="mb-2">Use the access token to fetch the user's information:</p>
                    <div className="bg-muted p-4 rounded-md relative">
                      <pre className="text-sm">
                        {`const userInfo = await fetch('https://pehchan.codeforpakistan.org/api/auth/userinfo', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
})

const userData = await userInfo.json()`}
                      </pre>
                      <CopyButton text={`const userInfo = await fetch('https://pehchan.codeforpakistan.org/api/auth/userinfo', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
})

const userData = await userInfo.json()`} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Example Response</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm">
                        {`{
  "sub": "user-id",
  "email_verified": true,
  "name": "John Doe",
  "preferred_username": "john@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john@example.com"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Security Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Always validate the state parameter to prevent CSRF attacks</li>
              <li>Store the access token securely and never expose it to the client</li>
              <li>Implement proper token refresh logic</li>
              <li>Use HTTPS for all API calls</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button asChild>
            <a href="mailto:ali@codeforpakistan.org">Request Client ID</a>
          </Button>
        </div>
      </div>
    </div>
  )
} 