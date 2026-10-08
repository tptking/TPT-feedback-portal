import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const accounts = [
  { deptId: '11111111-1111-1111-1111-111111111111', name: 'Civil Engineering Admin', username: 'civildept', pass: 'Civil@2026' },
  { deptId: '22222222-2222-2222-2222-222222222222', name: 'Mechanical Engineering Admin', username: 'mechdept', pass: 'Mech@2026' },
  { deptId: '33333333-3333-3333-3333-333333333333', name: 'Electrical & Electronics Admin', username: 'eeedept', pass: 'Eee@2026' },
  { deptId: '44444444-4444-4444-4444-444444444444', name: 'Production Engineering Admin', username: 'proddept', pass: 'Prod@2026' },
  { deptId: '55555555-5555-5555-5555-555555555555', name: 'Textile Technology Admin', username: 'textiledept', pass: 'Textile@2026' },
  { deptId: '66666666-6666-6666-6666-666666666666', name: 'Computer Engineering Admin', username: 'computerdept', pass: 'Computer@2026' },
  { deptId: '77777777-7777-7777-7777-777777777777', name: 'CS & IT Admin', username: 'csitdept', pass: 'Csit@2026' },
  { deptId: '88888888-8888-8888-8888-888888888888', name: 'Electronics & Communication Admin', username: 'ecedept', pass: 'Ece@2026' },
  { deptId: '99999999-9999-9999-9999-999999999999', name: 'Architecture Admin', username: 'archdept', pass: 'Arch@2026' },
  { deptId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'AI & ML Admin', username: 'aimldept', pass: 'Aiml@2026' }
];

async function setup() {
  console.log("Setting up faculty accounts using Admin API...");

  for (const acc of accounts) {
    const email = `${acc.username}@tpt.edu.in`;
    
    // 1. Try to create the user
    console.log(`Creating user: ${acc.username}...`);
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: acc.pass,
      email_confirm: true // bypass confirmation
    });

    let userId;

    if (createError) {
      if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
        console.log(`   User ${acc.username} already exists, fetching ID...`);
        // Find user by email
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error(`   Error fetching users:`, listError.message);
          continue;
        }
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
           userId = existingUser.id;
        } else {
           console.error(`   Could not find existing user ${email}`);
           continue;
        }
      } else {
        console.error(`   Error creating user ${acc.username}:`, createError.message);
        continue;
      }
    } else {
      userId = userData.user.id;
    }

    if (!userId) {
       console.error(`   Failed to determine user ID for ${acc.username}`);
       continue;
    }

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
  }

  console.log("Done setup!");
}

setup();
