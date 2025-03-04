import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Welcome to School Name Attendance</h1>
        <p className="text-xl text-gray-600 mb-8">The easiest way to track student attendance for your class</p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Easy Setup</CardTitle>
            <CardDescription>Get started in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create your account, set up your class, and start tracking attendance right away.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Attendance</CardTitle>
            <CardDescription>Simple and efficient</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Mark attendance with a single click and view weekly progress at a glance.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Students</CardTitle>
            <CardDescription>Complete control</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Add, edit, or remove students easily and keep your class roster up to date.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

