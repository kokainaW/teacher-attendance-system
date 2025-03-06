"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { supabase, testSupabaseConnection, isUsingMockDatabase } from "@/lib/supabase"
import { getTeacherByEmail, createTeacher } from "@/lib/database"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: any | null
  teacher: any | null
  loading: boolean
  initialCheckComplete: boolean // New flag to indicate initial check is done
  connectionError: boolean
  connectionErrorDetails: string | null
  error: string | null
  retryConnection: () => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  skipAuthCheck: () => void // New function to skip auth check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [teacher, setTeacher] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialCheckComplete, setInitialCheckComplete] = useState(false) // New state
  const [connectionError, setConnectionError] = useState(false)
  const [connectionErrorDetails, setConnectionErrorDetails] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Debug function to log the current auth state
  const logAuthState = useCallback(
    (message: string) => {
      console.log(`[Auth] ${message}:`, {
        user: user ? `${user.email} (${user.id})` : "null",
        teacher: teacher ? `${teacher.name} (${teacher.id})` : "null",
        loading,
        initialCheckComplete,
        connectionError,
        connectionErrorDetails,
      })
    },
    [user, teacher, loading, initialCheckComplete, connectionError, connectionErrorDetails],
  )

  // Function to skip the auth check and proceed with the app
  const skipAuthCheck = useCallback(() => {
    console.log("[Auth] Skipping auth check and proceeding with app")
    setLoading(false)
    setInitialCheckComplete(true)
    setUser(null)
    setTeacher(null)
  }, [])

  // Function to load teacher data
  const loadTeacherData = useCallback(async (email: string) => {
    try {
      console.log(`[Auth] Loading teacher data for ${email}`)
      const teacherData = await getTeacherByEmail(email)

      if (teacherData) {
        console.log(`[Auth] Teacher data loaded:`, teacherData)
        setTeacher(teacherData)
      } else {
        console.warn(`[Auth] No teacher data found for ${email}`)
      }

      return teacherData
    } catch (error) {
      console.error("[Auth] Error loading teacher data:", error)
      return null
    }
  }, [])

  // Function to retry connection
  const retryConnection = useCallback(async (): Promise<boolean> => {
    console.log("[Auth] Retrying connection...")
    setLoading(true)
    setConnectionError(false)
    setConnectionErrorDetails(null)
    setError(null)

    try {
      // Test the connection
      const { success, error } = await testSupabaseConnection()

      if (!success) {
        console.error("[Auth] Retry connection failed:", error)
        setConnectionError(true)
        setConnectionErrorDetails(error)
        setLoading(false)
        return false
      }

      // If connected, try to get the session
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("[Auth] Retry connection failed: error getting session", sessionError)
        setError(sessionError.message)
        setConnectionError(true)
        setConnectionErrorDetails("Authentication error: " + sessionError.message)
        setLoading(false)
        return false
      }

      const session = data.session

      if (session?.user) {
        console.log(`[Auth] Session found for user: ${session.user.email}`)
        setUser(session.user)
        await loadTeacherData(session.user.email!)
      } else {
        console.log("[Auth] No active session found")
        setUser(null)
        setTeacher(null)
      }

      setLoading(false)
      return true
    } catch (error: any) {
      console.error("[Auth] Exception during retry connection:", error)

      // Handle network errors specifically
      if (error.message && error.message.includes("NetworkError")) {
        setConnectionErrorDetails("Network error: Unable to reach Supabase. Please check your internet connection.")
      } else {
        setError("Failed to connect to authentication service")
        setConnectionErrorDetails(error.message || "Unknown error")
      }

      setConnectionError(true)
      setLoading(false)
      return false
    } finally {
      // Always mark the initial check as complete
      setInitialCheckComplete(true)
    }
  }, [loadTeacherData])

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    let authTimeout: NodeJS.Timeout | null = null
    let retryCount = 0
    const MAX_RETRIES = 2

    const initializeAuth = async () => {
      try {
        console.log("[Auth] Initializing auth state")
        setLoading(true)
        setConnectionError(false)
        setConnectionErrorDetails(null)

        // Set a timeout to force-complete the auth check after 8 seconds
        // This ensures users aren't stuck on loading screens
        authTimeout = setTimeout(() => {
          console.warn("[Auth] Auth check taking too long, proceeding with app")
          setLoading(false)
          setInitialCheckComplete(true)
          if (!isUsingMockDatabase) {
            setConnectionError(true)
            setConnectionErrorDetails("Authentication check timed out. Proceeding in offline mode.")
          }
        }, 8000)

        // First, test the connection
        const { success, error } = await testSupabaseConnection()

        if (!success) {
          console.error("[Auth] Connection test failed during initialization:", error)

          // Try to retry a couple of times before giving up
          if (retryCount < MAX_RETRIES) {
            retryCount++
            console.log(`[Auth] Retrying connection (${retryCount}/${MAX_RETRIES})...`)

            // Wait a bit before retrying
            timeout = setTimeout(() => {
              initializeAuth()
            }, 2000) // 2 second delay before retry

            return
          }

          setConnectionError(true)
          setConnectionErrorDetails(error)
          setLoading(false)
          setInitialCheckComplete(true) // Mark as complete even if it failed
          return
        }

        // Set a timeout to handle cases where Supabase might hang
        timeout = setTimeout(() => {
          console.warn("[Auth] Auth initialization timed out")
          setLoading(false)
          setInitialCheckComplete(true)
          setConnectionError(true)
          setConnectionErrorDetails("Connection timed out. The server is taking too long to respond.")
          setUser(null)
          setTeacher(null)
        }, 15000) // 15 second timeout - increased from 10 seconds

        // Get the current session
        const { data, error: sessionError } = await supabase.auth.getSession()

        // Clear the timeout as soon as we get a response
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }

        if (sessionError) {
          console.error("[Auth] Error getting session:", sessionError)
          setError(sessionError.message)
          setConnectionError(true)
          setConnectionErrorDetails("Authentication error: " + sessionError.message)
          setLoading(false)
          setInitialCheckComplete(true)
          return
        }

        const session = data.session

        if (session?.user) {
          console.log(`[Auth] Session found for user: ${session.user.email}`)
          setUser(session.user)
          await loadTeacherData(session.user.email!)
        } else {
          console.log("[Auth] No active session found")
          setUser(null)
          setTeacher(null)
        }
      } catch (error: any) {
        console.error("[Auth] Exception during auth initialization:", error)

        // Handle network errors specifically
        if (error.message && error.message.includes("NetworkError")) {
          setConnectionErrorDetails("Network error: Unable to reach Supabase. Please check your internet connection.")
        } else {
          setError("Failed to initialize authentication")
          setConnectionErrorDetails(error.message || "Unknown error")
        }

        setConnectionError(true)
      } finally {
        // Make sure we clear any pending timeout
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }

        // Clear the auth timeout
        if (authTimeout) {
          clearTimeout(authTimeout)
          authTimeout = null
        }

        setLoading(false)
        setInitialCheckComplete(true)
      }
    }

    initializeAuth()

    // Set up auth state change listener with timeout protection
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Auth state changed: ${event}`, session ? `User: ${session.user.email}` : "No session")

      if (session?.user) {
        setUser(session.user)
        await loadTeacherData(session.user.email!)
      } else {
        setUser(null)
        setTeacher(null)
      }

      setLoading(false)
      setInitialCheckComplete(true)
    })

    return () => {
      // Clean up on unmount
      console.log("[Auth] Cleaning up auth subscription")
      if (timeout) {
        clearTimeout(timeout)
      }
      if (authTimeout) {
        clearTimeout(authTimeout)
      }
      subscription.unsubscribe()
    }
  }, [loadTeacherData])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log(`[Auth] Signing up user: ${email}`)
      setError(null)

      // Test connection first
      const { success, error: connectionError } = await testSupabaseConnection()
      if (!success) {
        console.error("[Auth] Cannot sign up: not connected to Supabase:", connectionError)
        setConnectionError(true)
        setConnectionErrorDetails(connectionError)
        return { error: new Error(connectionError || "Cannot connect to authentication service") }
      }

      // Sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("[Auth] Error signing up:", error)
        setError(error.message)
        return { error }
      }

      if (!data.user) {
        console.error("[Auth] Sign up succeeded but no user returned")
        setError("Sign up succeeded but no user was returned")
        return { error: new Error("Sign up succeeded but no user was returned") }
      }

      console.log(`[Auth] User signed up successfully: ${data.user.email}`)

      // Create teacher record
      console.log(`[Auth] Creating teacher record for: ${email}`)
      const teacherData = await createTeacher(email, name)

      if (!teacherData) {
        console.error("[Auth] Failed to create teacher record")
        setError("Failed to create teacher profile")
        return { error: new Error("Failed to create teacher profile") }
      }

      console.log("[Auth] Teacher record created:", teacherData)
      setTeacher(teacherData)

      // If sign up was successful but email confirmation is required
      if (data.user && !data.session) {
        console.log("[Auth] Email confirmation required")
        return { error: { message: "Please check your email to confirm your account before logging in" } }
      }

      // If we have a session, set the user
      if (data.session) {
        console.log("[Auth] Setting user after sign up")
        setUser(data.user)
      }

      return { error: null }
    } catch (error: any) {
      console.error("[Auth] Exception during sign up:", error)

      // Handle network errors specifically
      if (error.message && error.message.includes("NetworkError")) {
        setConnectionError(true)
        setConnectionErrorDetails("Network error: Unable to reach Supabase. Please check your internet connection.")
        return { error: new Error("Network error: Unable to reach authentication service") }
      }

      setError(error.message || "An error occurred during sign up")
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`[Auth] Signing in user: ${email}`)
      setError(null)
      setLoading(true)

      // Test connection first
      const { success, error: connectionError } = await testSupabaseConnection()
      if (!success) {
        console.error("[Auth] Cannot sign in: not connected to Supabase:", connectionError)
        setConnectionError(true)
        setConnectionErrorDetails(connectionError)
        setLoading(false)
        return { error: new Error(connectionError || "Cannot connect to authentication service") }
      }

      // Sign in the user with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[Auth] Error signing in:", error)
        setError(error.message)
        setLoading(false)
        return { error }
      }

      if (!data.user || !data.session) {
        console.error("[Auth] Sign in succeeded but no user or session returned")
        setError("Sign in succeeded but no user or session was returned")
        setLoading(false)
        return { error: new Error("Sign in succeeded but no user or session was returned") }
      }

      console.log(`[Auth] User signed in successfully: ${data.user.email}`)
      setUser(data.user)

      // Load teacher data
      const teacherData = await loadTeacherData(email)

      if (!teacherData) {
        console.warn(`[Auth] No teacher record found for ${email}, creating one`)
        // If no teacher record exists, create one
        const newTeacherData = await createTeacher(email, email.split("@")[0])
        setTeacher(newTeacherData)
      }

      console.log("[Auth] Sign in complete, redirecting to dashboard")
      router.push("/dashboard")

      return { error: null }
    } catch (error: any) {
      console.error("[Auth] Exception during sign in:", error)

      // Handle network errors specifically
      if (error.message && error.message.includes("NetworkError")) {
        setConnectionError(true)
        setConnectionErrorDetails("Network error: Unable to reach Supabase. Please check your internet connection.")
        return { error: new Error("Network error: Unable to reach authentication service") }
      }

      setError(error.message || "An error occurred during sign in")
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log("[Auth] Signing out user")
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[Auth] Error signing out:", error)
        setError(error.message)
        return
      }

      console.log("[Auth] User signed out successfully")
      setUser(null)
      setTeacher(null)
      router.push("/login")
    } catch (error: any) {
      console.error("[Auth] Exception during sign out:", error)

      // Handle network errors specifically
      if (error.message && error.message.includes("NetworkError")) {
        setConnectionError(true)
        setConnectionErrorDetails("Network error: Unable to reach Supabase. Please check your internet connection.")
      } else {
        setError(error.message || "An error occurred during sign out")
      }
    }
  }

  // Log auth state changes for debugging
  useEffect(() => {
    logAuthState("Auth state updated")
  }, [user, teacher, loading, initialCheckComplete, connectionError, connectionErrorDetails, logAuthState])

  return (
    <AuthContext.Provider
      value={{
        user,
        teacher,
        loading,
        initialCheckComplete,
        connectionError,
        connectionErrorDetails,
        error,
        retryConnection,
        skipAuthCheck,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

