"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useAuth } from "@/contexts/AuthContext"
import { getClassesByTeacher, getAttendanceByDateRange, getStudentsByClass, getStudentAttendance } from "@/lib/database"

export default function ReportsView() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate())
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate())
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [studentAttendance, setStudentAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { teacher } = useAuth()

  function getDefaultStartDate() {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split("T")[0]
  }

  function getDefaultEndDate() {
    return new Date().toISOString().split("T")[0]
  }

  useEffect(() => {
    if (teacher) {
      loadClasses()
    }
  }, [teacher])

  useEffect(() => {
    if (selectedClass) {
      loadAttendanceData()
      loadStudents()
    }
  }, [selectedClass]) // Removed unnecessary dependencies: startDate, endDate

  useEffect(() => {
    if (selectedStudent) {
      loadStudentAttendance()
    }
  }, [selectedStudent]) // Removed unnecessary dependencies: startDate, endDate

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

  const loadAttendanceData = async () => {
    setLoading(true)
    try {
      const data = await getAttendanceByDateRange(selectedClass, startDate, endDate)
      setAttendanceData(data)
    } catch (error) {
      console.error("Error loading attendance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const studentData = await getStudentsByClass(selectedClass)
      setStudents(studentData)
      if (studentData.length > 0) {
        setSelectedStudent(studentData[0].id)
      }
    } catch (error) {
      console.error("Error loading students:", error)
    }
  }

  const loadStudentAttendance = async () => {
    setLoading(true)
    try {
      const data = await getStudentAttendance(selectedStudent, startDate, endDate)
      setStudentAttendance(data)
    } catch (error) {
      console.error("Error loading student attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallAttendance = () => {
    if (attendanceData.length === 0) return { present: 0, absent: 0, total: 0, percentage: 0 }

    const present = attendanceData.reduce((sum, day) => sum + day.present, 0)
    const absent = attendanceData.reduce((sum, day) => sum + day.absent, 0)
    const total = present + absent
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return { present, absent, total, percentage }
  }

  const calculateStudentAttendance = () => {
    if (studentAttendance.length === 0) return { present: 0, absent: 0, total: 0, percentage: 0 }

    const present = studentAttendance.filter((day) => day.status).length
    const absent = studentAttendance.filter((day) => !day.status).length
    const total = present + absent
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return { present, absent, total, percentage }
  }

  const COLORS = ["#4CAF50", "#F44336"]

  const pieData = [
    { name: "Present", value: calculateOverallAttendance().present },
    { name: "Absent", value: calculateOverallAttendance().absent },
  ]

  const studentPieData = [
    { name: "Present", value: calculateStudentAttendance().present },
    { name: "Absent", value: calculateStudentAttendance().absent },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Reports</CardTitle>
          <CardDescription>View and analyze attendance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="class-select">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="class-select">
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
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <Tabs defaultValue="class">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="class">Class Report</TabsTrigger>
              <TabsTrigger value="student">Student Report</TabsTrigger>
            </TabsList>

            <TabsContent value="class">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Present</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold text-green-600">{calculateOverallAttendance().present}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Absent</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold text-red-600">{calculateOverallAttendance().absent}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Total</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold">{calculateOverallAttendance().total}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Attendance %</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold text-primary">{calculateOverallAttendance().percentage}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Attendance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="present" fill="#4CAF50" name="Present" />
                              <Bar dataKey="absent" fill="#F44336" name="Absent" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Overall Attendance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="student">
              <div className="mb-6">
                <Label htmlFor="student-select">Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Present</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold text-green-600">{calculateStudentAttendance().present}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Absent</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold text-red-600">{calculateStudentAttendance().absent}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Total</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold">{calculateStudentAttendance().total}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Attendance %</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold text-primary">{calculateStudentAttendance().percentage}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Student Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={studentPieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {studentPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

