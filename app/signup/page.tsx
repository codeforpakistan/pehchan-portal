"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

enum RegistrationStep {
  EnterContact,
  Verification,
  BasicInfo,
  NADRAVerisys,
  Success
}

export default function Component() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.EnterContact)
  const [contact, setContact] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [cnic, setCNIC] = useState('')
  const [fullName, setFullName] = useState('')

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
          <form onSubmit={handleSubmit}>
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
                <span>Verification Code Sent</span>
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
          <form onSubmit={handleSubmit}>
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
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Submit
              </Button>
            </div>
          </form>
        )
      case RegistrationStep.NADRAVerisys:
        return (
          <div className="space-y-4">
            <p className="text-sm">
              Your personal information will be verified with NADRA. We can only accept information that have been verified with NADRA.
            </p>
            <p className="font-semibold">NADRA Verification Cost</p>
            <p>Rs.150</p>
            <Button onClick={() => setCurrentStep(RegistrationStep.Success)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Pay for NADRA Verification
            </Button>
            <Button variant="outline" className="w-full">
              Skip for now
            </Button>
          </div>
        )
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