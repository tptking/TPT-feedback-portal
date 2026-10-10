import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT email, id FROM auth.users WHERE email LIKE '%@tpt.edu.in'");
  console.log(res.rows);
  const facs = await client.query("SELECT faculty_name, auth_user_id FROM faculty");
  console.log("Faculties:", facs.rows);
  await client.end();
}
run();
