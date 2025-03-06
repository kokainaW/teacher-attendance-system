import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req, res })

    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the URL the user is requesting
    const url = req.nextUrl.clone()
    const isAuthPage = url.pathname === "/login" || url.pathname === "/signup"
    const isProtectedRoute = url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/class-setup")

    // If user is signed in and on an auth page, redirect to dashboard
    if (session && isAuthPage) {
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    // If user is not signed in and on a protected route, redirect to login
    if (!session && isProtectedRoute) {
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return res
}

export const config = {
  matcher: ["/login", "/signup", "/dashboard/:path*", "/class-setup/:path*"],
}

