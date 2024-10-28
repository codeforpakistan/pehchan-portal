import Link from "next/link"
import Image from "next/image" // Import the Image component

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import PehchanButton from "@/components/pehchan-button"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Pehchan
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Your Digital Identity
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          rel="noreferrer"
          className={buttonVariants({ className: "flex items-center space-x-2" })} // Add space for the icon
        >
          <Image src="/white_icon.svg" alt="Icon" width={16} height={16} /> {/* Render the icon */}
          <span>Continue with Pehchan</span>
        </Link>
        <Link
          rel="noreferrer"
          href="/signup"
          className={buttonVariants({ variant: "outline" })}
        >
          Register
        </Link>
      </div>
    </section>
  )
}
