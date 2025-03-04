"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

interface Student {
  id: number
  name: string
  attendance: boolean[]
}

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [newStudentName, setNewStudentName] = useState("")
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null)
  const [editingStudentName, setEditingStudentName] = useState("")

  const addStudent = () => {
    if (newStudentName.trim()) {
      setStudents([...students, { id: Date.now(), name: newStudentName, attendance: Array(7).fill(false) }])
      setNewStudentName("")
    }
  }

  const startEditingStudent = (student: Student) => {
    setEditingStudentId(student.id)
    setEditingStudentName(student.name)
  }

  const saveEditingStudent = () => {
    if (editingStudentId && editingStudentName.trim()) {
      setStudents(
        students.map((student) =>
          student.id === editingStudentId ? { ...student, name: editingStudentName } : student,
        ),
      )
      setEditingStudentId(null)
      setEditingStudentName("")
    }
  }

  const cancelEditingStudent = () => {
    setEditingStudentId(null)
    setEditingStudentName("")
  }

  const removeStudent = (id: number) => {
    setStudents(students.filter((student) => student.id !== id))
  }

  const toggleAttendance = (studentId: number, day: number) => {
    setStudents(
      students.map((student) =>
        student.id === studentId
          ? { ...student, attendance: student.attendance.map((att, i) => (i === day ? !att : att)) }
          : student,
      ),
    )
  }

  const calculateAttendancePercentage = (attendance: boolean[]) => {
    const presentDays = attendance.filter(Boolean).length
    return ((presentDays / attendance.length) * 100).toFixed(0)
  }

  const getDayName = (index: number) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days[index]
  }

  const getCurrentDate = () => {
    const date = new Date()
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Student Attendance</h1>
          <p className="text-gray-500">Current Date: {getCurrentDate()}</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">Total Students: {students.length}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
          <CardDescription>Enter student details to add them to your class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="newStudentName" className="sr-only">
                Student Name
              </Label>
              <Input
                id="newStudentName"
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Enter student name"
              />
            </div>
            <Button onClick={addStudent} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance</CardTitle>
          <CardDescription>Mark attendance for each student</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="w-[200px]">Student Name</TableHead>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <TableHead key={day} className="text-center">
                        {getDayName(day)}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Weekly %</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {editingStudentId === student.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editingStudentName}
                              onChange={(e) => setEditingStudentName(e.target.value)}
                              className="h-8"
                            />
                            <Button size="sm" onClick={saveEditingStudent} variant="outline" className="h-8 px-2">
                              Save
                            </Button>
                            <Button size="sm" onClick={cancelEditingStudent} variant="ghost" className="h-8 px-2">
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          student.name
                        )}
                      </TableCell>
                      {student.attendance.map((isPresent, index) => (
                        <TableCell key={index} className="text-center">
                          <Checkbox
                            checked={isPresent}
                            onCheckedChange={() => toggleAttendance(student.id, index)}
                            className={isPresent ? "bg-green-500 text-white border-green-500" : ""}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                          {calculateAttendancePercentage(student.attendance)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingStudent(student)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeStudent(student.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No students added yet. Add your first student above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Summary</CardTitle>
            <CardDescription>Overview of attendance for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-green-700 font-medium">Present</h3>
                <p className="text-2xl font-bold text-green-800">
                  {students.reduce((total, student) => total + student.attendance.filter(Boolean).length, 0)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-red-700 font-medium">Absent</h3>
                <p className="text-2xl font-bold text-red-800">
                  {students.reduce((total, student) => total + student.attendance.filter((day) => !day).length, 0)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-blue-700 font-medium">Total Students</h3>
                <p className="text-2xl font-bold text-blue-800">{students.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="text-purple-700 font-medium">Average Attendance</h3>
                <p className="text-2xl font-bold text-purple-800">
                  {(
                    students.reduce(
                      (total, student) => total + Number.parseInt(calculateAttendancePercentage(student.attendance)),
                      0,
                    ) / students.length || 0
                  ).toFixed(0)}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

