"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { getTeacherByEmail, createTeacher } from "@/lib/database"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: any | null
  teacher: any | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [teacher, setTeacher] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Debug function to log the current auth state
  const logAuthState = (message: string) => {
    console.log(`[Auth] ${message}:`, {
      user: user ? `${user.email} (${user.id})` : "null",
      teacher: teacher ? `${teacher.name} (${teacher.id})` : "null",
      loading,
    })
  }

  // Function to load teacher data
  const loadTeacherData = async (email: string) => {
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
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[Auth] Initializing auth state")
        setLoading(true)

        // Get the current session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("[Auth] Error getting session:", error)
          setError(error.message)
          setLoading(false)
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
      } catch (error) {
        console.error("[Auth] Exception during auth initialization:", error)
        setError("Failed to initialize authentication")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
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
    })

    return () => {
      console.log("[Auth] Cleaning up auth subscription")
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log(`[Auth] Signing up user: ${email}`)
      setError(null)

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
      setError(error.message || "An error occurred during sign up")
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`[Auth] Signing in user: ${email}`)
      setError(null)
      setLoading(true)

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
      setError(error.message || "An error occurred during sign out")
    }
  }

  // Log auth state changes for debugging
  useEffect(() => {
    logAuthState("Auth state updated")
  }, [user, teacher, loading])

  return (
    <AuthContext.Provider
      value={{
        user,
        teacher,
        loading,
        error,
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

