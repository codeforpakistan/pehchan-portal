"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Menu } from "lucide-react"

interface ProfileFormData {
  full_name: string
  phone: string
  cnic: string
  avatar_url?: string
}

export default function EditProfile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    cnic: '',
    avatar_url: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        
        if (!data.isAuthenticated) {
          router.push('/login')
          return
        }

        setFormData({
          full_name: data.user.profile?.full_name || '',
          phone: data.user.profile?.phone || '',
          cnic: data.user.profile?.cnic || '',
          avatar_url: data.user.profile?.avatar_url || '',
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let avatarUrl = formData.avatar_url

      // If there's a new avatar file, upload it first
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)

        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload avatar')
        }

        const { url } = await uploadResponse.json()
        avatarUrl = url
      }

      // Update profile data
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          avatar_url: avatarUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      // Force a refresh of the auth data
      await fetch('/api/auth/refresh')
      
      router.push('/dashboard')
      router.refresh() // Force Next.js to refresh the page data

      // After successful update
      localStorage.setItem('profileUpdated', Date.now().toString())
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex container">
      <Sidebar isSidebarOpen={isSidebarOpen} />

      <main className="flex-1 p-6 overflow-y-auto max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

          <Card>
            <CardHeader>
              {/* <CardTitle>Edit Profile</CardTitle> */}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={
                      avatarFile 
                        ? URL.createObjectURL(avatarFile)
                        : formData.avatar_url
                    } />
                    <AvatarFallback>
                      {formData.full_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                    >
                      Change Avatar
                    </Label>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        full_name: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnic">CNIC</Label>
                    <Input
                      id="cnic"
                      value={formData.cnic}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        cnic: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
      </main>
    </div>
  )
} 