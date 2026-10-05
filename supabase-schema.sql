-- Supabase Database Schema for TPT Faculty Feedback System

-- 1. Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_name TEXT NOT NULL,
    department_code TEXT NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Programmes
CREATE TABLE programmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) NOT NULL,
    programme_name TEXT NOT NULL,
    programme_code TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Batches
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id),
    batch_name TEXT NOT NULL,
    start_year INTEGER,
    end_year INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Years
CREATE TABLE years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., '1st Year', '2nd Year', '3rd Year'
    level_order INT NOT NULL
);

-- 6. Semesters
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_number INTEGER NOT NULL,
    semester_name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sections
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id),
    year INTEGER,
    section_name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_number TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) NOT NULL,
    programme_id UUID REFERENCES programmes(id),
    batch_id UUID REFERENCES batches(id) NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    section TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Faculty
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID, -- Reference to Supabase Auth user
    faculty_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id),
    programme_id UUID REFERENCES programmes(id),
    subject_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    year INTEGER,
    semester INTEGER,
    academic_year TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Faculty Subject Assignments
CREATE TABLE faculty_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES faculty(id),
    subject_id UUID REFERENCES subjects(id),
    department_id UUID REFERENCES departments(id),
    year INTEGER,
    semester INTEGER,
    section TEXT,
    academic_year TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Feedback Cycles
CREATE TABLE feedback_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_name TEXT NOT NULL,
    department_id UUID REFERENCES departments(id),
    programme_id UUID REFERENCES programmes(id),
    batch_id UUID REFERENCES batches(id),
    year INTEGER,
    semester INTEGER,
    section TEXT,
    academic_year TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Feedback Questions
CREATE TABLE feedback_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 10),
    question_text TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Feedback Responses
CREATE TABLE feedback_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    faculty_id UUID REFERENCES faculty(id),
    subject_id UUID REFERENCES subjects(id),
    department_id UUID REFERENCES departments(id),
    feedback_cycle_id UUID REFERENCES feedback_cycles(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'COMPLETED',
    UNIQUE(student_id, faculty_id, subject_id, feedback_cycle_id)
);

-- 15. Feedback Answers
CREATE TABLE feedback_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES feedback_responses(id) ON DELETE CASCADE,
    question_id UUID REFERENCES feedback_questions(id),
    selected_option TEXT NOT NULL,
    rating_value INTEGER NOT NULL CHECK (rating_value IN (1, 2, 3, 4, 5)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(response_id, question_id)
);

-- 16. Department Feedback Settings
CREATE TABLE department_feedback_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id),
    feedback_cycle_id UUID REFERENCES feedback_cycles(id),
    enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department_id, feedback_cycle_id)
);

-- INDEXES
CREATE INDEX idx_students_register_number ON students(register_number);
CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_batch_id ON students(batch_id);
CREATE INDEX idx_students_year ON students(year);
CREATE INDEX idx_students_semester ON students(semester);
CREATE INDEX idx_students_section ON students(section);

CREATE INDEX idx_faculty_department_id ON faculty(department_id);

CREATE INDEX idx_subjects_department_id ON subjects(department_id);
CREATE INDEX idx_subjects_programme_id ON subjects(programme_id);
CREATE INDEX idx_subjects_year ON subjects(year);
CREATE INDEX idx_subjects_semester ON subjects(semester);

CREATE INDEX idx_fsa_faculty_id ON faculty_subject_assignments(faculty_id);
CREATE INDEX idx_fsa_subject_id ON faculty_subject_assignments(subject_id);

CREATE INDEX idx_fc_department_id ON feedback_cycles(department_id);
CREATE INDEX idx_fc_batch_id ON feedback_cycles(batch_id);
CREATE INDEX idx_fc_year ON feedback_cycles(year);
CREATE INDEX idx_fc_semester ON feedback_cycles(semester);
CREATE INDEX idx_fc_enabled ON feedback_cycles(enabled);

CREATE INDEX idx_responses_student_id ON feedback_responses(student_id);
CREATE INDEX idx_responses_faculty_id ON feedback_responses(faculty_id);
CREATE INDEX idx_responses_subject_id ON feedback_responses(subject_id);
CREATE INDEX idx_responses_cycle_id ON feedback_responses(feedback_cycle_id);

CREATE INDEX idx_answers_response_id ON feedback_answers(response_id);
CREATE INDEX idx_answers_question_id ON feedback_answers(question_id);


-- ROW LEVEL SECURITY (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_feedback_settings ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for initial testing (adjust for production)
CREATE POLICY "Enable read for all" ON departments FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON programmes FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON batches FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON students FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON faculty FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON subjects FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON faculty_subject_assignments FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON feedback_cycles FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON feedback_questions FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON department_feedback_settings FOR SELECT USING (true);

CREATE POLICY "Enable insert for anyone" ON feedback_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for anyone" ON feedback_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for anyone" ON feedback_responses FOR SELECT USING (true);
CREATE POLICY "Enable read for anyone" ON feedback_answers FOR SELECT USING (true);

-- DATA INSERTS

-- Departments
INSERT INTO departments (id, department_name, department_code) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Civil Engineering', 'CE'),
  ('22222222-2222-2222-2222-222222222222', 'Mechanical Engineering', 'ME'),
  ('33333333-3333-3333-3333-333333333333', 'Electrical & Electronics Engineering', 'EEE'),
  ('44444444-4444-4444-4444-444444444444', 'Production Engineering', 'PE'),
  ('55555555-5555-5555-5555-555555555555', 'Textile Technology', 'TT'),
  ('66666666-6666-6666-6666-666666666666', 'Computer Engineering', 'CO'),
  ('77777777-7777-7777-7777-777777777777', 'Computer Science & Information Technology', 'CSIT'),
  ('88888888-8888-8888-8888-888888888888', 'Electronics and Communication Engineering', 'ECE'),
  ('99999999-9999-9999-9999-999999999999', 'Architecture', 'AR'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Artificial Intelligence (AI) and Machine Learning', 'AIML');

-- Programmes
INSERT INTO programmes (id, department_id, programme_name, programme_code) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'Diploma in Computer Engineering', 'DCE');

-- Batches
INSERT INTO batches (id, department_id, batch_name, start_year, end_year) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', '2024–2027', 2024, 2027);

-- Academic Years
INSERT INTO academic_years (academic_year) VALUES ('2024-2025');

-- Semesters
INSERT INTO semesters (semester_number, semester_name) VALUES (5, 'Semester 5'), (6, 'Semester 6');

-- Feedback Questions
INSERT INTO feedback_questions (question_number, question_text) VALUES
  (1, 'Completion of syllabus as per plan'),
  (2, 'Evaluation of tests/assignments in time'),
  (3, 'Practice & Revision'),
  (4, 'Punctuality to the class'),
  (5, 'Preparation and subject knowledge'),
  (6, 'Presentation skill'),
  (7, 'Usage of appropriate teaching methods and aids'),
  (8, 'Adequately answer to students questions'),
  (9, 'Motivation to students in studies and co-curricular activities'),
  (10, 'Special guidance to academically weak students');

-- Faculty
INSERT INTO faculty (id, faculty_name, username, department_id) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Mrs.R.Sangeetha', 'sangeetha', '66666666-6666-6666-6666-666666666666'),
  ('e2222222-2222-2222-2222-222222222222', 'Mrs.M.Nandha', 'nandha', '66666666-6666-6666-6666-666666666666'),
  ('e3333333-3333-3333-3333-333333333333', 'Mrs.U.K. Sree Murugan', 'sreemurugan', '66666666-6666-6666-6666-666666666666'),
  ('e4444444-4444-4444-4444-444444444444', 'Mrs.V. Saranya', 'saranya', '66666666-6666-6666-6666-666666666666');

-- Subjects
INSERT INTO subjects (id, department_id, subject_name, course_code) VALUES
  ('d1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Internet of Things', '240-075415'),
  ('d2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Cloud Computing', '240-075414'),
  ('d3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Computer Hardware & Networking', '240-07516'),
  ('d4444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Artificial Intelligent and Machine Learning', '240-075501'),
  ('d5555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'Innovation & Start-up', '240-075502B'),
  ('d6666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Component Based Technology', '240-075502B');

-- Students (All 66 provided by user)
INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section) VALUES
('A2407008', 'Abinay Krishna A', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407009', 'Abishek R M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407010', 'Abishek Krish M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407011', 'Ajith R', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407012', 'Arunkumar R', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407013', 'Aswanth S T', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407014', 'Azarudhin J', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407015', 'Chandru E', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407016', 'Chandru M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407017', 'Deekshith P', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407018', 'Deepak S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407019', 'Dharnis V', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407020', 'Dharsana K G', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407021', 'Divya Dharshan S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407022', 'Divyadharshini A', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407023', 'Gopika M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407024', 'Gugan SP', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407025', 'Guru Prakash M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407026', 'Guruprasanth A', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407027', 'Hari Balaji K', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407028', 'Harish V', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407029', 'Ishanth Balakrishnan', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407030', 'Jaiakash T', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407031', 'Jayanthan R', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407032', 'Kavin L O', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407033', 'Kavin V V', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407034', 'Kishore V', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407035', 'Mathibalan M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407036', 'Meiyarasan B K', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407037', 'Mouleeswaran G', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407038', 'Mugunth Balaji G', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407039', 'Mukilarasan N', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407040', 'Nagappa V D M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407041', 'Nandhini A', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407042', 'Nithesh G', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407043', 'Nithishwar M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407044', 'Parthasarathy M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407045', 'Pooja V', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407046', 'Punitha S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407047', 'Raam Prakaash Suresh', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407048', 'Ratheesh S U', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407049', 'Roza Canisius Abinay S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407051', 'Sabarimala... K A', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407052', 'Sabarinathan K', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407053', 'Saranya V', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407054', 'Sarathi P', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407055', 'Sathana S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407056', 'Sivaneswaran A', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407057', 'Sree Karthika N', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407058', 'Srinivasan R', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407059', 'Sudharshini Ragavi K S D', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407060', 'Surya K', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407061', 'Tamilarasan V', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407062', 'Vasanth P G', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407063', 'Venkatesh S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407064', 'Vetrivel A R', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407065', 'Vidhyassri M K', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407066', 'Vipul N M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2407067', 'Vishwetha H', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('C2507002', 'Kumara Gurubharan R', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('C2507003', 'Mathibalan R', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('C2507004', 'Sakthi P', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('C2507005', 'Sriharini C P', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('C2507006', 'Tamilvanan S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('C2507007', 'Vibin Vignesh S', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A'),
('A2307016', 'Dhanush M', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 5, 'A');
