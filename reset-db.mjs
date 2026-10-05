import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Resetting all student feedback data...');

  // 1. Delete all feedback_answers
  // We can just delete where id is not null to delete all rows
  const { error: err1 } = await supabase
    .from('feedback_answers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // hack to delete all since no truncate in JS

  if (err1) console.error('Error deleting answers:', err1);
  else console.log('Successfully cleared feedback_answers.');

  // 2. Delete all feedback_responses
  const { error: err2 } = await supabase
    .from('feedback_responses')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (err2) console.error('Error deleting responses:', err2);
  else console.log('Successfully cleared feedback_responses.');

  console.log('Database reset complete! All students are now PENDING.');
}

run();
