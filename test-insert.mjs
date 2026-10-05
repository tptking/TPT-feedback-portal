import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTI2ODgsImV4cCI6MjEwNjc4ODY4OH0.AC12UcCKErlPNO5i3LKH5BrLB3YlDELqPPnFJ_AJ8aI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('feedback_cycles').insert([{
    id: 'f1111111-1111-1111-1111-111111111111', 
    cycle_name: 'Mid-Semester Feedback 2024', 
    department_id: '66666666-6666-6666-6666-666666666666', 
    year: 3, 
    semester: 5, 
    section: 'A', 
    enabled: true
  }]).select();
  
  if (error) {
    console.error('ERROR:', error.message, error.details, error.hint);
  } else {
    console.log('SUCCESS:', data);
  }
}

run();
