import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
const { Client } = pg;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const faculties = [
  'M. Ponni',
  'Dr. R. Lavanya',
  'N. Gokulkannan',
  'S. Ambiga',
  'R. Renuka',
  'G. Vairamani'
];

async function run() {
  await client.connect();
  
  for (const facName of faculties) {
    const username = facName.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${username}@tpt.edu.in`;
    const password = 'Faculty@123';
    
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
       console.error("SignUp Error for", username, error.message);
    } else {
       console.log("Signed up:", username);
    }

    // 2. Fetch the user ID directly from the auth schema
    const authRes = await client.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);
    if (authRes.rows.length === 0) {
      console.error("Could not find auth user for:", email);
      continue;
    }
    const userId = authRes.rows[0].id;

    // 3. Update existing faculty record with auth_user_id
    await client.query(`UPDATE faculty SET auth_user_id = $1 WHERE username = $2`, [userId, username]);
    
    console.log(`Successfully linked ${username} to auth_user_id ${userId}`);
  }
  
  await client.end();
  console.log("Done linking auth!");
}

run();
