import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Inserting missing faculty members...');
  
  const newFaculty = [
    { id: 'e5555555-5555-5555-5555-555555555555', faculty_name: 'Mrs. Yogamalini P', username: 'yogamalini', department_id: '66666666-6666-6666-6666-666666666666' },
    { id: 'e6666666-6666-6666-6666-666666666666', faculty_name: 'Mrs. RajaRajeswari R', username: 'rajarajeswari', department_id: '66666666-6666-6666-6666-666666666666' }
  ];

  await supabase.from('faculty').upsert(newFaculty, { onConflict: 'id' });

  console.log('Clearing old assignments...');
  await supabase.from('faculty_subject_assignments').delete().neq('faculty_id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all

  console.log('Inserting all 12 assignments (2 per subject)...');
  const departmentId = '66666666-6666-6666-6666-666666666666';
  
  const assignments = [
    // 1. Internet of Things (Sangeetha + Nandha)
    { faculty_id: 'e1111111-1111-1111-1111-111111111111', subject_id: 'd1111111-1111-1111-1111-111111111111', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e2222222-2222-2222-2222-222222222222', subject_id: 'd1111111-1111-1111-1111-111111111111', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },
    
    // 2. Cloud Computing (Nandha + Yogamalini)
    { faculty_id: 'e2222222-2222-2222-2222-222222222222', subject_id: 'd2222222-2222-2222-2222-222222222222', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e5555555-5555-5555-5555-555555555555', subject_id: 'd2222222-2222-2222-2222-222222222222', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },

    // 3. Computer Hardware & Networking (Sree Murugan + RajaRajeswari)
    { faculty_id: 'e3333333-3333-3333-3333-333333333333', subject_id: 'd3333333-3333-3333-3333-333333333333', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e6666666-6666-6666-6666-666666666666', subject_id: 'd3333333-3333-3333-3333-333333333333', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },

    // 4. Artificial Intelligence and Machine Learning (Saranya + Sree Murugan)
    { faculty_id: 'e4444444-4444-4444-4444-444444444444', subject_id: 'd4444444-4444-4444-4444-444444444444', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e3333333-3333-3333-3333-333333333333', subject_id: 'd4444444-4444-4444-4444-444444444444', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },

    // 5. Innovation & Start-up (Saranya + Sangeetha)
    { faculty_id: 'e4444444-4444-4444-4444-444444444444', subject_id: 'd5555555-5555-5555-5555-555555555555', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e1111111-1111-1111-1111-111111111111', subject_id: 'd5555555-5555-5555-5555-555555555555', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },

    // 6. Component Based Technology (Sangeetha + Saranya)
    { faculty_id: 'e1111111-1111-1111-1111-111111111111', subject_id: 'd6666666-6666-6666-6666-666666666666', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true },
    { faculty_id: 'e4444444-4444-4444-4444-444444444444', subject_id: 'd6666666-6666-6666-6666-666666666666', department_id: departmentId, year: 3, semester: 5, section: 'A', active: true }
  ];

  const { error } = await supabase.from('faculty_subject_assignments').insert(assignments);

  if (error) console.error('Error assigning all teachers:', error);
  else console.log('Successfully added all 12 teachers to their subjects!');
}

run();
