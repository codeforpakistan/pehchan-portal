"use client"

import { useState } from "react"
import { Bell, FileText, LogOut, Menu, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Component() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`bg-card w-64 min-h-screen p-4 ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <nav className="mt-8 space-y-4">
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Data Requests
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <Button variant="outline" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* User Profile Summary */}
        <Card className="mb-6">
          <CardContent className="flex items-center space-x-4 pt-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">Welcome, Ali Raza</h2>
              <p className="text-muted-foreground">CNIC: 17301-6693662-9</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Services</CardTitle>
            <CardDescription>Services you are currently logged into</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Tax Portal</Badge>
              <Badge variant="secondary">Health Services</Badge>
              <Badge variant="secondary">Education Portal</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Your recent alerts and messages</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <ul className="space-y-4">
                <li className="flex items-start space-x-4">
                  <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Tax return due in 7 days</p>
                    <p className="text-sm text-muted-foreground">Please submit your annual tax return by July 31st.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <Bell className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">COVID-19 vaccination available</p>
                    <p className="text-sm text-muted-foreground">Book your appointment for the COVID-19 vaccine.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <Bell className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Update your contact information</p>
                    <p className="text-sm text-muted-foreground">Please verify and update your contact details.</p>
                  </div>
                </li>
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Data Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Data Requests</CardTitle>
            <CardDescription>Recent requests for your personal data</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">National Database & Registration Authority</p>
                    <p className="text-sm text-muted-foreground">Requested access to your address information</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">Deny</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </li>
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ministry of Health</p>
                    <p className="text-sm text-muted-foreground">Requested access to your vaccination records</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">Deny</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </li>
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}