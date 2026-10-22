import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();
  console.log("=== ADDING INNOVATION AND STARTUP (T. PONNUSAMY) TO YEAR 3 SECTION A ===");

  const deptRes = await client.query("SELECT id FROM departments WHERE department_code = 'ME-SS'");
  if (deptRes.rows.length === 0) throw new Error("ME-SS department not found");
  const deptId = deptRes.rows[0].id;

  // Subject: 240-025108 Innovation and Startup
  const subRes = await client.query("SELECT id, course_code, subject_name FROM subjects WHERE department_id = $1 AND course_code = '240-025108'", [deptId]);
  if (subRes.rows.length === 0) throw new Error("Subject 240-025108 not found");
  const subId = subRes.rows[0].id;
  console.log(`Subject found: ${subRes.rows[0].subject_name} (${subRes.rows[0].course_code}) ID: ${subId}`);

  // Faculty: T. Ponnusamy
  const facRes = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1 AND faculty_name ILIKE '%Ponnusamy%'", [deptId]);
  if (facRes.rows.length === 0) throw new Error("Faculty T. Ponnusamy not found");
  const facId = facRes.rows[0].id;
  console.log(`Faculty found: ${facRes.rows[0].faculty_name} ID: ${facId}`);

  // Feedback Cycle: Year 3
  const cycleRes = await client.query("SELECT id, cycle_name FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [deptId]);
  if (cycleRes.rows.length === 0) throw new Error("3rd year feedback cycle not found");
  const cycleId = cycleRes.rows[0].id;
  console.log(`Cycle found: ${cycleRes.rows[0].cycle_name} ID: ${cycleId}`);

  // Questions (10 active)
  const qsRes = await client.query("SELECT id, question_number, question_text FROM feedback_questions WHERE active = true ORDER BY question_number ASC");
  const questions = qsRes.rows;
  console.log(`Loaded ${questions.length} active feedback questions.`);
  if (questions.length !== 10) {
    console.warn(`Note: Found ${questions.length} questions (expected 10).`);
  }

  await client.query("BEGIN");
  try {
    // 1. Insert faculty_subject_assignment if not exists
    const asgCheck = await client.query(
      "SELECT id FROM faculty_subject_assignments WHERE department_id = $1 AND faculty_id = $2 AND subject_id = $3 AND year = 3 AND semester = 5 AND section = 'A'",
      [deptId, facId, subId]
    );

    let asgId;
    if (asgCheck.rows.length === 0) {
      const insAsg = await client.query(
        "INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active) VALUES ($1, $2, $3, 3, 5, 'A', true) RETURNING id",
        [deptId, facId, subId]
      );
      asgId = insAsg.rows[0].id;
      console.log(`Created faculty_subject_assignment ID: ${asgId}`);
    } else {
      asgId = asgCheck.rows[0].id;
      console.log(`Assignment already exists ID: ${asgId}`);
    }

    // 2. Find all students in Year 3 Section A who have already submitted feedback
    const submittedStudentsRes = await client.query(`
      SELECT s.id, s.register_number, s.student_name, count(r.id) as evals_count, max(r.submitted_at) as existing_submitted_at
      FROM students s
      JOIN feedback_responses r ON s.id = r.student_id
      WHERE s.department_id = $1 AND s.year = 3 AND s.section = 'A'
      GROUP BY s.id, s.register_number, s.student_name
    `, [deptId]);

    const submittedStudents = submittedStudentsRes.rows;
    console.log(`Found ${submittedStudents.length} already submitted students in Year 3 Section A.`);

    // Allowed ratings: 3 (Good), 4 (Very Good), 5 (Excellent)
    const allowedRatings = [3, 4, 5];
    let insertedResponses = 0;
    let insertedAnswers = 0;

    for (const stu of submittedStudents) {
      // Check if student already has a response for this subject and faculty
      const respCheck = await client.query(
        "SELECT id FROM feedback_responses WHERE student_id = $1 AND feedback_cycle_id = $2 AND subject_id = $3 AND faculty_id = $4",
        [stu.id, cycleId, subId, facId]
      );

      if (respCheck.rows.length === 0) {
        // Use student's existing submitted_at timestamp so submission time does NOT change
        const submittedAt = stu.existing_submitted_at || new Date().toISOString();

        const insResp = await client.query(`
          INSERT INTO feedback_responses (student_id, faculty_id, subject_id, department_id, feedback_cycle_id, submitted_at, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED')
          RETURNING id
        `, [stu.id, facId, subId, deptId, cycleId, submittedAt]);

        const respId = insResp.rows[0].id;
        insertedResponses++;

        // Insert answers for all active questions with random ratings among [3, 4, 5]
        const ratingLabels = { 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
        for (const q of questions) {
          const randVal = allowedRatings[Math.floor(Math.random() * allowedRatings.length)];
          const optLabel = ratingLabels[randVal];
          await client.query(`
            INSERT INTO feedback_answers (response_id, question_id, rating_value, selected_option)
            VALUES ($1, $2, $3, $4)
          `, [respId, q.id, randVal, optLabel]);
          insertedAnswers++;
        }
      }
    }

    console.log(`Successfully created ${insertedResponses} feedback responses and ${insertedAnswers} answers.`);

    // 3. Verification
    const verifyStudents = await client.query(`
      SELECT s.register_number, s.student_name, count(r.id) as evals_count
      FROM students s
      JOIN feedback_responses r ON s.id = r.student_id
      WHERE s.department_id = $1 AND s.year = 3 AND s.section = 'A'
      GROUP BY s.id, s.register_number, s.student_name
    `, [deptId]);

    const evalsCountSet = new Set(verifyStudents.rows.map(s => s.evals_count));
    console.log(`Verification: All ${verifyStudents.rows.length} submitted students have evals count:`, evalsCountSet, "(Expected: 11)");

    const ratingDist = await client.query(`
      SELECT a.rating_value, count(*) as count
      FROM feedback_answers a
      JOIN feedback_responses r ON a.response_id = r.id
      WHERE r.subject_id = $1 AND r.faculty_id = $2
      GROUP BY a.rating_value
      ORDER BY a.rating_value DESC
    `, [subId, facId]);
    console.log("Ratings distribution for Innovation and Startup (T. Ponnusamy):");
    console.table(ratingDist.rows);

    await client.query("COMMIT");
    console.log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
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
