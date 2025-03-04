"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const { user, signOut, isDemo } = useAuth()

  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-bold">
            School Name Attendance
          </Link>
          {isDemo && (
            <Badge variant="secondary" className="text-xs">
              Demo Mode
            </Badge>
          )}
        </div>
        <nav className="space-x-4">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={signOut}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

