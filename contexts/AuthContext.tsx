"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, isUsingMockDatabase } from "@/lib/supabase"
import { getTeacherByEmail } from "@/lib/database"
import { useRouter } from "next/navigation"
import * as mockDb from "@/lib/mock-database"

type AuthContextType = {
  user: any | null
  teacher: any | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isDemo: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [teacher, setTeacher] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isDemo = isUsingMockDatabase

  useEffect(() => {
    const getUser = async () => {
      if (isDemo) {
        const { data } = await mockDb.mockGetSession()
        setUser(data.session?.user || null)

        if (data.session?.user) {
          const teacherData = await getTeacherByEmail(data.session.user.email)
          setTeacher(teacherData)
        }
      } else {
        const {
          data: { session },
        } = await supabase!.auth.getSession()
        setUser(session?.user || null)

        if (session?.user) {
          const teacherData = await getTeacherByEmail(session.user.email!)
          setTeacher(teacherData)
        }
      }

      setLoading(false)
    }

    getUser()

    if (isDemo) {
      const { data } = mockDb.mockOnAuthStateChange((event: string, session: any) => {
        setUser(session?.user || null)

        if (session?.user) {
          getTeacherByEmail(session.user.email).then((teacherData) => {
            setTeacher(teacherData)
          })
        } else {
          setTeacher(null)
        }

        setLoading(false)
      })

      return () => {
        data.subscription.unsubscribe()
      }
    } else {
      const {
        data: { subscription },
      } = supabase!.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null)

        if (session?.user) {
          const teacherData = await getTeacherByEmail(session.user.email!)
          setTeacher(teacherData)
        } else {
          setTeacher(null)
        }

        setLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isDemo])

  const signUp = async (email: string, password: string, name: string) => {
    if (isDemo) {
      return mockDb.mockSignUp(email, password, name)
    } else {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
      })

      if (!error && data.user) {
        await getTeacherByEmail(email)
      }

      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isDemo) {
      return mockDb.mockSignIn(email, password)
    } else {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    }
  }

  const signOut = async () => {
    if (isDemo) {
      await mockDb.mockSignOut()
    } else {
      await supabase!.auth.signOut()
    }
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, teacher, loading, signUp, signIn, signOut, isDemo }}>
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

