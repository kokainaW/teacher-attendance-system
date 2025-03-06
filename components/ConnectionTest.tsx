"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Globe, Database } from "lucide-react"
import {
  testSupabaseConnection,
  diagnoseConnectionIssues,
  isUsingMockDatabase,
  checkOnlineStatus,
} from "@/lib/supabase"

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [diagnosing, setDiagnosing] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [details, setDetails] = useState<any>(null)
  const [mockMode, setMockMode] = useState(isUsingMockDatabase)

  // Function to run the connection test
  const runTest = useCallback(async () => {
    setTesting(true)
    setResult(null)
    setError(null)
    setIssues([])
    setRecommendations([])
    setDetails(null)

    try {
      console.log("[ConnectionTest] Running Supabase connection test")
      const { success, error, details: testDetails } = await testSupabaseConnection()
      setResult(success)
      setMockMode(isUsingMockDatabase)

      if (!success && error) {
        setError(error)
        setDetails(testDetails)
      }
    } catch (err: any) {
      console.error("[ConnectionTest] Error testing connection:", err)
      setResult(false)
      setError(err.message || "An error occurred during the connection test")
    } finally {
      setTesting(false)
    }
  }, [])

  const runDiagnostics = async () => {
    setDiagnosing(true)
    setIssues([])
    setRecommendations([])
    setDetails(null)

    try {
      console.log("[ConnectionTest] Running connection diagnostics")
      const { issues: diagIssues, recommendations: diagRecs, details: diagDetails } = await diagnoseConnectionIssues()
      setIssues(diagIssues)
      setRecommendations(diagRecs)
      setDetails(diagDetails)
    } catch (err: any) {
      console.error("[ConnectionTest] Error running diagnostics:", err)
      setIssues(["Error running diagnostics: " + (err.message || "Unknown error")])
    } finally {
      setDiagnosing(false)
    }
  }

  // Run the test on mount
  useEffect(() => {
    runTest()
  }, [runTest])

  // Function to refresh the page
  const refreshPage = () => {
    window.location.reload()
  }

  return (
    <Card className="mb-6">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Connection Status
        </CardTitle>
        <CardDescription>
          {mockMode ? "Currently using local storage (offline mode)" : "Test your connection to the Supabase database"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <p className="font-medium">Supabase Connection:</p>
            <p className="text-sm text-gray-500">
              {testing
                ? "Testing connection..."
                : result === true
                  ? "Connected successfully"
                  : mockMode
                    ? "Using offline mode (local storage only)"
                    : result === false
                      ? "Connection failed"
                      : "Not tested"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Internet connection: {checkOnlineStatus() ? "Online" : "Offline"}
            </p>
            {error && (
              <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                <p className="font-medium">Error details:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            {testing ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : result === true ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : mockMode ? (
              <Database className="h-8 w-8 text-amber-500" />
            ) : result === false ? (
              <XCircle className="h-8 w-8 text-red-500" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200" />
            )}
          </div>
        </div>

        {mockMode && (
          <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-sm mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Offline Mode Active</p>
                <p className="mt-1">
                  The app is currently using local storage for data. Your changes will be saved on your device but won't
                  sync to the cloud database.
                </p>
                <p className="mt-2">
                  This typically happens when there are network issues or problems with the Supabase connection.
                </p>
              </div>
            </div>
          </div>
        )}

        {(result === false || mockMode) && (
          <div className="mt-4">
            <Button onClick={runDiagnostics} disabled={diagnosing} variant="outline" className="w-full mb-4">
              {diagnosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Diagnosing...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Diagnose Connection Issues
                </>
              )}
            </Button>

            {issues.length > 0 && (
              <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-sm">
                <p className="font-medium mb-2">Potential issues detected:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>

                {recommendations.length > 0 && (
                  <>
                    <p className="font-medium mt-3 mb-2">Recommendations:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={runTest} disabled={testing} variant="outline" className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection Again
            </>
          )}
        </Button>

        {(result === false || mockMode) && (
          <Button onClick={refreshPage} variant="default" className="w-full">
            <Globe className="mr-2 h-4 w-4" />
            Refresh Page & Try Reconnecting
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

