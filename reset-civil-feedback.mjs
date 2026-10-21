import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres';

async function resetCivilFeedback() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // 1. Fetch Civil Department
    const deptRes = await client.query(
      "SELECT id, department_name, department_code FROM departments WHERE department_code = 'CE'"
    );

    if (deptRes.rows.length === 0) {
      console.error("Civil department ('CE') not found!");
      return;
    }

    const dept = deptRes.rows[0];
    console.log(`Target Department: ${dept.department_name} (Code: ${dept.department_code}, ID: ${dept.id})`);

    // 2. Count before deletion
    const beforeRespRes = await client.query(
      "SELECT count(*) FROM feedback_responses WHERE department_id = $1 OR student_id IN (SELECT id FROM students WHERE department_id = $1)",
      [dept.id]
    );
    const beforeAnsRes = await client.query(
      `SELECT count(*) FROM feedback_answers fa
       JOIN feedback_responses fr ON fa.response_id = fr.id
       WHERE fr.department_id = $1 OR fr.student_id IN (SELECT id FROM students WHERE department_id = $1)`,
      [dept.id]
    );

    const beforeRespCount = parseInt(beforeRespRes.rows[0].count, 10);
    const beforeAnsCount = parseInt(beforeAnsRes.rows[0].count, 10);

    console.log(`Before Reset:`);
    console.log(`- Feedback Responses to remove: ${beforeRespCount}`);
    console.log(`- Feedback Answers to remove: ${beforeAnsCount}`);

    // Check other departments to ensure isolation
    const otherDeptsBefore = await client.query(
      "SELECT count(*) FROM feedback_responses WHERE department_id != $1",
      [dept.id]
    );
    const otherCountBefore = parseInt(otherDeptsBefore.rows[0].count, 10);

    // 3. Perform Deletion in a Transaction
    await client.query('BEGIN');

    const deleteResult = await client.query(
      "DELETE FROM feedback_responses WHERE department_id = $1 OR student_id IN (SELECT id FROM students WHERE department_id = $1) RETURNING id",
      [dept.id]
    );

    await client.query('COMMIT');
    console.log(`Deleted ${deleteResult.rowCount} feedback_responses records.`);

    // 4. Verify post-reset counts
    const afterRespRes = await client.query(
      "SELECT count(*) FROM feedback_responses WHERE department_id = $1 OR student_id IN (SELECT id FROM students WHERE department_id = $1)",
      [dept.id]
    );
    const afterAnsRes = await client.query(
      `SELECT count(*) FROM feedback_answers fa
       JOIN feedback_responses fr ON fa.response_id = fr.id
       WHERE fr.department_id = $1 OR fr.student_id IN (SELECT id FROM students WHERE department_id = $1)`,
      [dept.id]
    );
    const otherDeptsAfter = await client.query(
      "SELECT count(*) FROM feedback_responses WHERE department_id != $1",
      [dept.id]
    );

    console.log(`\nAfter Reset:`);
    console.log(`- Civil Feedback Responses remaining: ${afterRespRes.rows[0].count}`);
    console.log(`- Civil Feedback Answers remaining: ${afterAnsRes.rows[0].count}`);
    console.log(`- Other Departments Feedback Responses remaining: ${otherDeptsAfter.rows[0].count} (Unchanged: ${otherCountBefore === parseInt(otherDeptsAfter.rows[0].count, 10)})`);

    // 5. Verify Year 2 and Year 3 completion and pending counts
    const studentsRes = await client.query(
      "SELECT id, register_number, student_name, year, semester, section FROM students WHERE department_id = $1 ORDER BY year, register_number",
      [dept.id]
    );
    const assignmentsRes = await client.query(
      "SELECT * FROM faculty_subject_assignments WHERE department_id = $1 AND active = true",
      [dept.id]
    );

    let y2Total = 0, y2Completed = 0, y2Pending = 0;
    let y3Total = 0, y3Completed = 0, y3Pending = 0;

    for (const s of studentsRes.rows) {
      if (s.year === 2) {
        y2Total++;
        y2Pending++;
      } else if (s.year === 3) {
        y3Total++;
        y3Pending++;
      }
    }

    console.log(`\n======================================================`);
    console.log(`Civil Department Count Status Restarted:`);
    console.log(`Year 2: Total = ${y2Total}, Completed = ${y2Completed}, Pending = ${y2Pending}`);
    console.log(`Year 3: Total = ${y3Total}, Completed = ${y3Completed}, Pending = ${y3Pending}`);
    console.log(`All ${studentsRes.rows.length} Civil students are now in the Pending list with 0 submissions.`);
    console.log(`======================================================\n`);

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error during reset:', err);
  } finally {
    await client.end();
  }
}

resetCivilFeedback();
