import Dashboard from "@/components/Dashboard"
import ConnectionStatus from "@/components/ConnectionStatus"
import ConnectionTest from "@/components/ConnectionTest"

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
      <ConnectionStatus />
      <ConnectionTest />
      <Dashboard />
    </div>
  )
}

