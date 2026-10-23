import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const coId = '66666666-6666-6666-6666-666666666666';

const year2_courses = [
  { code: '240-073402', name: 'Digital Logic Design', facs: ['Sangeetha'] },
  { code: '240-073403', name: 'Data Structures Using C', facs: ['RajaRajeswari'] },
  { code: '240-073404', name: 'Digital Logic Design Lab', facs: ['Sangeetha'] },
  { code: '240-073405', name: 'C Programming', facs: ['RajaRajeswari', 'Saranya'] },
  { code: '240-073406', name: 'Web Designing', facs: ['RajaRajeswari', 'Saranya'] },
  { code: '240-073407', name: 'Operating Systems', facs: ['Nandha'] }
];

const year2_students_raw = `
A2507008	Ashiq J
A2507010	Aswanth S
A2507011	Balaji P
A2507012	Bawashvinayak R
A2507013	Bharanisree R
A2507014	Deepan M
A2507015	Dharun S
A2507016	Disunkanthan M R
A2507017	Fazil B
A2507018	Fazileth Rizaa A
A2507019	Gowtham R
A2507021	Harish D
A2507022	Jalanthar A
A2507023	Jeevika G
A2507024	Jishnu M
A2507025	Kaarthik L S
A2507026	Karthikeyan N G
A2507027	Kavin Sabapathi A
A2507028	Khesav Jeyar Damodaran
A2507029	Kiran P
A2507030	Logesh B T
A2507031	Madhana Shri R
A2507032	Mogana Bharathi K
A2507033	Mohammed Hafeez
A2507034	Mohana Siva Prasad R
A2507035	Mouli S
A2507036	Nethra R
A2507037	Nithish S
A2507038	Nivaskumaran V
A2507039	Parameswaran M
A2507040	Poorvika S
A2507041	Pranav Kumar L
A2507042	Pugaleshwari P P
A2507043	Rajpandian B
A2507044	Ranjith I
A2507045	Rijay Rithick S
A2507046	Rohit S J
A2507047	Sabarees S P
A2507049	Sachin Prasath S
A2507050	Sakthi V
A2507051	Sanjai Karthik J P
A2507052	Sanjay D
A2507053	Sarathy G
A2507054	Saravanan K
A2507055	Shamprasanth V I
A2507056	Sharni S
A2507057	Shnjeev K N
A2507058	Sidesh A
A2507059	Sivaprakash N S
A2507060	Sivaprakash S
A2507061	Srinivaas A
A2507062	Tarun K M
A2507063	Tharun U
A2507064	Trijaal Adhitya P
A2507065	Varshan S D
A2507066	Vignesh Kumar S
A2507067	Yaashidha I
C2607001	Ashokkumar S
C2607002	Gowthaman K
C2607003	Janarthanababu S
C2607004	Kanika R
C2607005	Karan Kumar
C2607006	Nithishkumaran V
C2607007	Sriobuliraja S
C2607008	Thangadurai J
`;

function parseStudents(raw) {
  const lines = raw.trim().split('\n');
  const res = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/[\t\s]{2,}|\t/);
    if (parts.length >= 2) {
      const regNo = parts[0].trim();
      const name = parts.slice(1).join(' ').trim();
      res.push({ regNo, name });
    } else {
      const match = trimmed.match(/^([A-Z0-9]+)\s+(.+)$/);
      if (match) {
        res.push({ regNo: match[1].trim(), name: match[2].trim() });
      }
    }
  }
  return res;
}

async function main() {
  await client.connect();
  console.log("=== STARTING COMPUTER ENGINEERING SECOND YEAR SETUP ===");

  // 1. Department
  const deptRes = await client.query("SELECT id, department_name, department_code FROM departments WHERE id = $1", [coId]);
  if (deptRes.rows.length === 0) throw new Error("Computer Engineering department not found");
  console.log(`Department: ${deptRes.rows[0].department_name} (${deptRes.rows[0].department_code})`);

  // 2. Feedback Cycle for Year 2
  let cycleYear2Id;
  const cycleRes = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3",
    [coId]
  );
  if (cycleRes.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Computer Engineering Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW())
      RETURNING id
    `, [coId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for Computer Engineering:", cycleYear2Id);
  } else {
    cycleYear2Id = cycleRes.rows[0].id;
    console.log("Existing Year 2 feedback cycle for Computer Engineering:", cycleYear2Id);
  }

  // 3. Batches for Year 2
  let batchId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  const bCheck = await client.query("SELECT id FROM batches WHERE department_id = $1 AND id = $2", [coId, batchId]);
  if (bCheck.rows.length === 0) {
    const b2 = await client.query("SELECT id FROM batches WHERE department_id = $1 LIMIT 1", [coId]);
    batchId = b2.rows[0].id;
  }
  console.log("Using batch ID for Year 2 students:", batchId);

  // 4. Subjects for Year 2
  const subMap = new Map(); // code -> id
  for (const c of year2_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 2",
      [coId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active) VALUES ($1, $2, $3, 2, 3, true) RETURNING id",
        [c.code, c.name, coId]
      );
      subId = ins.rows[0].id;
      console.log(`Created subject ${c.code} - ${c.name}: ${subId}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(
        "UPDATE subjects SET subject_name = $1, semester = 3, active = true WHERE id = $2",
        [c.name, subId]
      );
      console.log(`Verified subject ${c.code} - ${c.name}: ${subId}`);
    }
    subMap.set(c.code, subId);
  }

  // 5. Faculty for Year 2
  const facRows = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1", [coId]);
  console.log(`Found ${facRows.rows.length} faculty in Computer Engineering.`);

  function findFacId(keyword) {
    const found = facRows.rows.find(f => f.faculty_name.toLowerCase().includes(keyword.toLowerCase()));
    if (!found) throw new Error(`Faculty matching '${keyword}' not found in CO department`);
    return found.id;
  }

  // 6. Faculty Subject Assignments for Year 2
  console.log("\nUpdating Faculty Subject Assignments for Year 2...");
  await client.query("BEGIN");

  try {
    // Delete any old Year 2 assignments for CO (we verified earlier there are 0 responses for Year 2)
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 2", [coId]);

    let asgCount = 0;
    for (const c of year2_courses) {
      const subId = subMap.get(c.code);
      for (const facKey of c.facs) {
        const facId = findFacId(facKey);
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 2, 3, 'A', true)
        `, [coId, facId, subId]);
        asgCount++;
        console.log(`Assigned Year 2: ${c.code} (${c.name}) -> Faculty keyword '${facKey}'`);
      }
    }
    console.log(`Successfully created ${asgCount} Year 2 course assignments.`);

    // 7. Upsert 65 Students
    const students = parseStudents(year2_students_raw);
    console.log(`\nUpserting ${students.length} Year 2 students for Computer Engineering...`);

    let stuCount = 0;
    for (const s of students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, coId, batchId]);
      stuCount++;
    }
    console.log(`Successfully upserted ${stuCount} Year 2 students.`);

    await client.query("COMMIT");
    console.log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("TRANSACTION ROLLED BACK DUE TO ERROR:", err);
    throw err;
  }

  // 8. Verification queries
  console.log("\n=== FINAL VERIFICATION FOR COMPUTER ENGINEERING YEAR 2 ===");
  const asgVerify = await client.query(`
    SELECT fsa.id, s.course_code, s.subject_name, f.faculty_name, fsa.year, fsa.semester, fsa.section, fsa.active
    FROM faculty_subject_assignments fsa
    JOIN subjects s ON fsa.subject_id = s.id
    JOIN faculty f ON fsa.faculty_id = f.id
    WHERE fsa.department_id = $1 AND fsa.year = 2
    ORDER BY s.course_code, f.faculty_name
  `, [coId]);
  console.log("Year 2 Assignments:");
  console.table(asgVerify.rows);

  const stuVerify = await client.query(`
    SELECT year, semester, section, count(*) as student_count
    FROM students
    WHERE department_id = $1 AND year = 2
    GROUP BY year, semester, section
  `, [coId]);
  console.log("Year 2 Students Count:");
  console.table(stuVerify.rows);

  const year3Untouched = await client.query(`
    SELECT count(DISTINCT r.student_id) as year3_completed_students, count(r.id) as year3_total_responses
    FROM feedback_responses r
    JOIN students s ON r.student_id = s.id
    WHERE r.department_id = $1 AND s.year = 3
  `, [coId]);
  console.log("Year 3 Status (Completely untouched):");
  console.table(year3Untouched.rows);

  await client.end();
  console.log("=== SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
