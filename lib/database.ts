import {
  supabase,
  type Teacher,
  type Class,
  type Student,
  type Attendance,
  isUsingMockDatabase,
  mockDB,
} from "./supabase"

// Helper function to handle Supabase errors
const handleSupabaseError = (operation: string, error: any) => {
  console.error(`[Database] Error ${operation}:`, error)

  // Check for specific error types
  if (error.code === "PGRST301") {
    console.error("[Database] Row-level security policy violation")
  } else if (error.code === "23505") {
    console.error("[Database] Unique constraint violation")
  } else if (error.code === "42P01") {
    console.error("[Database] Table does not exist")
  }

  return null
}

// Teacher functions
export async function createTeacher(email: string, name: string): Promise<Teacher | null> {
  try {
    console.log(`[Database] Creating teacher: ${email}`)

    // Check if we're in mock mode
    if (isUsingMockDatabase) {
      console.log(`[Database] Using mock database for createTeacher`)
      return mockDB.createTeacher(email, name)
    }

    if (!supabase) {
      console.error("[Database] Cannot create teacher: Supabase client is null")
      // Fallback to mock database
      return mockDB.createTeacher(email, name)
    }

    const { data, error } = await supabase.from("teachers").insert([{ email, name }]).select()

    if (error) {
      // If there's an error, try to fall back to mock database
      console.error(`[Database] Error creating teacher, falling back to mock:`, error)
      return mockDB.createTeacher(email, name)
    }

    console.log("[Database] Teacher created successfully:", data?.[0])
    return data?.[0] || null
  } catch (error) {
    console.error("[Database] Exception creating teacher:", error)
    // Fall back to mock database on exception
    return mockDB.createTeacher(email, name)
  }
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  try {
    console.log(`[Database] Getting teacher by email: ${email}`)

    // Check if we're in mock mode
    if (isUsingMockDatabase) {
      console.log(`[Database] Using mock database for getTeacherByEmail`)
      return mockDB.getTeacherByEmail(email)
    }

    if (!supabase) {
      console.error("[Database] Cannot get teacher: Supabase client is null")
      // Fallback to mock database
      return mockDB.getTeacherByEmail(email)
    }

    const { data, error } = await supabase.from("teachers").select("*").eq("email", email).single()

    if (error) {
      // If there's an error, try to fall back to mock database
      console.error(`[Database] Error getting teacher, falling back to mock:`, error)
      return mockDB.getTeacherByEmail(email)
    }

    console.log("[Database] Teacher retrieved successfully:", data)
    return data
  } catch (error) {
    console.error("Exception getting teacher:", error)
    // Fall back to mock database on exception
    return mockDB.getTeacherByEmail(email)
  }
}

// Class functions
export async function createClass(
  teacherId: string,
  schoolName: string,
  className: string,
  session: string,
): Promise<Class | null> {
  try {
    console.log(`[Database] Creating class: ${className} for teacher: ${teacherId}`)

    // Check if we're in mock mode
    if (isUsingMockDatabase) {
      console.log(`[Database] Using mock database for createClass`)
      return mockDB.createClass(teacherId, schoolName, className, session)
    }

    if (!supabase) {
      console.error("[Database] Cannot create class: Supabase client is null")
      // Fallback to mock database
      return mockDB.createClass(teacherId, schoolName, className, session)
    }

    const { data, error } = await supabase
      .from("classes")
      .insert([{ teacher_id: teacherId, school_name: schoolName, class_name: className, session }])
      .select()

    if (error) {
      // If there's an error, try to fall back to mock database
      console.error(`[Database] Error creating class, falling back to mock:`, error)
      return mockDB.createClass(teacherId, schoolName, className, session)
    }

    console.log("[Database] Class created successfully:", data?.[0])
    return data?.[0] || null
  } catch (error) {
    console.error("Exception creating class:", error)
    // Fall back to mock database on exception
    return mockDB.createClass(teacherId, schoolName, className, session)
  }
}

export async function getClassesByTeacher(teacherId: string): Promise<Class[]> {
  try {
    console.log(`[Database] Getting classes for teacher: ${teacherId}`)

    // Check if we're in mock mode
    if (isUsingMockDatabase) {
      console.log(`[Database] Using mock database for getClassesByTeacher`)
      return mockDB.getClassesByTeacher(teacherId)
    }

    if (!supabase) {
      console.error("[Database] Cannot get classes: Supabase client is null")
      // Fallback to mock database
      return mockDB.getClassesByTeacher(teacherId)
    }

    const { data, error } = await supabase.from("classes").select("*").eq("teacher_id", teacherId)

    if (error) {
      // If there's an error, try to fall back to mock database
      console.error(`[Database] Error getting classes, falling back to mock:`, error)
      return mockDB.getClassesByTeacher(teacherId)
    }

    console.log(`[Database] Retrieved ${data?.length || 0} classes for teacher`)
    return data || []
  } catch (error) {
    console.error("Exception getting classes:", error)
    // Fall back to mock database on exception
    return mockDB.getClassesByTeacher(teacherId)
  }
}

// Student functions
export async function createStudent(classId: string, name: string): Promise<Student | null> {
  try {
    console.log(`[Database] Creating student: ${name} for class: ${classId}`)

    // Check if we're in mock mode
    if (isUsingMockDatabase) {
      console.log(`[Database] Using mock database for createStudent`)
      return mockDB.createStudent(classId, name)
    }

    if (!supabase) {
      console.error("[Database] Cannot create student: Supabase client is null")
      // Fallback to mock database
      return mockDB.createStudent(classId, name)
    }

    const { data, error } = await supabase
      .from("students")
      .insert([{ class_id: classId, name }])
      .select()

    if (error) {
      // If there's an error, try to fall back to mock database
      console.error(`[Database] Error creating student, falling back to mock:`, error)
      return mockDB.createStudent(classId, name)
    }

    console.log("[Database] Student created successfully:", data?.[0])
    return data?.[0] || null
  } catch (error) {
    console.error("Exception creating student:", error)
    // Fall back to mock database on exception
    return mockDB.createStudent(classId, name)
  }
}

export async function getStudentsByClass(classId: string): Promise<Student[]> {
  try {
    console.log(`[Database] Getting students for class: ${classId}`)

    // Check if we're in mock mode
    if (isUsingMockDatabase) {
      console.log(`[Database] Using mock database for getStudentsByClass`)
      return mockDB.getStudentsByClass(classId)
    }

    if (!supabase) {
      console.error("[Database] Cannot get students: Supabase client is null")
      // Fallback to mock database
      return mockDB.getStudentsByClass(classId)
    }

    const { data, error } = await supabase.from("students").select("*").eq("class_id", classId)

    if (error) {
      // If there's an error, try to fall back to mock database
      console.error(`[Database] Error getting students, falling back to mock:`, error)
      return mockDB.getStudentsByClass(classId)
    }

    console.log(`[Database] Retrieved ${data?.length || 0} students for class`)
    return data || []
  } catch (error) {
    console.error("Exception getting students:", error)
    // Fall back to mock database on exception
    return mockDB.getStudentsByClass(classId)
  }
}

// Attendance functions
export async function getAttendanceByDate(classId: string, date: string): Promise<any[]> {
  try {
    console.log(`[Database] Getting attendance for class ${classId} on ${date}`)
    if (isUsingMockDatabase) return []
    if (!supabase) return []
    const { data, error } = await supabase
      .from("attendance")
      .select("*, student(*)")
      .eq("date", date)
      .join("students", { from: "students", on: "student_id", eq: "id" })
      .filter("student.class_id", "eq", classId)
    if (error) return handleSupabaseError("getAttendanceByDate", error)
    return data || []
  } catch (error) {
    console.error("Exception getting attendance by date:", error)
    return []
  }
}

export async function markAttendance(studentId: string, date: string, status: boolean): Promise<Attendance | null> {
  try {
    console.log(`[Database] Marking attendance for student: ${studentId} on date: ${date} as: ${status}`)

    // Check if we're in mock mode
    if (isUsingMockDatabase) {
      console.log(`[Database] Using mock database for markAttendance`)
      return mockDB.markAttendance(studentId, date, status)
    }

    if (!supabase) {
      console.error("[Database] Cannot mark attendance: Supabase client is null")
      // Fallback to mock database
      return mockDB.markAttendance(studentId, date, status)
    }

    // First check if attendance record exists
    const { data: existingData, error: checkError } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", studentId)
      .eq("date", date)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected
      console.error(`[Database] Error checking attendance, falling back to mock:`, checkError)
      return mockDB.markAttendance(studentId, date, status)
    }

    if (existingData) {
      // Update existing record
      console.log("[Database] Updating existing attendance record")
      const { data, error } = await supabase.from("attendance").update({ status }).eq("id", existingData.id).select()

      if (error) {
        console.error(`[Database] Error updating attendance, falling back to mock:`, error)
        return mockDB.markAttendance(studentId, date, status)
      }

      console.log("[Database] Attendance updated successfully:", data?.[0])
      return data?.[0] || null
    } else {
      // Create new record
      console.log("[Database] Creating new attendance record")
      const { data, error } = await supabase
        .from("attendance")
        .insert([{ student_id: studentId, date, status }])
        .select()

      if (error) {
        console.error(`[Database] Error marking attendance, falling back to mock:`, error)
        return mockDB.markAttendance(studentId, date, status)
      }

      console.log("[Database] Attendance marked successfully:", data?.[0])
      return data?.[0] || null
    }
  } catch (error) {
    console.error("Exception marking attendance:", error)
    // Fall back to mock database on exception
    return mockDB.markAttendance(studentId, date, status)
  }
}

export async function getAttendanceByDateRange(classId: string, startDate: string, endDate: string): Promise<any[]> {
  try {
    console.log(`[Database] Getting attendance for class ${classId} between ${startDate} and ${endDate}`)
    if (isUsingMockDatabase) return []
    if (!supabase) return []
    const { data, error } = await supabase
      .from("attendance")
      .select("date, count(*) as total, sum(status) as present, count(*) - sum(status) as absent")
      .groupBy("date")
      .range(new Date(startDate), new Date(endDate))
      .join("students", { from: "students", on: "student_id", eq: "id" })
      .filter("student.class_id", "eq", classId)
    if (error) return handleSupabaseError("getAttendanceByDateRange", error)
    return data || []
  } catch (error) {
    console.error("Exception getting attendance by date range:", error)
    return []
  }
}

export async function getStudentAttendance(studentId: string, startDate: string, endDate: string): Promise<any[]> {
  try {
    console.log(`[Database] Getting attendance for student ${studentId} between ${startDate} and ${endDate}`)
    if (isUsingMockDatabase) return []
    if (!supabase) return []
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", studentId)
      .gte("date", startDate)
      .lte("date", endDate)
    if (error) return handleSupabaseError("getStudentAttendance", error)
    return data || []
  } catch (error) {
    console.error("Exception getting student attendance:", error)
    return []
  }
}

