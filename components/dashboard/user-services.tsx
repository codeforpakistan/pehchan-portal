import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Shield, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ClientSession {
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

  useEffect(() => {
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
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 