"use client"

import * as React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        setIsAuthenticated(data.isAuthenticated)

        // Filter items based on auth status
        if (items) {
          const filteredItems = items.filter(item => {
            // Hide auth-related items when logged in
            if (isAuthenticated) {
              return !['Login', 'Sign Up'].includes(item.title)
            }
            // Hide dashboard/profile when logged out
            return !['Dashboard', 'Profile'].includes(item.title)
          })
          setNavItems(filteredItems)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }

    checkAuth()
  }, [items, isAuthenticated])

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="inline-block font-bold">Pehchan Digital Identity</span>
      </Link>
      {navItems?.length ? (
        <nav className="flex gap-6">
          {navItems.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
          {/* Add conditional logout link */}
          {isAuthenticated && (
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                  })
                  if (response.ok) {
                    window.location.href = '/'
                  }
                } catch (error) {
                  console.error('Logout error:', error)
                }
              }}
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          )}
        </nav>
      ) : null}
    </div>
  )
}
