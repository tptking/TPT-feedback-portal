import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();

    const fsaCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'faculty_subject_assignments'
    `);
    console.log('faculty_subject_assignments columns:', fsaCols.rows.map(r => r.column_name));

    const depts = await client.query(`
      SELECT id, department_name, department_code 
      FROM departments 
      WHERE department_code IN ('CE', 'CSIT')
      ORDER BY department_code
    `);

    for (const dept of depts.rows) {
      console.log(`\n================================================================================`);
      console.log(`DEPARTMENT: ${dept.department_name} (${dept.department_code})`);
      console.log(`================================================================================`);

      const batches = await client.query(
        'SELECT * FROM batches WHERE department_id = $1 ORDER BY start_year DESC',
        [dept.id]
      );

      for (const batch of batches.rows) {
        const studentsRes = await client.query(
          'SELECT id, register_number, student_name, year, semester FROM students WHERE batch_id = $1 ORDER BY register_number',
          [batch.id]
        );
        const totalStudents = studentsRes.rows.length;
        const studentYear = studentsRes.rows[0]?.year || 'Unknown';
        const semester = studentsRes.rows[0]?.semester || '';

        console.log(`\n--------------------------------------------------------------------------------`);
        console.log(`Batch: ${batch.batch_name} (${batch.start_year}-${batch.end_year}) | Year: ${studentYear} | Semester: ${semester}`);
        console.log(`--------------------------------------------------------------------------------`);

        const studentIds = studentsRes.rows.map(s => s.id);

        if (studentIds.length > 0) {
          const resp = await client.query(
            `SELECT count(DISTINCT student_id) as completed_students, count(*) as total_feedback_rows
             FROM feedback_responses
             WHERE student_id = ANY($1::uuid[])`,
            [studentIds]
          );
          const completedCount = Number(resp.rows[0].completed_students);
          const totalResponses = Number(resp.rows[0].total_feedback_rows);
          const pendingCount = totalStudents - completedCount;

          console.log(`Total Students Enrolled : ${totalStudents}`);
          console.log(`Completed Students      : ${completedCount}`);
          console.log(`Pending Students        : ${pendingCount}`);
          console.log(`Total Feedback Rows     : ${totalResponses}`);

          // Also get list of who completed if few
          if (completedCount <= 10 && completedCount > 0) {
            const completedList = await client.query(
              `SELECT DISTINCT s.register_number, s.student_name, count(fr.id) as responses
               FROM feedback_responses fr
               JOIN students s ON s.id = fr.student_id
               WHERE s.id = ANY($1::uuid[])
               GROUP BY s.register_number, s.student_name`,
              [studentIds]
            );
            console.log('Completed Students Details:');
            console.table(completedList.rows);
          }

          // Faculty breakdown
          const facStats = await client.query(
            `SELECT f.faculty_name, s.subject_name, count(fr.id) as response_count
             FROM feedback_responses fr
             JOIN faculty f ON f.id = fr.faculty_id
             JOIN subjects s ON s.id = fr.subject_id
             WHERE fr.student_id = ANY($1::uuid[])
             GROUP BY f.faculty_name, s.subject_name
             ORDER BY f.faculty_name, s.subject_name`,
            [studentIds]
          );

          if (facStats.rows && facStats.rows.length > 0) {
            console.log('\nFaculty Responses Received:');
            console.table(facStats.rows);
          } else {
            console.log('No faculty feedback responses received yet for this batch.');
          }
        } else {
          console.log(`Total Students Enrolled : 0`);
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
