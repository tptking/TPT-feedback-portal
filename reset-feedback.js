import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  console.log("Fetching students in Year 1 and Year 2...");
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id')
    .in('year', [2, 3]);

  if (studentError) {
    console.error("Error fetching students:", studentError);
    return;
  }

  if (!students || students.length === 0) {
    console.log("No students found in Year 1 or Year 2.");
    return;
  }

  const studentIds = students.map(s => s.id);
  console.log(`Found ${studentIds.length} students. Deleting their feedback responses...`);

  // Delete all feedback responses for these students
  // Because of ON DELETE CASCADE, this will also delete their feedback_answers
  const { error: deleteError } = await supabase
    .from('feedback_responses')
    .delete()
    .in('student_id', studentIds);

  if (deleteError) {
    console.error("Error deleting feedback:", deleteError);
  } else {
    console.log("Successfully wiped all test feedback for Year 1 and Year 2! Counting is restarted.");
  }
}

reset();
