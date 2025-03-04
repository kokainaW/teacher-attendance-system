"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BarChart, Settings, LogOut } from "lucide-react"

export default function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="h-full w-64 bg-white border-r p-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-6 text-primary">School Name Attendance</h2>

        <div className="space-y-1">
          <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <Users className="mr-2 h-4 w-4" />
              Students
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/calendar") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/reports") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/reports">
              <BarChart className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/settings") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 w-[calc(100%-2rem)]">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/login">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Link>
        </Button>
      </div>
    </div>
  )
}

