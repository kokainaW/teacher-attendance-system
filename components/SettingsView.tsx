"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { getClassesByTeacher } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export default function SettingsView() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const { user, teacher } = useAuth()

  useEffect(() => {
    if (teacher) {
      setName(teacher.name || "")
      setEmail(teacher.email || "")
      loadClasses()
    }
  }, [teacher])

  const loadClasses = async () => {
    if (!teacher) return

    setLoading(true)
    try {
      const classData = await getClassesByTeacher(teacher.id)
      setClasses(classData)
    } catch (error) {
      console.error("Error loading classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teacher) return

    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const { error } = await supabase.from("teachers").update({ name }).eq("id", teacher.id)

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" })
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }

    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setMessage({ type: "success", text: "Password updated successfully" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update password" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              {message.text && (
                <div
                  className={`p-3 mb-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={updateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>Your registered classes</CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="border p-4 rounded-md">
                      <h3 className="font-medium">{cls.class_name}</h3>
                      <p className="text-sm text-muted-foreground">School: {cls.school_name}</p>
                      <p className="text-sm text-muted-foreground">Session: {cls.session}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No classes found</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <a href="/class-setup">Add New Class</a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              {message.text && (
                <div
                  className={`p-3 mb-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={updatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

