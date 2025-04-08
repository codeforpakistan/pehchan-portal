import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Shield, ExternalLink, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ClientSession {
  id: string
  clientId: string
  clientName?: string
  active: boolean
  lastAccess: string
  started: string
  ipAddress: string
}

export function UserServices() {
  const [sessions, setSessions] = useState<ClientSession[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions')
      const data = await response.json()
      setSessions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to logout from session')
      }

      toast({
        title: "Success",
        description: "Successfully logged out from the service",
      })

      // Refresh the sessions list
      fetchSessions()
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout from the service",
      })
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          Connected Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading active services...</div>
        ) : (
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No active services found
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.clientId} className="flex justify-between items-center p-3 rounded-lg bg-muted">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{session.clientName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">IP: {session.ipAddress}</span>
                    <span className="text-xs text-muted-foreground">
                      Started: {new Date(session.started).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500 text-white">Active</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLogout(session.id)}
                      title="Logout from this service"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 