import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://welaaaqfbgqxhpjjbmzl.supabase.co', process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'civildept@tpt.edu.in',
    password: 'Civil@2026',
  });
  console.log("Auth:", !!authData?.user, authError?.message);
  
  if (authData.user) {
    const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .limit(1)
        .maybeSingle();
    console.log("Faculty:", facultyData, facultyError);
  }
}

run();
