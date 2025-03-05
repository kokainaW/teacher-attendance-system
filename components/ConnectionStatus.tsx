"use client"

import { useAuth } from "@/contexts/AuthContext"
import { isUsingMockDatabase, isSupabaseAvailable } from "@/lib/supabase"

export default function ConnectionStatus() {
  const { connectionError } = useAuth()

  if (!isUsingMockDatabase && isSupabaseAvailable() && !connectionError) {
    return (
      <div className="bg-green-100 text-green-800 p-4 rounded-md text-sm mb-4">
        <p className="font-medium">✅ Connected to Supabase database</p>
        <p className="text-xs mt-1">Your application is using the Supabase database for data storage.</p>
      </div>
    )
  }

  if (!isSupabaseAvailable() || connectionError) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-md text-sm mb-4">
        <p className="font-medium">⚠️ Could not connect to Supabase</p>
        <p className="text-xs mt-1">
          The application is running in mock database mode. Your data will not be saved permanently. This could be due
          to network issues or incorrect Supabase credentials.
        </p>
        <p className="text-xs mt-2">
          <strong>Troubleshooting:</strong> Check your internet connection, Supabase URL, and API key.
        </p>
      </div>
    )
  }

  if (isUsingMockDatabase) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md text-sm mb-4">
        <p className="font-medium">ℹ️ Using mock database</p>
        <p className="text-xs mt-1">
          The application is running with a temporary in-memory database. Your data will not be saved permanently.
        </p>
        <p className="text-xs mt-2">
          <strong>To connect to Supabase:</strong> Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
          environment variables.
        </p>
      </div>
    )
  }

  return null
}

