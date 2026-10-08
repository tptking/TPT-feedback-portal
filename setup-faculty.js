import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
  { deptId: 1, name: 'Civil Engineering Admin', username: 'civildept', pass: 'Civil@2026' },
  { deptId: 2, name: 'Mechanical Engineering Admin', username: 'mechdept', pass: 'Mech@2026' },
  { deptId: 3, name: 'Electrical & Electronics Admin', username: 'eeedept', pass: 'Eee@2026' },
  { deptId: 4, name: 'Production Engineering Admin', username: 'proddept', pass: 'Prod@2026' },
  { deptId: 5, name: 'Textile Technology Admin', username: 'textiledept', pass: 'Textile@2026' },
  { deptId: 6, name: 'Computer Engineering Admin', username: 'computerdept', pass: 'Computer@2026' },
  { deptId: 7, name: 'CS & IT Admin', username: 'csitdept', pass: 'Csit@2026' },
  { deptId: 8, name: 'Electronics & Communication Admin', username: 'ecedept', pass: 'Ece@2026' },
  { deptId: 9, name: 'Architecture Admin', username: 'archdept', pass: 'Arch@2026' },
  { deptId: 10, name: 'AI & ML Admin', username: 'aimldept', pass: 'Aiml@2026' }
];

async function setup() {
  console.log("Setting up faculty accounts...");

  for (const acc of accounts) {
    const email = `${acc.username}@tpt.edu.in`;
    
    // 1. Try to sign up the user
    console.log(`Creating user: ${acc.username}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: acc.pass,
    });

    if (authError) {
      console.log(`   Warning for ${acc.username}: ${authError.message}`);
      // It might already exist, so we will try to login to get the user id
    }

    // Sign in to get user ID if signup failed due to already existing
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: acc.pass,
    });

    if (loginError || !loginData.user) {
      console.error(`   Failed to login for ${acc.username}:`, loginError?.message);
      continue;
    }

    const userId = loginData.user.id;

    // 2. Check if faculty record exists
    const { data: existingFac } = await supabase
      .from('faculty')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (!existingFac) {
      // 3. Insert faculty record
      console.log(`   Inserting faculty record for ${acc.username}...`);
      const { error: insertError } = await supabase
        .from('faculty')
        .insert({
          auth_user_id: userId,
          faculty_name: acc.name,
          username: acc.username,
          department_id: acc.deptId
        });
      
      if (insertError) {
        console.error(`   Failed to insert faculty record:`, insertError.message);
      } else {
        console.log(`   Successfully setup ${acc.username}!`);
      }
    } else {
      console.log(`   Faculty record already exists for ${acc.username}.`);
    }

    // Sign out to prepare for next user
    await supabase.auth.signOut();
  }

  console.log("Done setup!");
}

setup();
