import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    
    // Get Department
    const deptRes = await client.query(`SELECT id FROM departments WHERE department_name ILIKE '%Computer Engineering%'`);
    const deptId = deptRes.rows[0].id;

    // Get Subject ID for Computer Hardware and Networking
    const subRes = await client.query(`SELECT id FROM subjects WHERE subject_name = 'Computer Hardware and Networking' AND year = 3 AND department_id = $1`, [deptId]);
    if (subRes.rows.length === 0) throw new Error('Subject not found');
    const subId = subRes.rows[0].id;

    // Get Faculty ID for Sangeetha
    const facRes = await client.query(`SELECT id FROM faculty WHERE faculty_name ILIKE '%Sangeetha%' AND department_id = $1`, [deptId]);
    const facId = facRes.rows[0].id;

    // Delete Sangeetha from Computer Hardware and Networking
    const delRes = await client.query(`
      DELETE FROM faculty_subject_assignments 
      WHERE subject_id = $1 AND faculty_id = $2
    `, [subId, facId]);

    console.log(`Deleted Sangeetha from Computer Hardware and Networking. Rows affected: ${delRes.rowCount}`);

    // Let's also make sure Sree Murugan is called "Mr. U.K. Sree Murugan"
    await client.query(`
      UPDATE faculty 
      SET faculty_name = 'Mr. U.K. Sree Murugan' 
      WHERE faculty_name ILIKE '%Sree Murugan%'
    `);
    
    console.log("Updated Sree Murugan's name to Mr.");
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
