import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const client = new pg.Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();
  const aidedDeptId = '22222222-2222-2222-2222-222222222222';
  const individualUsernames = ['akannan', 'bselvakumar', 'akanakaraj', 'cprabhu', 'sharisabarish', 'gmaniraj', 'pganapathi'];

  console.log("=== REMOVING INDIVIDUAL FACULTY AUTH USERS ===");
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  for (const u of individualUsernames) {
    const email = `${u}@tpt.edu.in`;
    const authUser = usersData?.users?.find(x => x.email === email);
    if (authUser) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(authUser.id);
      if (delErr) {
        console.error(`Error deleting auth user ${email}:`, delErr.message);
      } else {
        console.log(`Successfully deleted auth user ${email} (${authUser.id})`);
      }
    }

    // Set auth_user_id = NULL in faculty table
    await client.query(
      "UPDATE faculty SET auth_user_id = NULL WHERE department_id = $1 AND username = $2",
      [aidedDeptId, u]
    );
    console.log(`Cleared auth_user_id for ${u} in faculty table`);
  }

  // Ensure department login exists and has the correct password
  const adminEmail = 'mechaided@tpt.edu.in';
  let adminAuth = usersData?.users?.find(x => x.email === adminEmail);
  if (!adminAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'MechAided@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating admin auth:", error.message);
    else adminAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(adminAuth.id, { password: 'MechAided@2026' });
  }

  // Link faculty admin record to mechaided auth user
  if (adminAuth) {
    await client.query(
      "UPDATE faculty SET auth_user_id = $1 WHERE department_id = $2 AND username = 'mechaided'",
      [adminAuth.id, aidedDeptId]
    );
  }

  console.log("\n=== VERIFYING MECHANICAL (AIDED) FACULTY TABLE STATE ===");
  const facultyRes = await client.query(`
    SELECT f.id, f.faculty_name, f.username, f.auth_user_id, u.email as auth_email
    FROM faculty f
    LEFT JOIN auth.users u ON f.auth_user_id = u.id
    WHERE f.department_id = $1
    ORDER BY f.faculty_name
  `, [aidedDeptId]);
  console.table(facultyRes.rows);

  await client.end();
  console.log("=== COMPLETED: ONLY mechaided HAS LOGIN ACCESS ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
