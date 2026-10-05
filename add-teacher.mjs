import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Adding second teacher to Innovation & Start-up...');
  
  // Assign Mrs.R.Sangeetha (e1111111) to Innovation & Start-up (d5555555)
  const { error } = await supabase.from('faculty_subject_assignments').insert([{
    faculty_id: 'e1111111-1111-1111-1111-111111111111', 
    subject_id: 'd5555555-5555-5555-5555-555555555555', 
    department_id: '66666666-6666-6666-6666-666666666666', 
    year: 3, 
    semester: 5, 
    section: 'A', 
    active: true 
  }]);

  if (error) console.error('Error adding second teacher:', error);
  else console.log('Successfully added second teacher!');
}

run();
