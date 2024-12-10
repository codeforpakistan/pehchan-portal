import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Key } from 'lucide-react'

export default function SettingsNav() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and set preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/settings/passkeys">
            <Button variant="ghost">
              <Key className="w-4 h-4 mr-2" />
              Passkeys
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 