import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

// We must use the service_role key to create users in auth.users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const accountsToCreate = [
  { name: 'Civil Engineering', username: 'civil', password: 'civil123', deptId: '11111111-1111-1111-1111-111111111111' },
  { name: 'Mechanical Engineering', username: 'mech', password: 'mech123', deptId: '22222222-2222-2222-2222-222222222222' },
  { name: 'Electrical & Electronics Engineering', username: 'eee', password: 'eee123', deptId: '33333333-3333-3333-3333-333333333333' },
  { name: 'Production Engineering', username: 'prod', password: 'prod123', deptId: '44444444-4444-4444-4444-444444444444' },
  { name: 'Textile Technology', username: 'textile', password: 'textile123', deptId: '55555555-5555-5555-5555-555555555555' },
  { name: 'Computer Engineering', username: 'computer', password: 'computer123', deptId: '66666666-6666-6666-6666-666666666666' },
  { name: 'Computer Science & Information Technology', username: 'csit', password: 'csit123', deptId: '77777777-7777-7777-7777-777777777777' },
  { name: 'Electronics & Communication Engineering', username: 'ece', password: 'ece123', deptId: '88888888-8888-8888-8888-888888888888' },
  { name: 'Architecture', username: 'arch', password: 'arch123', deptId: '99999999-9999-9999-9999-999999999999' },
  { name: 'Artificial Intelligence & Machine Learning', username: 'aiml', password: 'aiml123', deptId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
];

async function run() {
  console.log('Starting account creation...');

  for (const acc of accountsToCreate) {
    const email = `${acc.username}@tpt.edu.in`;
    console.log(`Creating user: ${email}`);

    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: acc.password,
      email_confirm: true
    });

    if (authError && authError.message !== 'User already registered') {
      console.error(`Failed to create auth user for ${acc.username}:`, authError.message);
      continue;
    }

    // 2. Fetch the auth user ID (whether just created or existing)
    // Supabase auth.admin.createUser returns the user if created.
    let userId = authData?.user?.id;
    if (!userId) {
       // If it already existed, fetch it
       const { data: usersData } = await supabase.auth.admin.listUsers();
       const existingUser = usersData.users.find(u => u.email === email);
       if (existingUser) userId = existingUser.id;
    }

    if (!userId) {
       console.error(`Could not find auth user ID for ${email}`);
       continue;
    }

    // 3. Upsert into Faculty table so they can log in via the Faculty Portal
    const { error: insertError } = await supabase.from('faculty').upsert({
      auth_user_id: userId,
      faculty_name: acc.name + ' Admin',
      username: acc.username,
      department_id: acc.deptId,
      active: true
    }, { onConflict: 'username' });

    if (insertError) {
      console.error(`Failed to map faculty profile for ${acc.username}:`, insertError.message);
    } else {
      console.log(`Successfully mapped profile for ${acc.username}`);
    }
  }
  console.log('Finished!');
}

run();
