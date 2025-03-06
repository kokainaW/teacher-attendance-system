import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Loading</CardTitle>
          <CardDescription>Please wait while we load the application</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-gray-500 mt-2">This should only take a moment...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

