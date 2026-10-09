import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  
  // Find subject ID for System Administration
  const subjRes = await client.query("SELECT id FROM subjects WHERE course_code = '240-165414'");
  const subjId = subjRes.rows[0].id;
  
  // Find responses for this subject
  const respRes = await client.query("SELECT id, student_id FROM feedback_responses WHERE subject_id = $1", [subjId]);
  console.log("Total responses for SA:", respRes.rows.length);
  
  // For each response, count answers
  for (const row of respRes.rows) {
    const ansRes = await client.query("SELECT count(*) FROM feedback_answers WHERE response_id = $1", [row.id]);
    console.log(`Response ${row.id} for student ${row.student_id} has ${ansRes.rows[0].count} answers`);
  }
  
  await client.end();
}
run();
