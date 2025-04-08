import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface LoginButtonProps {
  clientId: string
  redirectUri: string
  className?: string
}

export function LoginButton({ clientId, redirectUri, className }: LoginButtonProps) {
  const router = useRouter()

  const handleLogin = () => {
    // Generate a random state parameter for security
    const state = Math.random().toString(36).substring(7)
    
    // Store state in localStorage for verification
    localStorage.setItem('oauth_state', state)
    
    // Build the authorization URL
    const authUrl = new URL(`${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth`)
    
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'openid profile email')
    authUrl.searchParams.append('state', state)
    
    // Redirect to Keycloak
    window.location.href = authUrl.toString()
  }

  return (
    <Button 
      onClick={handleLogin}
      className={className}
    >
      Login with Pehchan
    </Button>
  )
} 