import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();
  console.log("=== UPDATING SECTION B YEAR 2 TEACHERS & FEEDBACK IN ME-SS ===");

  const deptRes = await client.query("SELECT id FROM departments WHERE department_code = 'ME-SS'");
  if (deptRes.rows.length === 0) throw new Error("ME-SS department not found");
  const deptId = deptRes.rows[0].id;

  // Subjects Map
  const subsRes = await client.query("SELECT id, course_code, subject_name FROM subjects WHERE department_id = $1", [deptId]);
  const subMap = new Map();
  subsRes.rows.forEach(s => subMap.set(s.course_code, s.id));

  // Faculty Map
  const facsRes = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1", [deptId]);
  const facMap = new Map();
  facsRes.rows.forEach(f => facMap.set(f.faculty_name, f.id));

  const sub_mp = subMap.get('240-023402'); // Manufacturing Process
  const sub_sm = subMap.get('240-023403'); // Strength of Materials
  const sub_wp = subMap.get('240-023404'); // Workshop Practices
  const sub_id = subMap.get('240-023405'); // Industrial Drives and Control
  const sub_pd = subMap.get('240-023406'); // Production Drawing and Modeling
  const sub_mt = subMap.get('240-023407'); // Machine Tool Technology

  const fac_ashok = facMap.get('S. Ashok Saravanan');
  const fac_mani = facMap.get('S. Manikandan');
  const fac_gopal = facMap.get('P. Gopal');
  const fac_kannan = facMap.get('L. Kannan');
  const fac_palani = facMap.get('R. Palanimathi');
  const fac_prakash = facMap.get('S. Prakash');
  const fac_srini = facMap.get('S. Srinivasan');
  const fac_sandhiya = facMap.get('S. R. Sandhiya');

  await client.query("BEGIN");
  try {
    // 1. Fetch Section B Year 2 Student IDs
    const stuRes = await client.query(
      "SELECT id FROM students WHERE department_id = $1 AND year = 2 AND section = 'B'",
      [deptId]
    );
    const stuIds = stuRes.rows.map(s => s.id);
    console.log(`Found ${stuIds.length} Section B Year 2 students.`);

    // 2. CONVERT FEEDBACK RESPONSES ACCORDING TO NEW TEACHER ASSIGNMENTS
    // A) Delete old extra responses for 240-023407 (Machine Tool Tech) where faculty was P. Gopal or S. Manikandan
    const oldExtraRes = await client.query(
      "SELECT id FROM feedback_responses WHERE department_id = $1 AND student_id = ANY($2) AND subject_id = $3 AND faculty_id IN ($4, $5)",
      [deptId, stuIds, sub_mt, fac_gopal, fac_mani]
    );
    const oldExtraIds = oldExtraRes.rows.map(r => r.id);
    console.log(`Found ${oldExtraIds.length} old extra responses to remove for Course 6 (P. Gopal & S. Manikandan).`);

    if (oldExtraIds.length > 0) {
      await client.query("DELETE FROM feedback_answers WHERE response_id = ANY($1)", [oldExtraIds]);
      await client.query("DELETE FROM feedback_responses WHERE id = ANY($1)", [oldExtraIds]);
      console.log(`Successfully removed ${oldExtraIds.length} extra responses & their answers.`);
    }

    // B) Move R. Palanimathi responses from 240-023404 (Workshop Practices) to 240-023405 (Industrial Drives)
    const movePalani = await client.query(
      "UPDATE feedback_responses SET subject_id = $1 WHERE department_id = $2 AND student_id = ANY($3) AND subject_id = $4 AND faculty_id = $5",
      [sub_id, deptId, stuIds, sub_wp, fac_palani]
    );
    console.log(`Moved ${movePalani.rowCount} responses for R. Palanimathi -> 240-023405 Industrial Drives.`);

    // C) Move P. Gopal responses from 240-023405 (Industrial Drives) to 240-023406 (Production Drawing)
    const moveGopal = await client.query(
      "UPDATE feedback_responses SET subject_id = $1 WHERE department_id = $2 AND student_id = ANY($3) AND subject_id = $4 AND faculty_id = $5",
      [sub_pd, deptId, stuIds, sub_id, fac_gopal]
    );
    console.log(`Moved ${moveGopal.rowCount} responses for P. Gopal -> 240-023406 Production Drawing.`);

    // D) Move S. Srinivasan responses from 240-023406 (Production Drawing) to 240-023407 (Machine Tool Tech)
    const moveSrini = await client.query(
      "UPDATE feedback_responses SET subject_id = $1 WHERE department_id = $2 AND student_id = ANY($3) AND subject_id = $4 AND faculty_id = $5",
      [sub_mt, deptId, stuIds, sub_pd, fac_srini]
    );
    console.log(`Moved ${moveSrini.rowCount} responses for S. Srinivasan -> 240-023407 Machine Tool Tech.`);

    // E) Move S. R. Sandhiya responses from 240-023406 (Production Drawing) to 240-023407 (Machine Tool Tech)
    const moveSandhiya = await client.query(
      "UPDATE feedback_responses SET subject_id = $1 WHERE department_id = $2 AND student_id = ANY($3) AND subject_id = $4 AND faculty_id = $5",
      [sub_mt, deptId, stuIds, sub_pd, fac_sandhiya]
    );
    console.log(`Moved ${moveSandhiya.rowCount} responses for S. R. Sandhiya -> 240-023407 Machine Tool Tech.`);

    // 3. UPDATE FACULTY_SUBJECT_ASSIGNMENTS FOR SECTION B YEAR 2
    // Delete old assignments for Section B Year 2
    await client.query(
      "DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 2 AND semester = 3 AND section = 'B'",
      [deptId]
    );
    console.log("Cleared old faculty_subject_assignments for Section B Year 2.");

    // Insert new 11 assignments
    const newAssignments = [
      { subId: sub_mp, facId: fac_ashok, name: 'S. Ashok Saravanan', course: '240-023402' },
      { subId: sub_sm, facId: fac_mani, name: 'S. Manikandan', course: '240-023403' },
      { subId: sub_sm, facId: fac_gopal, name: 'P. Gopal', course: '240-023403' },
      { subId: sub_wp, facId: fac_mani, name: 'S. Manikandan', course: '240-023404' },
      { subId: sub_wp, facId: fac_kannan, name: 'L. Kannan', course: '240-023404' },
      { subId: sub_id, facId: fac_palani, name: 'R. Palanimathi', course: '240-023405' },
      { subId: sub_id, facId: fac_prakash, name: 'S. Prakash', course: '240-023405' },
      { subId: sub_pd, facId: fac_gopal, name: 'P. Gopal', course: '240-023406' },
      { subId: sub_pd, facId: fac_ashok, name: 'S. Ashok Saravanan', course: '240-023406' },
      { subId: sub_mt, facId: fac_srini, name: 'S. Srinivasan', course: '240-023407' },
      { subId: sub_mt, facId: fac_sandhiya, name: 'S. R. Sandhiya', course: '240-023407' }
    ];

    for (const a of newAssignments) {
      await client.query(
        "INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active) VALUES ($1, $2, $3, 2, 3, 'B', true)",
        [deptId, a.facId, a.subId]
      );
      console.log(`[Section B Assigned] ${a.course} -> ${a.name}`);
    }

    // 4. VERIFY INTEGRITY
    const checkResp = await client.query(`
      SELECT s.course_code, s.subject_name, f.faculty_name, count(*) as cnt
      FROM feedback_responses r
      JOIN students stu ON r.student_id = stu.id
      JOIN subjects s ON r.subject_id = s.id
      JOIN faculty f ON r.faculty_id = f.id
      WHERE stu.department_id = $1 AND stu.year = 2 AND stu.section = 'B'
      GROUP BY s.course_code, s.subject_name, f.faculty_name
      ORDER BY s.course_code, f.faculty_name
    `, [deptId]);
    console.log("\nVerified Updated Responses Breakdown for Section B Year 2:");
    console.table(checkResp.rows);

    const checkStudents = await client.query(`
      SELECT r.student_id, count(*) as evals_count
      FROM feedback_responses r
      JOIN students stu ON r.student_id = stu.id
      WHERE stu.department_id = $1 AND stu.year = 2 AND stu.section = 'B'
      GROUP BY r.student_id
    `, [deptId]);
    console.log(`All ${checkStudents.rows.length} submitted students have exactly:`, new Set(checkStudents.rows.map(r => r.evals_count)), "evaluations (Expected: 11).");

    await client.query("COMMIT");
    console.log("\n=== TRANSACTION COMMITTED SUCCESSFULLY ===");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("TRANSACTION ROLLED BACK DUE TO ERROR:", err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
