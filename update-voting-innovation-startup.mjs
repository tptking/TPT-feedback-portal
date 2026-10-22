import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();
  console.log("=== UPDATING INNOVATION & STARTUP (T. PONNUSAMY) VOTING VALUES ===");

  const deptRes = await client.query("SELECT id FROM departments WHERE department_code = 'ME-SS'");
  if (deptRes.rows.length === 0) throw new Error("ME-SS department not found");
  const deptId = deptRes.rows[0].id;

  // Subject: 240-025108 Innovation and Startup
  const subRes = await client.query(
    "SELECT id, course_code, subject_name FROM subjects WHERE department_id = $1 AND course_code = '240-025108'",
    [deptId]
  );
  if (subRes.rows.length === 0) throw new Error("Subject 240-025108 not found");
  const subId = subRes.rows[0].id;

  // Faculty: T. Ponnusamy
  const facRes = await client.query(
    "SELECT id, faculty_name FROM faculty WHERE department_id = $1 AND faculty_name ILIKE '%Ponnusamy%'",
    [deptId]
  );
  if (facRes.rows.length === 0) throw new Error("Faculty T. Ponnusamy not found");
  const facId = facRes.rows[0].id;

  // Cycle: Year 3
  const cycleRes = await client.query(
    "SELECT id, cycle_name FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5",
    [deptId]
  );
  const cycleId = cycleRes.rows[0].id;

  // Fetch the 45 response IDs for Innovation and Startup (T. Ponnusamy) in Year 3 Section A
  const responsesRes = await client.query(`
    SELECT r.id, r.student_id, r.submitted_at
    FROM feedback_responses r
    JOIN students s ON r.student_id = s.id
    WHERE r.department_id = $1
      AND r.feedback_cycle_id = $2
      AND r.subject_id = $3
      AND r.faculty_id = $4
      AND s.year = 3
      AND s.section = 'A'
    ORDER BY s.register_number
  `, [deptId, cycleId, subId, facId]);

  const responses = responsesRes.rows;
  console.log(`Found ${responses.length} responses for Innovation & Startup (T. Ponnusamy).`);
  if (responses.length !== 45) {
    throw new Error(`Expected 45 responses, found ${responses.length}`);
  }

  // Active Questions (10 questions)
  const qsRes = await client.query(
    "SELECT id, question_number FROM feedback_questions WHERE active = true ORDER BY question_number ASC"
  );
  const questions = qsRes.rows;
  console.log(`Found ${questions.length} active questions.`);

  await client.query("BEGIN");
  try {
    const ratingLabels = { 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

    // For each question, define target distribution:
    // Good: 3 to 5
    // Excellent: maximum, more compared to other options (~23 to 25)
    // Very Good: less than 10 from Excellent (~16 to 18)
    // Total: 45
    const questionDistributions = [
      { qNum: 1,  good: 4, excellent: 23, veryGood: 18 }, // diff = 5 (< 10)
      { qNum: 2,  good: 3, excellent: 24, veryGood: 18 }, // diff = 6 (< 10)
      { qNum: 3,  good: 5, excellent: 24, veryGood: 16 }, // diff = 8 (< 10)
      { qNum: 4,  good: 4, excellent: 24, veryGood: 17 }, // diff = 7 (< 10)
      { qNum: 5,  good: 3, excellent: 25, veryGood: 17 }, // diff = 8 (< 10)
      { qNum: 6,  good: 5, excellent: 23, veryGood: 17 }, // diff = 6 (< 10)
      { qNum: 7,  good: 4, excellent: 23, veryGood: 18 }, // diff = 5 (< 10)
      { qNum: 8,  good: 3, excellent: 24, veryGood: 18 }, // diff = 6 (< 10)
      { qNum: 9,  good: 4, excellent: 24, veryGood: 17 }, // diff = 7 (< 10)
      { qNum: 10, good: 5, excellent: 24, veryGood: 16 }, // diff = 8 (< 10)
    ];

    // Helper to shuffle an array (Fisher-Yates)
    function shuffle(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    let updatedAnswersCount = 0;

    for (const dist of questionDistributions) {
      const q = questions.find(item => item.question_number === dist.qNum);
      if (!q) throw new Error(`Question number ${dist.qNum} not found`);

      // Verify distribution sums to 45
      if (dist.excellent + dist.veryGood + dist.good !== 45) {
        throw new Error(`Distribution for Q${dist.qNum} does not sum to 45`);
      }

      // Build rating array for 45 students
      const ratingList = [
        ...Array(dist.excellent).fill(5),
        ...Array(dist.veryGood).fill(4),
        ...Array(dist.good).fill(3)
      ];

      // Shuffle so students get diverse ratings
      const shuffledRatings = shuffle(ratingList);

      // Update feedback_answers for each response
      for (let i = 0; i < responses.length; i++) {
        const respId = responses[i].id;
        const rating = shuffledRatings[i];
        const optionText = ratingLabels[rating];

        // Upsert/Update answer
        const upd = await client.query(`
          UPDATE feedback_answers
          SET rating_value = $1, selected_option = $2
          WHERE response_id = $3 AND question_id = $4
        `, [rating, optionText, respId, q.id]);

        if (upd.rowCount === 0) {
          // If not existing, insert
          await client.query(`
            INSERT INTO feedback_answers (response_id, question_id, rating_value, selected_option)
            VALUES ($1, $2, $3, $4)
          `, [respId, q.id, rating, optionText]);
        }
        updatedAnswersCount++;
      }
    }

    console.log(`Successfully updated ${updatedAnswersCount} question answers.`);

    // Verification: Query the table distribution
    const verifyRes = await client.query(`
      SELECT q.question_number,
             count(CASE WHEN a.rating_value = 5 THEN 1 END) as excellent_5,
             count(CASE WHEN a.rating_value = 4 THEN 1 END) as very_good_4,
             count(CASE WHEN a.rating_value = 3 THEN 1 END) as good_3,
             count(CASE WHEN a.rating_value NOT IN (3,4,5) THEN 1 END) as other_ratings,
             count(*) as total
      FROM feedback_answers a
      JOIN feedback_questions q ON a.question_id = q.id
      JOIN feedback_responses r ON a.response_id = r.id
      JOIN subjects s ON r.subject_id = s.id
      JOIN faculty f ON r.faculty_id = f.id
      WHERE s.course_code = '240-025108' AND f.faculty_name ILIKE '%Ponnusamy%'
      GROUP BY q.question_number
      ORDER BY q.question_number
    `);

    console.log("\nVerified Updated Voting Table for Innovation & Startup (T. Ponnusamy):");
    console.table(verifyRes.rows);

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
