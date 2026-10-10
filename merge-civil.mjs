import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  const newDeptId = '4c44f6a3-65fd-4a3f-89d4-211832dc2021';
  const oldDeptId = '11111111-1111-1111-1111-111111111111';
  
  await client.query('UPDATE batches SET department_id = $1 WHERE department_id = $2', [oldDeptId, newDeptId]);
  await client.query('UPDATE students SET department_id = $1 WHERE department_id = $2', [oldDeptId, newDeptId]);
  await client.query('UPDATE subjects SET department_id = $1 WHERE department_id = $2', [oldDeptId, newDeptId]);
  await client.query('UPDATE faculty SET department_id = $1 WHERE department_id = $2', [oldDeptId, newDeptId]);
  await client.query('UPDATE faculty_subject_assignments SET department_id = $1 WHERE department_id = $2', [oldDeptId, newDeptId]);
  await client.query('UPDATE feedback_cycles SET department_id = $1 WHERE department_id = $2', [oldDeptId, newDeptId]);
  
  await client.query('DELETE FROM departments WHERE id = $1', [newDeptId]);
  console.log('Successfully merged departments');
  await client.end();
}

run();
