"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getClassesByTeacher, getAttendanceByDate, markAttendance } from "@/lib/database"

export default function CalendarView() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { teacher } = useAuth()

  useEffect(() => {
    if (teacher) {
      loadClasses()
    }
  }, [teacher])

  useEffect(() => {
    if (selectedClass) {
      loadAttendance()
    }
  }, [selectedClass]) // Removed currentDate from dependencies

  const loadClasses = async () => {
    setLoading(true)
    try {
      const classData = await getClassesByTeacher(teacher.id)
      setClasses(classData)
      if (classData.length > 0) {
        setSelectedClass(classData[0].id)
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const dateString = currentDate.toISOString().split("T")[0]
      const attendanceData = await getAttendanceByDate(selectedClass, dateString)
      setStudents(attendanceData)
    } catch (error) {
      console.error("Error loading attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = async (studentId: string, status: boolean) => {
    try {
      const dateString = currentDate.toISOString().split("T")[0]
      await markAttendance(studentId, dateString, status)

      // Update local state
      setStudents(
        students.map((item) => {
          if (item.student.id === studentId) {
            return {
              ...item,
              attendance: {
                ...item.attendance,
                status,
              },
            }
          }
          return item
        }),
      )
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
          <CardDescription>Mark and view attendance by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-auto">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : students.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="w-[200px]">Student Name</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(({ student, attendance }) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendance?.status === true}
                          onCheckedChange={() => handleAttendanceChange(student.id, true)}
                          className={attendance?.status === true ? "bg-green-500 text-white border-green-500" : ""}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendance?.status === false}
                          onCheckedChange={() => handleAttendanceChange(student.id, false)}
                          className={attendance?.status === false ? "bg-red-500 text-white border-red-500" : ""}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No students found for this class. Add students from the dashboard.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

