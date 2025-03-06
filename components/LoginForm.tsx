"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, AlertTriangle, RefreshCw, ExternalLink, Clock } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localLoading, setLocalLoading] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState("")
  const [loadingTime, setLoadingTime] = useState(0)
  const router = useRouter()
  const {
    signIn,
    user,
    loading: authLoading,
    initialCheckComplete,
    error: authError,
    connectionError,
    connectionErrorDetails,
    retryConnection,
    skipAuthCheck,
  } = useAuth()

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && initialCheckComplete) {
      console.log("[LoginForm] User already logged in, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [user, initialCheckComplete, router])

  // Show auth errors
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  // Track loading time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (authLoading && !initialCheckComplete) {
      interval = setInterval(() => {
        setLoadingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setLoadingTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [authLoading, initialCheckComplete])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalLoading(true)
    setError("")

    try {
      console.log(`[LoginForm] Attempting to sign in: ${email}`)
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        console.error("[LoginForm] Sign in error:", signInError)
        setError(signInError.message || "An error occurred during login")
        return
      }

      console.log("[LoginForm] Sign in successful")
      // The redirect is handled in the signIn function
    } catch (err: any) {
      console.error("[LoginForm] Exception during sign in:", err)
      setError(err.message || "An error occurred during login")
    } finally {
      setLocalLoading(false)
    }
  }

  const handleRetryConnection = async () => {
    setRetrying(true)
    try {
      const success = await retryConnection()
      if (success) {
        console.log("[LoginForm] Connection retry successful")
      } else {
        console.error("[LoginForm] Connection retry failed")
      }
    } catch (error) {
      console.error("[LoginForm] Error during connection retry:", error)
    } finally {
      setRetrying(false)
    }
  }

  const handleSkipAuthCheck = () => {
    skipAuthCheck()
  }

  // If we've detected a connection error, show appropriate UI
  if (connectionError) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-red-600 flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Connection Issue
          </CardTitle>
          <CardDescription>We're having trouble connecting to our services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
            <p className="font-medium">Could not establish a connection to our authentication service.</p>
            {connectionErrorDetails && <p className="mt-2 text-sm">{connectionErrorDetails}</p>}
            <p className="mt-2">Please try:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Checking your internet connection</li>
              <li>Refreshing the page</li>
              <li>Trying again in a few minutes</li>
              <li>Verifying your Supabase URL and API key are correct</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="w-full" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            <Button className="w-full" onClick={handleRetryConnection} disabled={retrying}>
              {retrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </>
              )}
            </Button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-center text-sm text-primary flex items-center justify-center"
            >
              Check Supabase Status
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If auth is still initializing, show loading with a skip option
  if (authLoading && !initialCheckComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Loading</CardTitle>
          <CardDescription>Please wait while we check your authentication status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-gray-500 mt-2">This should only take a moment...</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center">
              <Clock className="h-3 w-3 mr-1" /> {loadingTime} seconds
            </p>
          </div>

          {loadingTime >= 5 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-amber-600 mb-2">Taking longer than expected?</p>
              <Button variant="outline" size="sm" onClick={handleSkipAuthCheck}>
                Continue without waiting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // If user is already logged in, don't show the form
  if (user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Already Logged In</CardTitle>
          <CardDescription>You are already logged in</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Log in to your account</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={localLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={localLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={localLoading}>
            {localLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging In...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

