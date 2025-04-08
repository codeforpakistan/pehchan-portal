"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Pehchan: Pioneering Pakistan's Digital Identity Revolution</h1>
          <p className="text-xl text-muted-foreground">
            Your digital identity, as essential as your national ID card
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">
              You rarely leave home without your national identity card. It's your gateway to the physical world—an essential for opening bank accounts, registering a SIM card, or even filing taxes. It's the bedrock of trust in face-to-face transactions. But what about the digital world? Why shouldn't our online interactions have an equally robust and reliable identity system?
            </p>
            <p>
              Pakistan currently lacks a unified digital ID framework, leaving individuals to navigate a fragmented web of credentials for every service they use. Enter Pehchan—our ambitious initiative to bring Pakistan's identity infrastructure into the digital era, built on the powerful foundation of Keycloak.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Why Digital Identity is the Future</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                In today's digital-first world, proving who you are online is as critical as physical identification. Yet, the process is often redundant, cumbersome, and insecure. Imagine if, instead of separate logins for each government or private service, you had a single, secure digital identity—something that's as indispensable online as your national ID card is offline.
              </p>
              <p>
                This is not a novel idea. Countries like the UK and Singapore have already paved the way with exemplary national digital ID systems. Learning from their experiences, Pehchan seeks to establish a similar framework tailored to Pakistan's unique challenges and opportunities.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Global Inspirations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">GOV.UK Verify</h3>
                <p>
                  Designed to simplify access to public services, GOV.UK Verify allows UK citizens to verify their identity online for services ranging from tax filing to passport applications. Its federated model emphasizes user choice and privacy, allowing individuals to select a certified provider to handle their data securely.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Singpass</h3>
                <p>
                  A cornerstone of Singapore's Smart Nation initiative, Singpass integrates over 2,000 services, including banking, healthcare, and even private sector applications. It empowers users with control over their data through features like QR-code-based logins and granular consent settings, setting a gold standard for seamless, privacy-preserving digital identity systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">The Pehchan Vision</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Universal Access</h3>
                <p>A single digital identity that works across government and private services, eliminating the need for multiple credentials.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">User Control</h3>
                <p>Citizens retain full control over their data, choosing when, how, and with whom to share it.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Privacy by Design</h3>
                <p>Built on modern encryption technologies and privacy-preserving practices, Pehchan ensures that your personal data stays secure.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Registration</h3>
                <p>You sign up using your national identity card details, verified through a secure backend.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Digital Identity</h3>
                <p>Your Pehchan ID becomes your key to services like banking, healthcare, and education.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Selective Sharing</h3>
                <p>Advanced techniques like zero-knowledge proofs allow you to prove attributes without disclosing unnecessary details.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Your Role in Pehchan's Future</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                Pehchan isn't just a government initiative—it's a collaborative effort open to developers, organizations, and citizens alike. Here's how you can get involved:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Developers:</strong> Contribute to our open-source codebase on GitHub, helping us improve functionality, security, and usability.</li>
                <li><strong>Organizations:</strong> Partner with us to integrate Pehchan into your services, improving user experiences and trust.</li>
                <li><strong>Citizens:</strong> Share your feedback, spread the word, and help shape the digital future of Pakistan.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">The Road Ahead</h2>
          <p className="text-lg">
            We envision Pehchan as an important catalyst of Pakistan's digital transformation. However, this journey requires more than technology—it demands collaboration, trust, and a shared commitment to innovation. Together, we can build a system that is inclusive, secure, and adaptable to the needs of every Pakistani.
          </p>
          <p className="text-xl font-semibold">
            Let's shape the future of our country, one digital identity at a time.
          </p>
          <div className="pt-4">
            <Button asChild>
              <Link href="/signup">
                Join Pehchan Today
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 