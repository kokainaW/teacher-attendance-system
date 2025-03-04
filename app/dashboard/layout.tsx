import type React from "react"
import DashboardSidebar from "@/components/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  )
}

