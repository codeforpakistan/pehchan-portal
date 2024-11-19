"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"

enum RegistrationStep {
  EnterContact,
  Verification,
  BasicInfo,
  NADRAVerisys,
  Success
}

// Add this validation function at the top of your component
const isEmail = (value: string) => {
  return value.includes('@')
}

export default function Component() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.EnterContact)
  const [contact, setContact] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [cnic, setCNIC] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep(currentStep + 1)
  }

  const renderProgressIndicator = () => {
    const totalSteps = 3
    const currentStepNumber = Math.min(currentStep + 1, totalSteps)

    return (
      <div className="flex items-center justify-center mb-6">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < currentStepNumber ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              {index < currentStepNumber ? '✓' : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-16 h-1 ${index < currentStepNumber - 1 ? 'bg-primary' : 'bg-secondary'}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case RegistrationStep.EnterContact:
        return (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const code = generateVerificationCode();
            setGeneratedCode(code);
            setVerificationCode(code);

            if (!isEmail(contact)) {
              if (!contact.startsWith('+92')) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Please enter a valid email or phone number (+92XXXXXXXXXX)",
                })
                return
              }
              setPhone(contact)
            } else {
              try {
                const response = await fetch('/api/send-verification', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: contact,
                    code: code,
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to send verification email');
                }

                toast({
                  title: "Success",
                  description: "Verification code sent to your email",
                });
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to send verification email. Please try again.",
                });
                return;
              }
            }
            setCurrentStep(currentStep + 1)
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="contact" className="text-sm font-medium">
                  Enter email address or mobile number
                </label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email or mobile number"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Submit
              </Button>
            </div>
          </form>
        )
      case RegistrationStep.Verification:
        return (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="bg-secondary text-secondary-foreground p-2 rounded-md mb-4 flex items-center">
                <span>Demo Code: {generatedCode}</span>
                <X className="w-4 h-4 ml-auto" />
              </div>
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="text-sm font-medium">
                  Enter verification code sent to {contact}
                </label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter code"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Submit
              </Button>
            </div>
          </form>
        )
      case RegistrationStep.BasicInfo:
        return (
          <form onSubmit={async (e) => {
            e.preventDefault()
            try {
              const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fullName,
                  email: isEmail(contact) ? contact : email,
                  phone: !isEmail(contact) ? contact : phone,
                  cnic,
                  password,
                }),
              })

              const data = await response.json()

              if (!response.ok) {
                throw new Error(data.message || 'Registration failed')
              }

              toast({
                title: "Success",
                description: "Registration successful! Please log in.",
              })

              router.push('/login')

              // setCurrentStep(RegistrationStep.NADRAVerisys)
            } catch (error: any) {
              toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
              })
            }
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="cnic" className="text-sm font-medium">
                  Enter your CNIC
                </label>
                <Input
                  id="cnic"
                  value={cnic}
                  onChange={(e) => setCNIC(e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Enter your full name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name as written on CNIC"
                  required
                />
              </div>
              {!isEmail(contact) && (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Enter your email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                  />
                </div>
              )}
              {isEmail(contact) && (
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Enter your phone number
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92XXXXXXXXXX"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Enter your password
                </label>
                <Input
                  id="password"
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Submit
              </Button>
            </div>
          </form>
        )
      // case RegistrationStep.NADRAVerisys:
      //   return (
      //     <div className="space-y-4">
      //       <p className="text-sm">
      //         Your personal information will be verified with NADRA. We can only accept information that have been verified with NADRA.
      //       </p>
      //       <p className="font-semibold">NADRA Verification Cost</p>
      //       <p>Rs.150</p>
      //       <Button onClick={() => setCurrentStep(RegistrationStep.Success)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
      //         Pay for NADRA Verification
      //       </Button>
      //       <Button variant="outline" className="w-full">
      //         Skip for now
      //       </Button>
      //     </div>
      //   )
      case RegistrationStep.Success:
        return (
          <div className="space-y-4">
            <div className="bg-secondary text-secondary-foreground p-4 rounded-md mb-4">
              Your Pehchan ID is created successfully
            </div>
            <p className="text-sm">Use your email to log in with Pehchan</p>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Continue
            </Button>
          </div>
        )
    }
  }

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <img src="green_icon.svg" alt="Pehchan logo" className="w-6 h-6 mr-2" />
            Create your Pehchan ID
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Your Pehchan ID can be used to access multiple government services
          </p>
        </CardHeader>
        <CardContent>
          {renderProgressIndicator()}
          {renderStep()}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        This is a demo for Pehchan, a digital identity solution for the Pakistan government.
      </footer>
    </div>
  )
}
