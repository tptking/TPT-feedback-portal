import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
const { Client } = pg;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const csitFaculties = [
  { name: 'B. Boobeshwari', username: 'bboobeshwari', pass: 'Faculty@123' },
  { name: 'S. Gowri Shankari', username: 'sgowrishankari', pass: 'Faculty@123' }
];

async function run() {
  await client.connect();
  
  for (const fac of csitFaculties) {
    const email = `${fac.username}@tpt.edu.in`;
    
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: fac.pass
    });

    if (error) {
       console.error("SignUp Error for", fac.username, error.message);
    }

    // 2. Fetch the user ID directly from the auth schema
    const authRes = await client.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);
    if (authRes.rows.length === 0) {
      console.error("Could not find auth user for:", email);
      continue;
    }
    const userId = authRes.rows[0].id;

    // 3. Update existing faculty record with auth_user_id
    await client.query(`UPDATE faculty SET auth_user_id = $1 WHERE username = $2`, [userId, fac.username]);
    
    console.log(`Successfully linked ${fac.username} to auth_user_id ${userId}`);
  }
  
  await client.end();
  console.log("Done linking auth!");
}

run();
