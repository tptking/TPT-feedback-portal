import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
const { Client } = pg;

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const admins = [
  { dept: 'Civil Engineering', username: 'civildept', pass: 'Civil@2026' },
  { dept: 'Mechanical Engineering', username: 'mechdept', pass: 'Mech@2026' },
  { dept: 'Electrical & Electronics Engineering', username: 'eeedept', pass: 'Eee@2026' },
  { dept: 'Production Engineering', username: 'proddept', pass: 'Prod@2026' },
  { dept: 'Textile Technology', username: 'textiledept', pass: 'Textile@2026' },
  { dept: 'Computer Engineering', username: 'computerdept', pass: 'Computer@2026' },
  { dept: 'Computer Science & Information Technology', username: 'csitdept', pass: 'Csit@2026' },
  { dept: 'Electronics & Communication Engineering', username: 'ecedept', pass: 'Ece@2026' },
  { dept: 'Architecture', username: 'archdept', pass: 'Arch@2026' },
  { dept: 'Artificial Intelligence & Machine Learning', username: 'aimldept', pass: 'Aiml@2026' }
];

const civilFaculties = [
  'M. Ponni',
  'Dr. R. Lavanya',
  'N. Gokulkannan',
  'S. Ambiga',
  'R. Renuka',
  'G. Vairamani'
];

async function run() {
  await client.connect();

  console.log("--- UPDATING ADMIN PASSWORDS ---");
  for (const admin of admins) {
    const email = `${admin.username}@tpt.edu.in`;
    
    // Check if user exists
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let existingUser = usersData.users.find(u => u.email === email);
    
    if (existingUser) {
      // Update password
      const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: admin.pass
      });
      if (error) console.error(`Error updating password for ${email}:`, error.message);
      else console.log(`Successfully updated password for ${email}`);
    } else {
      // Create user
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: email,
        password: admin.pass,
        email_confirm: true
      });
      if (error) console.error(`Error creating user ${email}:`, error.message);
      else {
        console.log(`Successfully created user ${email}`);
        existingUser = created.user;
      }
    }

    // Ensure they are linked in the faculty table
    if (existingUser) {
       await client.query(
         "UPDATE faculty SET auth_user_id = $1 WHERE username = $2 OR username = $3",
         [existingUser.id, admin.username, admin.username.replace('dept', '')]
       );
    }
  }

  console.log("\n--- CREATING CIVIL FACULTIES ---");
  for (const facName of civilFaculties) {
    const username = facName.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${username}@tpt.edu.in`;
    const password = 'Faculty@123';
    
    let userId;
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existing = usersData.users.find(u => u.email === email);
    
    if (existing) {
      userId = existing.id;
      // Update password just to be sure
      await supabase.auth.admin.updateUserById(userId, { password });
      console.log(`Updated password for existing faculty: ${email}`);
    } else {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });
      
      if (error) {
        console.error(`Error creating auth for ${email}:`, error.message);
        continue;
      }
      userId = created.user.id;
      console.log(`Created auth user for: ${email}`);
    }
    
    // Link to faculty table
    await client.query("UPDATE faculty SET auth_user_id = $1 WHERE username = $2", [userId, username]);
  }

  await client.end();
  console.log("Done!");
}

run();
