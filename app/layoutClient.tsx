"use client"

import type React from "react"

import "./globals.css"
import Header from "@/components/Header"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { isUsingMockDatabase, isSupabaseAvailable } from "@/lib/supabase"

function StatusBanner({ connectionError }: { connectionError: boolean }) {
  if (isUsingMockDatabase) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm">
        Running in mock database mode. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment
        variables to connect to Supabase.
      </div>
    )
  }

  if (!isSupabaseAvailable() || connectionError) {
    return (
      <div className="bg-red-100 text-red-800 p-2 text-center text-sm">
        Could not connect to Supabase. Running in fallback mock mode. Check your internet connection and Supabase
        credentials.
      </div>
    )
  }

  return null
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { connectionError } = useAuth()

  return (
    <>
      <StatusBanner connectionError={connectionError} />
      <Header />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  )
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </AuthProvider>
  )
}

