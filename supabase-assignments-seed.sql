-- 1. Create an Active Feedback Cycle for Computer Engineering 3rd Year
INSERT INTO feedback_cycles (id, cycle_name, department_id, year, semester, section, enabled)
VALUES (
    'f1111111-1111-1111-1111-111111111111', 
    'Mid-Semester Feedback 2024', 
    '66666666-6666-6666-6666-666666666666', 
    3, 
    5, 
    'A', 
    true
);

-- 2. Map the 6 Subjects to their Respective Faculty for Year 3, Semester 5, Section A
INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, year, semester, section, active) VALUES
  -- 1. Internet of Things (Mrs.R.Sangeetha)
  ('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 3, 5, 'A', true),
  
  -- 2. Cloud Computing (Mrs.M.Nandha)
  ('e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 3, 5, 'A', true),
  
  -- 3. Computer Hardware & Networking (Mrs.U.K. Sree Murugan)
  ('e3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 3, 5, 'A', true),
  
  -- 4. Artificial Intelligent and Machine Learning (Mrs.V. Saranya)
  ('e4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 3, 5, 'A', true),
  
  -- 5. Innovation & Start-up (Mrs.V. Saranya)
  ('e4444444-4444-4444-4444-444444444444', 'd5555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 3, 5, 'A', true),
  
  -- 6. Component Based Technology (Mrs.R.Sangeetha)
  ('e1111111-1111-1111-1111-111111111111', 'd6666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 3, 5, 'A', true);
