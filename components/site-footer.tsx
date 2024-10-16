import { Heart } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="sticky bottom-0 border-t bg-background">
      <div className="container flex h-16 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Built with <Heart className="inline-block h-4 w-4 text-red-500" /> by{" "}
          <a
            href="https://codeforpakistan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Code for Pakistan
          </a>
        </p>
      </div>
    </footer>
  )
}
