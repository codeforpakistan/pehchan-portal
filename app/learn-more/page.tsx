import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Globe, Shield, Key, Users, Code, Building2, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Pehchan | Pakistan\'s Digital Identity Platform',
  description: 'Learn about Pehchan, Pakistan\'s first secure and seamless digital identity platform',
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-center gap-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Icon className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
)

export default function LearnMorePage() {
  return (
    <div className="container mx-auto py-8 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-green-600">Pakistan&apos;s First</span> Digital Identity Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your gateway to secure and seamless digital interactions in Pakistan
        </p>
      </div>

      {/* Vision Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Globe}
          title="Universal Access"
          description="A single digital identity that works across government and private services"
        />
        <FeatureCard
          icon={Shield}
          title="User Control"
          description="Citizens retain full control over their data and sharing preferences"
        />
        <FeatureCard
          icon={Key}
          title="Privacy by Design"
          description="Built on modern encryption and privacy-preserving practices"
        />
      </div>

      {/* How It Works Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">How Pehchan Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sign up using your national identity card details, verified through our secure backend
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>2. Digital Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your Pehchan ID becomes your key to services like banking, healthcare, and education
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>3. Selective Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Prove attributes without disclosing unnecessary details using advanced privacy techniques
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Global Inspiration Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Inspired by Global Leaders</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Building2 className="h-6 w-6 text-green-600" />
                <CardTitle>GOV.UK Verify</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A federated model emphasizing user choice and privacy, allowing individuals to select certified providers for secure data handling
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Users className="h-6 w-6 text-green-600" />
                <CardTitle>Singpass</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Singapore&apos;s integrated system with over 2,000 services, featuring QR-code-based logins and granular consent settings
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Get Involved Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Get Involved</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Code}
            title="Developers"
            description="Contribute to our open-source codebase and help improve functionality"
          />
          <FeatureCard
            icon={Building2}
            title="Organizations"
            description="Partner with us to integrate Pehchan into your services"
          />
          <FeatureCard
            icon={Heart}
            title="Citizens"
            description="Share your feedback and help shape Pakistan's digital future"
          />
        </div>
        <div className="text-center pt-8">
          <Button asChild size="lg">
            <Link href="/signup">Join Pehchan Today</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 