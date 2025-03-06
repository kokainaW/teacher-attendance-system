// Mock database implementation using localStorage
import { v4 as uuidv4 } from "uuid"

// Helper to get data from localStorage with a default value
const getLocalData = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : defaultValue
}

// Helper to set data in localStorage
const setLocalData = (key: string, data: any) => {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// Teacher functions
export async function createTeacher(email: string, name: string) {
  const teachers = getLocalData("teachers", [])
  const newTeacher = {
    id: uuidv4(),
    email,
    name,
    created_at: new Date().toISOString(),
  }

  teachers.push(newTeacher)
  setLocalData("teachers", teachers)
  return newTeacher
}

export async function getTeacherByEmail(email: string) {
  const teachers = getLocalData("teachers", [])
  return teachers.find((teacher: any) => teacher.email === email) || null
}

// Class functions
export async function createClass(teacherId: string, schoolName: string, className: string, session: string) {
  const classes = getLocalData("classes", [])
  const newClass = {
    id: uuidv4(),
    teacher_id: teacherId,
    school_name: schoolName,
    class_name: className,
    session,
    created_at: new Date().toISOString(),
  }

  classes.push(newClass)
  setLocalData("classes", classes)
  return newClass
}

export async function getClassesByTeacher(teacherId: string) {
  const classes = getLocalData("classes", [])
  return classes.filter((cls: any) => cls.teacher_id === teacherId)
}

export async function getClassById(classId: string) {
  const classes = getLocalData("classes", [])
  return classes.find((cls: any) => cls.id === classId) || null
}

// Student functions
export async function createStudent(classId: string, name: string) {
  const students = getLocalData("students", [])
  const newStudent = {
    id: uuidv4(),
    class_id: classId,
    name,
    created_at: new Date().toISOString(),
  }

  students.push(newStudent)
  setLocalData("students", students)
  return newStudent
}

export async function getStudentsByClass(classId: string) {
  const students = getLocalData("students", [])
  return students.filter((student: any) => student.class_id === classId)
}

export async function updateStudent(studentId: string, name: string) {
  const students = getLocalData("students", [])
  const studentIndex = students.findIndex((student: any) => student.id === studentId)

  if (studentIndex === -1) return null

  students[studentIndex].name = name
  setLocalData("students", students)
  return students[studentIndex]
}

export async function deleteStudent(studentId: string) {
  const students = getLocalData("students", [])
  const filteredStudents = students.filter((student: any) => student.id !== studentId)
  setLocalData("students", filteredStudents)
  return true
}

// Attendance functions
export async function markAttendance(studentId: string, date: string, status: boolean) {
  const attendance = getLocalData("attendance", [])
  const existingIndex = attendance.findIndex((record: any) => record.student_id === studentId && record.date === date)

  if (existingIndex !== -1) {
    // Update existing record
    attendance[existingIndex].status = status
    setLocalData("attendance", attendance)
    return attendance[existingIndex]
  } else {
    // Create new record
    const newRecord = {
      id: uuidv4(),
      student_id: studentId,
      date,
      status,
      created_at: new Date().toISOString(),
    }

    attendance.push(newRecord)
    setLocalData("attendance", attendance)
    return newRecord
  }
}

export async function getAttendanceByDate(classId: string, date: string) {
  const students = await getStudentsByClass(classId)
  const attendance = getLocalData("attendance", [])

  return students.map((student: any) => {
    const attendanceRecord = attendance.find((record: any) => record.student_id === student.id && record.date === date)
    return { student, attendance: attendanceRecord || null }
  })
}

export async function getAttendanceByDateRange(classId: string, startDate: string, endDate: string) {
  const students = await getStudentsByClass(classId)

  if (students.length === 0) {
    return []
  }

  const attendance = getLocalData("attendance", [])
  const studentIds = students.map((s: any) => s.id)

  // Filter attendance records for these students and date range
  const relevantAttendance = attendance.filter((record: any) => {
    return studentIds.includes(record.student_id) && record.date >= startDate && record.date <= endDate
  })

  // Create a map of dates in the range
  const dateMap: Record<string, { present: number; absent: number }> = {}
  const currentDate = new Date(startDate)
  const end = new Date(endDate)

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0]
    dateMap[dateStr] = { present: 0, absent: 0 }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Count present and absent for each date
  relevantAttendance.forEach((record: any) => {
    const dateStr = record.date
    if (dateMap[dateStr]) {
      if (record.status) {
        dateMap[dateStr].present += 1
      } else {
        dateMap[dateStr].absent += 1
      }
    }
  })

  // Add missing students as absent
  Object.keys(dateMap).forEach((dateStr) => {
    const totalMarked = dateMap[dateStr].present + dateMap[dateStr].absent
    if (totalMarked < students.length) {
      dateMap[dateStr].absent += students.length - totalMarked
    }
  })

  // Convert map to array
  return Object.entries(dateMap).map(([date, counts]) => ({
    date,
    present: counts.present,
    absent: counts.absent,
  }))
}

export async function getStudentAttendance(studentId: string, startDate: string, endDate: string) {
  const attendance = getLocalData("attendance", [])

  const studentAttendance = attendance.filter(
    (record: any) => record.student_id === studentId && record.date >= startDate && record.date <= endDate,
  )

  return studentAttendance.map((record: any) => ({
    date: record.date,
    status: record.status,
  }))
}

// Mock auth functions
export async function mockSignUp(email: string, password: string, name: string) {
  const users = getLocalData("users", [])

  // Check if user already exists
  if (users.some((user: any) => user.email === email)) {
    return { error: { message: "User already exists" } }
  }

  const newUser = {
    id: uuidv4(),
    email,
    password, // In a real app, never store plain text passwords
    created_at: new Date().toISOString(),
  }

  users.push(newUser)
  setLocalData("users", users)

  // Create teacher record
  await createTeacher(email, name)

  return { data: { user: newUser }, error: null }
}

export async function mockSignIn(email: string, password: string) {
  const users = getLocalData("users", [])
  const user = users.find((u: any) => u.email === email && u.password === password)

  if (!user) {
    return { error: { message: "Invalid login credentials" } }
  }

  // Set current user in localStorage
  setLocalData("currentUser", user)

  return { data: { user }, error: null }
}

export async function mockSignOut() {
  localStorage.removeItem("currentUser")
  return { error: null }
}

export async function mockGetSession() {
  const currentUser = getLocalData("currentUser", null)
  return {
    data: {
      session: currentUser ? { user: currentUser } : null,
    },
  }
}

export function mockOnAuthStateChange(callback: Function) {
  // This is a simplified version that doesn't actually listen for changes
  const currentUser = getLocalData("currentUser", null)
  callback("SIGNED_IN", currentUser ? { user: currentUser } : null)

  return {
    data: {
      subscription: {
        unsubscribe: () => {},
      },
    },
  }
}

