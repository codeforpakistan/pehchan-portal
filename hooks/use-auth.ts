"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
        })

        if (!response.ok) {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      }
    }

    const interval = setInterval(checkToken, 4 * 60 * 1000) // Check every 4 minutes

    return () => clearInterval(interval)
  }, [router])
}
