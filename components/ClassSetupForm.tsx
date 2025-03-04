"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { createClass } from "@/lib/database"

export default function ClassSetupForm() {
  const [schoolName, setSchoolName] = useState("")
  const [className, setClassName] = useState("")
  const [session, setSession] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { teacher } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teacher) {
      setError("You must be logged in to create a class")
      return
    }

    setLoading(true)
    setError("")

    try {
      const classData = await createClass(teacher.id, schoolName, className, session)

      if (!classData) {
        setError("Failed to create class")
        return
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the class")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Set Up Your Class</CardTitle>
        <CardDescription>Enter your school and class information</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name</Label>
            <Input
              id="schoolName"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session">Session (Year)</Label>
            <Input id="session" type="text" value={session} onChange={(e) => setSession(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting Up..." : "Set Up Class"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

