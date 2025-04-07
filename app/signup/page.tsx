"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { normalizePhoneNumber } from '@/lib/phone'

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    cnic: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Passwords do not match",
        })
        return
      }

      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(formData.phoneNumber)

      // Send OTP
      const otpResponse = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: normalizedPhone }),
      })

      if (!otpResponse.ok) {
        const error = await otpResponse.json()
        throw new Error(error.message || 'Failed to send OTP')
      }

      setStep('otp')
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(formData.phoneNumber)

      // Verify OTP
      const verifyResponse = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          otp,
        }),
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.message || 'Failed to verify OTP')
      }

      // Create user in Keycloak
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: normalizedPhone, // Use normalized phone number
          emailVerified: true, // Mark as verified since we've verified phone
        }),
      })

      if (!signupResponse.ok) {
        const error = await signupResponse.json()
        throw new Error(error.message || 'Failed to create account')
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please login.",
      })
      router.push('/login')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="03219862931, +923219862931, or 00923219862931"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  placeholder="17301-6693662-9 or 1730166936629"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify and Create Account
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => router.push('/login')}>
              Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
