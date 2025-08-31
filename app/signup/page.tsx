"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { normalizePhoneNumber } from "@/lib/phone"
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

type Step = "form" | "otp"

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>("form")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    cnic: "",
    password: "",
    confirmPassword: "",
  })
  const [otp, setOtp] = useState("")
  const [demoOtp, setDemoOtp] = useState("") // demo OTP

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateField = (name: string, value: string) => {
    let message = ""

    if (name === "firstName" && !value.trim())
      message = "First name is required"
    if (name === "lastName" && !value.trim()) message = "Last name is required"
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value))
        message = "Please enter a valid email address"
    }
    if (name === "phoneNumber") {
      const phoneRegex = /^(\+92|0092|92|0)?3[0-9]{9}$/
      if (!phoneRegex.test(value))
        message = "Enter a valid Pakistani phone number"
    }
    if (name === "cnic") {
      const cnicRegex = /^\d{13}$/
      if (!cnicRegex.test(value.replace(/\D/g, "")))
        message = "CNIC must be 13 digits"
    }
    if (name === "password" && value.length < 6)
      message = "Password must be at least 6 characters"
    if (name === "confirmPassword" && value !== formData.password)
      message = "Passwords do not match"

    setErrors((prev) => ({ ...prev, [name]: message }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    validateField(name, value)
  }

  const checkEmailExists = async (email: string) => {
    const res = await fetch("/api/auth/signup?action=check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.message || "Failed to validate email")
    }
    const data = await res.json()
    return Boolean(data?.exists)
  }

  const generateDemoOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      Object.entries(formData).forEach(([key, value]) =>
        validateField(key, value)
      )
      if (Object.values(errors).some((msg) => msg)) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fix the highlighted errors",
        })
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Passwords do not match",
        })
        setIsLoading(false)
        return
      }

      const emailInUse = await checkEmailExists(formData.email.trim())
      if (emailInUse) {
        toast({
          variant: "destructive",
          title: "Email already in use",
          description:
            "This email is already registered. Try logging in or use a different email.",
        })
        setIsLoading(false)
        return
      }

      const normalizedPhone = normalizePhoneNumber(formData.phoneNumber)

      const otpResponse = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          email: formData.email,
        }),
      })
      if (!otpResponse.ok) {
        const error = await otpResponse.json().catch(() => ({}))
        throw new Error(error?.message || "Failed to send OTP")
      }

      setDemoOtp(generateDemoOTP())
      setStep("otp")

      toast({
        title: "OTP Sent",
        description:
          "Please check your phone and email for the verification code",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send OTP",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const normalizedPhone = normalizePhoneNumber(formData.phoneNumber)

      const verifyResponse = await fetch("/api/auth/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          email: formData.email,
          otp,
        }),
      })
      if (!verifyResponse.ok) {
        const error = await verifyResponse.json().catch(() => ({}))
        throw new Error(error?.message || "Failed to verify OTP")
      }

      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phoneNumber: normalizedPhone,
          emailVerified: true,
        }),
      })
      if (!signupResponse.ok) {
        const error = await signupResponse.json().catch(() => ({}))
        throw new Error(error?.message || "Failed to create account")
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please login.",
      })
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create account",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container min-h-screen w-screen flex flex-col items-center justify-center overflow-y-auto py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Grid for first & last name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={errors.firstName ? "border-red-500" : ""}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={errors.lastName ? "border-red-500" : ""}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                  placeholder="03219862931"
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>

              {/* CNIC */}
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={errors.cnic ? "border-red-500" : ""}
                  placeholder="1730166936629"
                  required
                />
                {errors.cnic && (
                  <p className="text-red-500 text-sm">{errors.cnic}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={errors.password ? "border-red-500" : ""}
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
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
                  placeholder={`Enter 6-digit code (demo: ${demoOtp})`}
                  maxLength={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Demo OTP is for guidance only. Do NOT use it to verify.
                </p>
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
            <Button
              variant="link"
              className="p-0"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
