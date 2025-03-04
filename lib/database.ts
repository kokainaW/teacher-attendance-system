import { supabase, isUsingMockDatabase, type Teacher, type Class, type Student, type Attendance } from "./supabase"
import * as mockDb from "./mock-database"

// Teacher functions
export async function createTeacher(email: string, name: string): Promise<Teacher | null> {
  if (isUsingMockDatabase) {
    return mockDb.createTeacher(email, name)
  }

  const { data, error } = await supabase!.from("teachers").insert([{ email, name }]).select()

  if (error) {
    console.error("Error creating teacher:", error)
    return null
  }

  return data?.[0] || null
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  if (isUsingMockDatabase) {
    return mockDb.getTeacherByEmail(email)
  }

  const { data, error } = await supabase!.from("teachers").select("*").eq("email", email).single()

  if (error) {
    console.error("Error getting teacher:", error)
    return null
  }

  return data
}

// Class functions
export async function createClass(
  teacherId: string,
  schoolName: string,
  className: string,
  session: string,
): Promise<Class | null> {
  if (isUsingMockDatabase) {
    return mockDb.createClass(teacherId, schoolName, className, session)
  }

  const { data, error } = await supabase!
    .from("classes")
    .insert([{ teacher_id: teacherId, school_name: schoolName, class_name: className, session }])
    .select()

  if (error) {
    console.error("Error creating class:", error)
    return null
  }

  return data?.[0] || null
}

export async function getClassesByTeacher(teacherId: string): Promise<Class[]> {
  if (isUsingMockDatabase) {
    return mockDb.getClassesByTeacher(teacherId)
  }

  const { data, error } = await supabase!.from("classes").select("*").eq("teacher_id", teacherId)

  if (error) {
    console.error("Error getting classes:", error)
    return []
  }

  return data || []
}

export async function getClassById(classId: string): Promise<Class | null> {
  if (isUsingMockDatabase) {
    return mockDb.getClassById(classId)
  }

  const { data, error } = await supabase!.from("classes").select("*").eq("id", classId).single()

  if (error) {
    console.error("Error getting class:", error)
    return null
  }

  return data
}

// Student functions
export async function createStudent(classId: string, name: string): Promise<Student | null> {
  if (isUsingMockDatabase) {
    return mockDb.createStudent(classId, name)
  }

  const { data, error } = await supabase!
    .from("students")
    .insert([{ class_id: classId, name }])
    .select()

  if (error) {
    console.error("Error creating student:", error)
    return null
  }

  return data?.[0] || null
}

export async function getStudentsByClass(classId: string): Promise<Student[]> {
  if (isUsingMockDatabase) {
    return mockDb.getStudentsByClass(classId)
  }

  const { data, error } = await supabase!.from("students").select("*").eq("class_id", classId)

  if (error) {
    console.error("Error getting students:", error)
    return []
  }

  return data || []
}

export async function updateStudent(studentId: string, name: string): Promise<Student | null> {
  if (isUsingMockDatabase) {
    return mockDb.updateStudent(studentId, name)
  }

  const { data, error } = await supabase!.from("students").update({ name }).eq("id", studentId).select()

  if (error) {
    console.error("Error updating student:", error)
    return null
  }

  return data?.[0] || null
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  if (isUsingMockDatabase) {
    return mockDb.deleteStudent(studentId)
  }

  const { error } = await supabase!.from("students").delete().eq("id", studentId)

  if (error) {
    console.error("Error deleting student:", error)
    return false
  }

  return true
}

// Attendance functions
export async function markAttendance(studentId: string, date: string, status: boolean): Promise<Attendance | null> {
  if (isUsingMockDatabase) {
    return mockDb.markAttendance(studentId, date, status)
  }

  // First check if attendance record exists
  const { data: existingData } = await supabase!
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .eq("date", date)
    .single()

  if (existingData) {
    // Update existing record
    const { data, error } = await supabase!.from("attendance").update({ status }).eq("id", existingData.id).select()

    if (error) {
      console.error("Error updating attendance:", error)
      return null
    }

    return data?.[0] || null
  } else {
    // Create new record
    const { data, error } = await supabase!
      .from("attendance")
      .insert([{ student_id: studentId, date, status }])
      .select()

    if (error) {
      console.error("Error marking attendance:", error)
      return null
    }

    return data?.[0] || null
  }
}

export async function getAttendanceByDate(
  classId: string,
  date: string,
): Promise<{ student: Student; attendance: Attendance | null }[]> {
  if (isUsingMockDatabase) {
    return mockDb.getAttendanceByDate(classId, date)
  }

  // Get all students in the class
  const students = await getStudentsByClass(classId)

  // Get attendance records for the date
  const { data: attendanceData, error } = await supabase!
    .from("attendance")
    .select("*")
    .in(
      "student_id",
      students.map((s) => s.id),
    )
    .eq("date", date)

  if (error) {
    console.error("Error getting attendance:", error)
    return students.map((student) => ({ student, attendance: null }))
  }

  // Map students to their attendance records
  return students.map((student) => {
    const attendance = attendanceData?.find((a) => a.student_id === student.id) || null
    return { student, attendance }
  })
}

export async function getAttendanceByDateRange(
  classId: string,
  startDate: string,
  endDate: string,
): Promise<{ date: string; present: number; absent: number }[]> {
  if (isUsingMockDatabase) {
    return mockDb.getAttendanceByDateRange(classId, startDate, endDate)
  }

  // Get all students in the class
  const students = await getStudentsByClass(classId)

  if (students.length === 0) {
    return []
  }

  // Get attendance records for the date range
  const { data: attendanceData, error } = await supabase!
    .from("attendance")
    .select("*")
    .in(
      "student_id",
      students.map((s) => s.id),
    )
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error getting attendance:", error)
    return []
  }

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
  attendanceData?.forEach((record) => {
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

export async function getStudentAttendance(
  studentId: string,
  startDate: string,
  endDate: string,
): Promise<{ date: string; status: boolean }[]> {
  if (isUsingMockDatabase) {
    return mockDb.getStudentAttendance(studentId, startDate, endDate)
  }

  const { data, error } = await supabase!
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error getting student attendance:", error)
    return []
  }

  return (
    data?.map((record) => ({
      date: record.date,
      status: record.status,
    })) || []
  )
}

