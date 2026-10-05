import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

// Use the service_role key to bypass RLS!
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Inserting Feedback Cycle...');
  const { error: cycleError } = await supabase.from('feedback_cycles').upsert([{
    id: 'f1111111-1111-1111-1111-111111111111', 
    cycle_name: 'Mid-Semester Feedback 2024', 
    department_id: '66666666-6666-6666-6666-666666666666', 
    year: 3, 
    semester: 5, 
    section: 'A', 
    enabled: true
  }]);

  if (cycleError) {
    console.error('Failed to insert cycle:', cycleError);
    return;
  }
  console.log('Cycle inserted successfully.');

  console.log('Inserting Faculty Subject Assignments...');
  const assignments = [
    { faculty_id: 'e1111111-1111-1111-1111-111111111111', subject_id: 'd1111111-1111-1111-1111-111111111111', department_id: '66666666-6666-6666-6666-666666666666', year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e2222222-2222-2222-2222-222222222222', subject_id: 'd2222222-2222-2222-2222-222222222222', department_id: '66666666-6666-6666-6666-666666666666', year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e3333333-3333-3333-3333-333333333333', subject_id: 'd3333333-3333-3333-3333-333333333333', department_id: '66666666-6666-6666-6666-666666666666', year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e4444444-4444-4444-4444-444444444444', subject_id: 'd4444444-4444-4444-4444-444444444444', department_id: '66666666-6666-6666-6666-666666666666', year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e4444444-4444-4444-4444-444444444444', subject_id: 'd5555555-5555-5555-5555-555555555555', department_id: '66666666-6666-6666-6666-666666666666', year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e1111111-1111-1111-1111-111111111111', subject_id: 'd6666666-6666-6666-6666-666666666666', department_id: '66666666-6666-6666-6666-666666666666', year: 3, semester: 5, section: 'A', active: true }
  ];

  const { error: assignmentError } = await supabase.from('faculty_subject_assignments').insert(assignments);
  
  if (assignmentError) {
    console.error('Failed to insert assignments:', assignmentError);
  } else {
    console.log('Assignments inserted successfully! Database is ready!');
  }
}

run();
