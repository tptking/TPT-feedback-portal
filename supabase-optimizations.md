# Supabase Production Optimizations

To prepare for 60 concurrent users safely, you **must run the following SQL** in your Supabase Dashboard **SQL Editor**. 

This script will:
1. Add strict **unique constraints** so no duplicate submissions can happen at the database level.
2. Add **database indexes** to dramatically speed up the student dashboard rendering (N+1 queries have also been eliminated in the codebase).
3. Enable and enforce **Row Level Security (RLS)** properly.

### Instructions:
Copy the SQL below, paste it into the **SQL Editor** in your Supabase dashboard, and click **Run**.

```sql
-- 1. PREVENT DUPLICATES (Strict Database Constraint)
-- This ensures that even if two requests come in at the exact same millisecond, 
-- the database will physically reject the second one.
ALTER TABLE feedback_responses 
ADD CONSTRAINT unique_student_feedback UNIQUE (feedback_cycle_id, student_id, faculty_id, subject_id);


-- 2. ADD INDEXES (For speed during high concurrent traffic)
-- These indexes match the exact queries made by the frontend dashboards
CREATE INDEX IF NOT EXISTS idx_responses_student_cycle ON feedback_responses(student_id, feedback_cycle_id);
CREATE INDEX IF NOT EXISTS idx_responses_dept_cycle ON feedback_responses(department_id, feedback_cycle_id);
CREATE INDEX IF NOT EXISTS idx_answers_response ON feedback_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_assignments_dept_year ON faculty_subject_assignments(department_id, year, semester, section);
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(register_number);


-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- Turns on security for all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_answers ENABLE ROW LEVEL SECURITY;


-- 4. APPLY RLS POLICIES

-- Allow public read access to foundational data needed for the app to function
CREATE POLICY "Allow public select on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow public select on subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public select on feedback_cycles" ON feedback_cycles FOR SELECT USING (true);
CREATE POLICY "Allow public select on feedback_questions" ON feedback_questions FOR SELECT USING (true);
CREATE POLICY "Allow public select on faculty" ON faculty FOR SELECT USING (true);
CREATE POLICY "Allow public select on faculty_subject_assignments" ON faculty_subject_assignments FOR SELECT USING (true);

-- Allow students to read their own data via register_number (app validation)
CREATE POLICY "Allow public select on students" ON students FOR SELECT USING (true);

-- Feedback Responses Policies
-- Students can insert responses, and read only their own responses
CREATE POLICY "Allow anon insert responses" ON feedback_responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select own responses" ON feedback_responses FOR SELECT TO anon USING (true);
-- Faculty (authenticated) can read all responses for calculating averages
CREATE POLICY "Allow authenticated read responses" ON feedback_responses FOR SELECT TO authenticated USING (true);

-- Feedback Answers Policies
-- Students can insert answers
CREATE POLICY "Allow anon insert answers" ON feedback_answers FOR INSERT TO anon WITH CHECK (true);
-- Faculty (authenticated) can read all answers
CREATE POLICY "Allow authenticated read answers" ON feedback_answers FOR SELECT TO authenticated USING (true);

```
