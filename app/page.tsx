"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import PehchanButton from "@/components/pehchan-button"


export default function IndexPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              {/* <Image src="/pehchan-logo.svg" alt="Pehchan Logo" width={80} height={80} className="mb-4" /> */}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 leading-tight">
              Welcome to <span className="text-green-600">Pehchan</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-md">
              Empowering Pakistan's Digital Future: Your Secure and Seamless Digital Identity Platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <PehchanButton onClick={() => router.push('/login')} />
              <Link
                href="/signup"
                className={buttonVariants({ variant: "link", size: "lg", className: "text-green-600 hover:bg-green-50" })}
              >
                Register Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
            <Image
              src="/hero-illustration.png"
              alt="Digital Pakistan Illustration"
              width={500}
              height={500}
              className="relative z-10"
              priority
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#4CAF50" fillOpacity="0.2" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  )
}