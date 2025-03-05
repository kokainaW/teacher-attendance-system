-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  session TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Teachers can read their own data
CREATE POLICY teacher_select ON teachers
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = teachers.email
));

-- Teachers can update their own data
CREATE POLICY teacher_update ON teachers
FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = teachers.email
));

-- Classes policies
CREATE POLICY class_select ON classes
FOR SELECT USING (teacher_id IN (
  SELECT id FROM teachers WHERE email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

CREATE POLICY class_insert ON classes
FOR INSERT WITH CHECK (teacher_id IN (
  SELECT id FROM teachers WHERE email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

CREATE POLICY class_update ON classes
FOR UPDATE USING (teacher_id IN (
  SELECT id FROM teachers WHERE email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

CREATE POLICY class_delete ON classes
FOR DELETE USING (teacher_id IN (
  SELECT id FROM teachers WHERE email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

-- Students policies
CREATE POLICY student_select ON students
FOR SELECT USING (class_id IN (
  SELECT id FROM classes WHERE teacher_id IN (
    SELECT id FROM teachers WHERE email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
));

CREATE POLICY student_insert ON students
FOR INSERT WITH CHECK (class_id IN (
  SELECT id FROM classes WHERE teacher_id IN (
    SELECT id FROM teachers WHERE email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
));

CREATE POLICY student_update ON students
FOR UPDATE USING (class_id IN (
  SELECT id FROM classes WHERE teacher_id IN (
    SELECT id FROM teachers WHERE email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
));

CREATE POLICY student_delete ON students
FOR DELETE USING (class_id IN (
  SELECT id FROM classes WHERE teacher_id IN (
    SELECT id FROM teachers WHERE email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
));

-- Attendance policies
CREATE POLICY attendance_select ON attendance
FOR SELECT USING (student_id IN (
  SELECT id FROM students WHERE class_id IN (
    SELECT id FROM classes WHERE teacher_id IN (
      SELECT id FROM teachers WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
));

CREATE POLICY attendance_insert ON attendance
FOR INSERT WITH CHECK (student_id IN (
  SELECT id FROM students WHERE class_id IN (
    SELECT id FROM classes WHERE teacher_id IN (
      SELECT id FROM teachers WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
));

CREATE POLICY attendance_update ON attendance
FOR UPDATE USING (student_id IN (
  SELECT id FROM students WHERE class_id IN (
    SELECT id FROM classes WHERE teacher_id IN (
      SELECT id FROM teachers WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
));

CREATE POLICY attendance_delete ON attendance
FOR DELETE USING (student_id IN (
  SELECT id FROM students WHERE class_id IN (
    SELECT id FROM classes WHERE teacher_id IN (
      SELECT id FROM teachers WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
));

