"use client"

import { useAuth } from "@/contexts/AuthContext"
import { isUsingMockDatabase, isSupabaseAvailable } from "@/lib/supabase"
import { RefreshCw, AlertTriangle, CheckCircle2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConnectionStatus() {
  const { connectionError, retryConnection } = useAuth()

  const handleRetryConnection = async () => {
    await retryConnection()
  }

  if (!isUsingMockDatabase && isSupabaseAvailable() && !connectionError) {
    return (
      <div className="bg-green-100 text-green-800 p-4 rounded-md text-sm mb-4">
        <div className="flex items-start">
          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">✅ Connected to Supabase database</p>
            <p className="text-xs mt-1">Your application is using the Supabase database for data storage.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isSupabaseAvailable() || connectionError) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-md text-sm mb-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">⚠️ Could not connect to Supabase</p>
            <p className="text-xs mt-1">
              The application is running in offline mode. Your data will be stored locally on your device, but will not
              be synced to the cloud database.
            </p>
            <p className="text-xs mt-2">
              <strong>Troubleshooting:</strong> Check your internet connection, Supabase URL, and API key.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleRetryConnection}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isUsingMockDatabase) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md text-sm mb-4">
        <div className="flex items-start">
          <Database className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">ℹ️ Using offline mode</p>
            <p className="text-xs mt-1">
              The application is running with local storage. Your data will be saved on your device, but not synced to
              the cloud database.
            </p>
            <p className="text-xs mt-2">
              <strong>To reconnect:</strong> Click the "Test Connection" button below or refresh the page.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleRetryConnection}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

