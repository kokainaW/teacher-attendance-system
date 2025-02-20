"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface Student {
  id: number
  name: string
  attendance: boolean[]
}

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [newStudentName, setNewStudentName] = useState("")

  const addStudent = () => {
    if (newStudentName.trim()) {
      setStudents([...students, { id: Date.now(), name: newStudentName, attendance: Array(7).fill(false) }])
      setNewStudentName("")
    }
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
    return ((presentDays / attendance.length) * 100).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          type="text"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
          placeholder="New student name"
        />
        <Button onClick={addStudent}>Add Student</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <TableHead key={day}>{day}</TableHead>
            ))}
            <TableHead>Weekly %</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              {student.attendance.map((isPresent, index) => (
                <TableCell key={index}>
                  <Checkbox checked={isPresent} onCheckedChange={() => toggleAttendance(student.id, index)} />
                </TableCell>
              ))}
              <TableCell>{calculateAttendancePercentage(student.attendance)}%</TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => removeStudent(student.id)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

