import { Bell, FileText, LogOut, Settings, User, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"

interface SidebarProps {
  isSidebarOpen: boolean
}

export function Sidebar({ isSidebarOpen }: SidebarProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      toast({
        title: "Success",
        description: "Logged out successfully",
      })

      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      })
    }
  }

  return (
    <aside className={`bg-card w-64 min-h-screen p-4 ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
      <nav className="mt-8 space-y-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => router.push('/dashboard')}
        >
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => router.push('/profile/edit')}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => router.push('/notifications')}
        >
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => router.push('/data-requests')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Data Requests
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => router.push('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
    </aside>
  )
} 