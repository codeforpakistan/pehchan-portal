import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SSO Integration Guide | Pehchan',
  description: 'Learn how to integrate Pehchan SSO with your application',
}

export default function SSOIntegrationPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">SSO Integration Guide</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to integrate Pehchan SSO with your application
        </p>
      </div>

      <Tabs defaultValue="react" className="space-y-4">
        <TabsList>
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="nextjs">Next.js</TabsTrigger>
          <TabsTrigger value="vanilla">Vanilla JS</TabsTrigger>
        </TabsList>

        <TabsContent value="react" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>React Integration</CardTitle>
              <CardDescription>
                Install and use our React component for easy SSO integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Install the package</h3>
                <pre className="bg-muted p-4 rounded-md">
                  <code>npm install @pehchan/react</code>
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">2. Use the Login Button</h3>
                <pre className="bg-muted p-4 rounded-md">
                  {`import { PehchanLoginButton } from '@pehchan/react'

function App() {
  return (
    <PehchanLoginButton
      clientId="your-client-id"
      redirectUri="https://your-app.com/callback"
      variant="green" // or "white"
    />
  )
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nextjs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Next.js Integration</CardTitle>
              <CardDescription>
                Integrate Pehchan SSO with your Next.js application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Create a callback route</h3>
                <pre className="bg-muted p-4 rounded-md">
                  {`// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Exchange code for tokens
  const response = await fetch('https://auth.pehchan.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.PEHCHAN_CLIENT_ID,
      client_secret: process.env.PEHCHAN_CLIENT_SECRET,
      code,
      redirect_uri: process.env.PEHCHAN_REDIRECT_URI,
    }),
  })

  const data = await response.json()
  
  // Store tokens and redirect to dashboard
  return NextResponse.redirect('/dashboard')
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vanilla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vanilla JavaScript Integration</CardTitle>
              <CardDescription>
                Add SSO to your vanilla JavaScript application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Add the login button</h3>
                <pre className="bg-muted p-4 rounded-md">
                  {`<button 
  onclick="window.location.href='https://auth.pehchan.com/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code'"
  class="pehchan-login-button"
>
  Login with Pehchan
</button>`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">2. Handle the callback</h3>
                <pre className="bg-muted p-4 rounded-md">
                  {`// Get the authorization code from the URL
const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')

if (code) {
  // Exchange code for tokens
  fetch('https://auth.pehchan.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      code,
      redirect_uri: 'YOUR_REDIRECT_URI',
    }),
  })
  .then(response => response.json())
  .then(data => {
    // Store tokens and redirect to dashboard
    window.location.href = '/dashboard'
  })
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Get support for your SSO integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              If you need help with your SSO integration, check out our documentation or contact our support team.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 