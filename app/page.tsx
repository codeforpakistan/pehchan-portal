"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import PehchanButton from "@/components/pehchan-button"
import { Button } from "@/components/ui/button"


export default function IndexPage() {
  const router = useRouter()

  return (
    <div className="w-full bg-gradient-to-b to-green-100 from-green-50">
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 relative z-10">
        <div className="flex gap-8 justify-center">
          <div className="space-y-6 md:w-2/3">
            <div className="inline-block">
              {/* <Image src="/pehchan-logo.svg" alt="Pehchan Logo" width={80} height={80} className="mb-4" /> */}
            </div>
            <p className="text-2xl font-bold text-center">
              Welcome to Pehchan
            </p>
            <h1 className="text-6xl md:text-5xl font-bold leading-tight text-center " id="bigtitle">
              <span className="text-green-600">Pakistan&apos;s First</span> Secure and Seamless Digital Identity Platform
            </h1>
            {/* <p className="text-xl text-gray-600 max-w-md">
              Empowering Pakistan&apos;s Digital Future: Your Secure and Seamless Digital Identity Platform
            </p> */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <PehchanButton onClick={() => router.push('/login')} />
                
              <Button asChild
                
                className={buttonVariants({ variant: "outline", size: "lg", className: "" })}
              >
                <Link href="/signup">
                Create Account
                </Link>
                
              </Button>
            </div>
          </div>
          {/* <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
            <Image
              src="/images/hero-illustration.png"
              alt="Digital Pakistan Illustration"
              width={500}
              height={500}
              className="relative z-10"
              priority
            />
          </div> */}
        </div>
      </div>
      {/* <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#4CAF50" fillOpacity="0.2" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div> */}
    </div>
  )
}