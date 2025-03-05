import { createClient } from "@supabase/supabase-js"

// Use the provided Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isSupabaseAvailable = () => {
  return !!supabaseUrl && !!supabaseAnonKey
}

const isUsingMockDatabase = () => {
  return !isSupabaseAvailable()
}

// Create the Supabase client with optimized settings
const supabase = isSupabaseAvailable()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (...args) => {
          return fetch(...args)
        },
      },
      db: {
        schema: "public",
      },
    })
  : null

console.log("Supabase client initialized", supabase ? "with direct credentials" : "in mock mode")

// Types for our database tables
export type Teacher = {
  id: string
  email: string
  name: string
  created_at: string
}

export type Class = {
  id: string
  teacher_id: string
  school_name: string
  class_name: string
  session: string
  created_at: string
}

export type Student = {
  id: string
  class_id: string
  name: string
  created_at: string
}

export type Attendance = {
  id: string
  student_id: string
  date: string
  status: boolean
  created_at: string
}

export { supabase, isUsingMockDatabase, isSupabaseAvailable }

