import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/Header"
import { AuthProvider } from "@/contexts/AuthContext"
import { isUsingMockDatabase } from "@/lib/supabase"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School Name Attendance",
  description: "Track student attendance for your class",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {isUsingMockDatabase && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-center text-sm">
              Running in demo mode with localStorage. Set up Supabase for persistent storage.
            </div>
          )}
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'