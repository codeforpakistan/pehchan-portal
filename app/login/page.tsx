"use client"

import { useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

enum LoginStep {
  Initial,
  EnterCNIC,
  EnterVerificationCode,
  Success
}

export default function Component() {
  const [currentStep, setCurrentStep] = useState<LoginStep>(LoginStep.Initial)
  const [cnic, setCNIC] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  const handleContinueWithPehchan = () => {
    setCurrentStep(LoginStep.EnterCNIC)
  }

  const handleSubmitCNIC = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically validate the CNIC and send a verification code
    setCurrentStep(LoginStep.EnterVerificationCode)
  }

  const handleSubmitVerificationCode = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically verify the code
    setCurrentStep(LoginStep.Success)
  }

  const renderStep = () => {
    switch (currentStep) {
      case LoginStep.Initial:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Log in to Pehchan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start bg-primary hover:bg-primary/90" onClick={handleContinueWithPehchan}>
                <img src="/white_icon.svg" alt="Pehchan logo" className="w-5 h-5 mr-2" />
                Continue with Pehchan
              </Button>
            </CardContent>
          </Card>
        )
      case LoginStep.EnterCNIC:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <img src="green_icon.svg" alt="Pehchan logo" className="w-6 h-6 mr-2" />
                Log in with Pehchan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCNIC}>
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
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <a href="/register" className="text-sm text-primary hover:underline">
                Start using Pehchan
              </a>
            </CardFooter>
          </Card>
        )
      case LoginStep.EnterVerificationCode:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <img src="green_icon.svg" alt="Pehchan logo" className="w-6 h-6 mr-2" />
                Log in with Pehchan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-100 text-green-800 p-2 rounded-md mb-4 flex items-center">
                <span>Verification Code Sent</span>
                <X className="w-4 h-4 ml-auto" />
              </div>
              <form onSubmit={handleSubmitVerificationCode}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="verificationCode" className="text-sm font-medium">
                      Enter verification code sent to registered mobile number and email address
                    </label>
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter code"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#00AC48] hover:bg-[#008d3b]">
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )
      case LoginStep.Success:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <img src="/Size=64, Color=green_icon.svg" alt="Pehchan logo" className="w-6 h-6 mr-2" />
                Log in with Pehchan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                Successfully logged in. Please wait while we redirect you to the dashboard. 
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Continue
              </Button>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentStep !== LoginStep.Initial && (
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go back
          </Button>
        )}
        {renderStep()}
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        This is a demo for Pehchan, a digital identity solution for the Pakistan government.
      </footer>
    </div>
  )
}