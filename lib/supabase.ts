import { createClient } from "@supabase/supabase-js"

// Use the provided Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Set up a mock database flag that can be toggled if Supabase is unreachable
export let isUsingMockDatabase = false

// Initialize an online status tracker
let isOnline = true

// Function to check if the browser is online (client-side only)
export const checkOnlineStatus = () => {
  if (typeof window !== "undefined") {
    return navigator.onLine
  }
  return true // Default to online for server-side
}

// Log the Supabase URL (masked for security)
if (supabaseUrl) {
  const maskedUrl = supabaseUrl.substring(0, 15) + "..." + supabaseUrl.substring(supabaseUrl.length - 10)
  console.log("[Supabase] URL:", maskedUrl)
} else {
  console.warn("[Supabase] URL is not defined")
  isUsingMockDatabase = true
}

// Check if Supabase credentials are available
export const isSupabaseAvailable = () => {
  const hasCredentials = !!supabaseUrl && !!supabaseAnonKey
  // Update our online status while we're here
  isOnline = checkOnlineStatus()
  return hasCredentials && isOnline
}

// Create the Supabase client with optimized settings and fallback handling
let supabaseInstance: any = null

const createSupabaseClient = () => {
  try {
    console.log("[Supabase] Creating Supabase client")

    // If we already have set the mock database flag, don't try to create client
    if (isUsingMockDatabase) {
      console.log("[Supabase] Using mock database, skipping client creation")
      return null
    }

    // Check credentials and online status
    if (!isSupabaseAvailable()) {
      console.error("[Supabase] Cannot create client: missing URL or key, or offline")
      isUsingMockDatabase = true
      return null
    }

    // Validate URL format before creating client
    try {
      new URL(supabaseUrl!)
    } catch (e) {
      console.error("[Supabase] Invalid URL format:", e)
      isUsingMockDatabase = true
      return null
    }

    // Create the client with improved parameters
    const client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          "Content-Type": "application/json",
        },
      },
      // Increase timeouts
      realtime: {
        timeout: 60000, // 60 seconds
      },
    })

    console.log("[Supabase] Client created successfully")
    return client
  } catch (error) {
    console.error("[Supabase] Error creating client:", error)
    isUsingMockDatabase = true
    return null
  }
}

// Try to create the client, fallback to null if it fails
export const supabase = createSupabaseClient()

// Register online/offline event handlers to update our status
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[Supabase] Browser is online")
    isOnline = true

    // If we're in mock mode, try to reconnect to Supabase
    if (isUsingMockDatabase && !supabaseInstance && isSupabaseAvailable()) {
      console.log("[Supabase] Attempting to reconnect to Supabase")
      supabaseInstance = createSupabaseClient()
      if (supabaseInstance) {
        isUsingMockDatabase = false
        console.log("[Supabase] Successfully reconnected to Supabase")
        // The page will need to be refreshed to use the new client
      }
    }
  })

  window.addEventListener("offline", () => {
    console.log("[Supabase] Browser is offline")
    isOnline = false
  })
}

console.log("[Supabase] Client initialized:", supabase ? "successfully" : "failed")
console.log("[Supabase] Using mock database:", isUsingMockDatabase)

// Function to ping an external service to verify actual internet connectivity
// This can help distinguish between general internet issues and Supabase-specific issues
export const pingExternalService = async (): Promise<boolean> => {
  try {
    // Using a reliable external service with CORS enabled
    const response = await fetch("https://httpbin.org/status/200", {
      method: "HEAD",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
      },
    })
    return response.ok
  } catch (error) {
    console.error("[Supabase] External ping failed:", error)
    return false
  }
}

// Function to test the Supabase connection with improved error handling
export const testSupabaseConnection = async (): Promise<{ success: boolean; error: string | null; details: any }> => {
  // First check if the browser is online
  if (!checkOnlineStatus()) {
    console.error("[Supabase] Browser is offline")
    return {
      success: false,
      error: "Your device appears to be offline. Please check your internet connection.",
      details: { offlineStatus: true },
    }
  }

  // If we're already in mock mode, don't attempt connection
  if (isUsingMockDatabase) {
    console.log("[Supabase] Using mock database, skipping connection test")
    return {
      success: false,
      error: "Currently in offline mode. Refresh page to attempt reconnection.",
      details: { mockDatabaseMode: true },
    }
  }

  if (!supabase) {
    console.error("[Supabase] Cannot test connection: client is null")
    return {
      success: false,
      error: "Supabase client not initialized",
      details: { clientNull: true },
    }
  }

  // Try pinging an external service first to verify internet connectivity
  const internetAvailable = await pingExternalService()
  if (!internetAvailable) {
    console.error("[Supabase] Internet connectivity issue detected")
    return {
      success: false,
      error: "Internet connectivity issue detected. Unable to reach external services.",
      details: { internetConnectivity: false },
    }
  }

  try {
    console.log("[Supabase] Testing connection...")

    // Use a simple ping with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Instead of a database query, just get the auth session which is less likely to have permission issues
      const { error } = await supabase.auth.getSession()

      clearTimeout(timeoutId)

      if (error) {
        console.error("[Supabase] Connection test failed with auth check:", error)
        if (
          error.message &&
          (error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("network"))
        ) {
          // This is likely a CORS or network issue
          isUsingMockDatabase = true
          return {
            success: false,
            error: "Network error connecting to Supabase. CORS or firewall issue likely.",
            details: { error: error.message, networkRelated: true },
          }
        }

        return {
          success: false,
          error: error.message,
          details: { error: error },
        }
      }

      console.log("[Supabase] Connection test successful")
      return {
        success: true,
        error: null,
        details: { message: "Connection successful" },
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      console.error("[Supabase] Connection test error:", fetchError)

      // Check for specific network-related errors
      if (
        fetchError.message &&
        (fetchError.message.includes("Failed to fetch") ||
          fetchError.message.includes("NetworkError") ||
          fetchError.message.includes("network"))
      ) {
        // This is likely a CORS or network issue
        isUsingMockDatabase = true
        return {
          success: false,
          error: "Network error connecting to Supabase. CORS or firewall issue likely.",
          details: { error: fetchError.message, networkRelated: true },
        }
      }

      // Handle abort errors (timeout)
      if (fetchError.name === "AbortError") {
        console.error("[Supabase] Connection test timed out")
        isUsingMockDatabase = true
        return {
          success: false,
          error: "Connection timed out. The Supabase server is taking too long to respond.",
          details: { timeout: true },
        }
      }

      // Generic error
      isUsingMockDatabase = true
      return {
        success: false,
        error: fetchError.message || "Unknown error during connection test",
        details: { error: fetchError },
      }
    }
  } catch (error: any) {
    console.error("[Supabase] Connection test outer exception:", error)
    isUsingMockDatabase = true
    return {
      success: false,
      error: error.message || "Unknown error during connection test",
      details: { error: error },
    }
  }
}

// Function to diagnose connection issues
export const diagnoseConnectionIssues = async (): Promise<{
  issues: string[]
  recommendations: string[]
  details: any
}> => {
  const issues: string[] = []
  const recommendations: string[] = []
  const details: any = {
    browserOnline: checkOnlineStatus(),
    supabaseCredentials: {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    },
    mockMode: isUsingMockDatabase,
    clientInitialized: !!supabase,
  }

  // Check browser online status
  if (!checkOnlineStatus()) {
    issues.push("Your device appears to be offline")
    recommendations.push("Check your internet connection and try again")
    return { issues, recommendations, details }
  }

  // Check if credentials are available
  if (!isSupabaseAvailable()) {
    issues.push("Missing Supabase credentials (URL or API key)")
    recommendations.push(
      "Check your environment variables and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly",
    )
    return { issues, recommendations, details }
  }

  // Check URL format
  try {
    new URL(supabaseUrl!)
    details.validUrlFormat = true
  } catch (e) {
    issues.push("Invalid Supabase URL format")
    recommendations.push("Check that your NEXT_PUBLIC_SUPABASE_URL environment variable contains a valid URL")
    details.validUrlFormat = false
    return { issues, recommendations, details }
  }

  // Check if we can reach a known public endpoint
  try {
    details.externalConnectivity = await pingExternalService()
    if (!details.externalConnectivity) {
      issues.push("Cannot reach external services")
      recommendations.push("Your internet connection appears to be limited. Check your firewall or network settings")
    }
  } catch (e) {
    details.externalConnectivity = false
    issues.push("Error checking external connectivity")
  }

  // Try a direct connection to Supabase
  try {
    const supabaseDomain = new URL(supabaseUrl!).origin
    details.supabaseDomain = supabaseDomain

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`${supabaseDomain}/auth/v1/`, {
        method: "HEAD",
        mode: "cors",
        cache: "no-cache",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)
      details.supabaseReachable = response.ok

      if (!response.ok) {
        issues.push(`Supabase domain reachable but returned status ${response.status}`)
        recommendations.push("Check that your Supabase project is active and not in maintenance mode")
      }
    } catch (e: any) {
      clearTimeout(timeoutId)
      details.supabaseReachable = false

      if (e.name === "AbortError") {
        issues.push("Supabase domain timeout: The server is not responding")
        recommendations.push("Check if your Supabase project is running and accessible")
      } else if (e.message && e.message.includes("CORS")) {
        issues.push("CORS error when accessing Supabase")
        recommendations.push("There may be a cross-origin resource sharing issue. Check your Supabase CORS settings")
      } else {
        issues.push("Cannot reach Supabase domain")
        recommendations.push("Possible DNS or firewall issue. Check your network configuration")
      }

      details.supabaseError = e.message
    }
  } catch (e: any) {
    issues.push("Error attempting to reach Supabase")
    details.supabaseError = e.message
  }

  // If we're in mock mode but should be able to connect, suggest refreshing
  if (isUsingMockDatabase && details.externalConnectivity && details.supabaseReachable) {
    issues.push("Using mock database despite Supabase appearing to be reachable")
    recommendations.push("Try refreshing the page to attempt reconnection to Supabase")
  }

  // If no specific issues found but we still can't connect
  if (issues.length === 0 && (!supabase || isUsingMockDatabase)) {
    issues.push("Unknown connection issue")
    recommendations.push("Check your Supabase project status, API keys, and browser console for errors")
  }

  return { issues, recommendations, details }
}

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

// Create a mock database implementation for offline mode
// This will be our fallback when Supabase is unavailable
const mockData = {
  teachers: [] as Teacher[],
  classes: [] as Class[],
  students: [] as Student[],
  attendance: [] as Attendance[],
}

// Mock functions that will be used when Supabase is unavailable
export const mockDB = {
  // Teacher functions
  createTeacher: (email: string, name: string): Teacher => {
    const teacher = {
      id: `mock-${Date.now()}`,
      email,
      name,
      created_at: new Date().toISOString(),
    }
    mockData.teachers.push(teacher)
    return teacher
  },

  getTeacherByEmail: (email: string): Teacher | null => {
    return mockData.teachers.find((t) => t.email === email) || null
  },

  // Class functions
  createClass: (teacherId: string, schoolName: string, className: string, session: string): Class => {
    const classObj = {
      id: `mock-${Date.now()}`,
      teacher_id: teacherId,
      school_name: schoolName,
      class_name: className,
      session,
      created_at: new Date().toISOString(),
    }
    mockData.classes.push(classObj)
    return classObj
  },

  getClassesByTeacher: (teacherId: string): Class[] => {
    return mockData.classes.filter((c) => c.teacher_id === teacherId)
  },

  // Student functions
  createStudent: (classId: string, name: string): Student => {
    const student = {
      id: `mock-${Date.now()}`,
      class_id: classId,
      name,
      created_at: new Date().toISOString(),
    }
    mockData.students.push(student)
    return student
  },

  getStudentsByClass: (classId: string): Student[] => {
    return mockData.students.filter((s) => s.class_id === classId)
  },

  // Attendance functions
  markAttendance: (studentId: string, date: string, status: boolean): Attendance => {
    // First check if attendance record exists
    let attendance = mockData.attendance.find((a) => a.student_id === studentId && a.date === date)

    if (attendance) {
      // Update existing record
      attendance.status = status
      return attendance
    } else {
      // Create new record
      attendance = {
        id: `mock-${Date.now()}`,
        student_id: studentId,
        date,
        status,
        created_at: new Date().toISOString(),
      }
      mockData.attendance.push(attendance)
      return attendance
    }
  },
}

