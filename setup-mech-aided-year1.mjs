import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIxMjY4OCwiZXhwIjoyMTA2Nzg4Njg4fQ.4ioS8YmAxIMpe9N0LqzpvJrJXmPd2tpm7QGUnuPwdFM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const client = new pg.Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const mechAidedDeptId = '22222222-2222-2222-2222-222222222222';

// ==================== YEAR 1 COURSES ====================
const year1_courses = [
  {
    code: '240-001101',
    name: 'Tamil Marabu (Tamil)',
    facs: ['Ms. S. Sudha', 'Ms. K. Abinaya']
  },
  {
    code: '240-001201',
    name: 'Engineering Mathematics (Engg Maths)',
    facs: ['Mr. I. Nagarajan']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Engg Phy)',
    facs: ['Ms. N. Vidhya', 'Ms. B. Yokeshwari']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Engg Che)',
    facs: ['Ms. C. Sudha', 'Ms. G. Latha']
  },
  {
    code: '240-001102',
    name: 'Communicative English I (English-I)',
    facs: ['Ms. K. Abinaya', 'Dr. A. Gandhimathi']
  },
  {
    code: '240-001301',
    name: 'Basic Workshop Practical (BWP)',
    facs: ['Dr. B. Selvakumar', 'Mr. P. Elumalai']
  },
  {
    code: '240-001302',
    name: 'Digital Workplace Skills (DWS)',
    facs: ['Ms. J. Deetchananjali', 'Dr. C. Prabu']
  }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. S. Sudha', username: 'ssudha' },
  { name: 'Ms. K. Abinaya', username: 'kabinaya' },
  { name: 'Mr. I. Nagarajan', username: 'inagarajan' },
  { name: 'Ms. N. Vidhya', username: 'nvidhya' },
  { name: 'Ms. B. Yokeshwari', username: 'byokeshwari' },
  { name: 'Ms. C. Sudha', username: 'csudha' },
  { name: 'Ms. G. Latha', username: 'glatha' },
  { name: 'Dr. A. Gandhimathi', username: 'agandhimathi' },
  { name: 'Dr. B. Selvakumar', username: 'bselvakumar' },
  { name: 'Mr. P. Elumalai', username: 'pelumalai' },
  { name: 'Ms. J. Deetchananjali', username: 'jdeetchananjali' },
  { name: 'Dr. C. Prabu', username: 'cprabu' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2602008	ARAVINDHAR M K
A2602009	ARVIND UDAGI S
A2602010	BHARATH S
A2602011	BHARATH K
A2602012	DEV PRASATH V
A2602013	DHANUSHKUMAR N
A2602014	DHARANEESWA G
A2602015	DHARSHAN R
A2602016	ENIYALMOZHI V
A2602017	ENIYAS S
A2602018	ENIYAVAN A
A2602019	GOPINATH B
A2602020	GURUPRASATH K S
A2602021	HARENDER S
A2602022	HARISH A
A2602023	JASVANTH R
A2602024	JEEVARAJAN R
A2602025	JEEVITHA R
A2602026	KAILASH S
A2602027	KAMALESH B
A2602028	KAMALESH V S
A2602029	KANISHKARAN C V
A2602030	KEERTHIVASAN A
A2602031	LOKESH R
A2602032	MAHAARJUN B
A2602033	MEKALA S
A2602034	MOHAMMED AASHIQUE J
A2602035	MUHAMMED REHAN R
A2602036	NARAYANA DAS D
A2602037	NAVEEN V
A2602038	NITHESH S J
A2602039	NITHISH KUMAR R
A2602040	PAVITHRAN R S
A2602041	PRAGADESH P.K
A2602042	PRAGALATHAN K
A2602043	PRAGATHISH S
A2602044	PRAJEESH VIGNESH VASARAM
A2602045	PRANAVVARSHAN R.S
A2602046	PRAVEEN T
A2602047	PREMKUMAR V
A2602048	PRIYA DHARSAN C
A2602049	RASHMI K
A2602050	RISHI B
A2602051	SANJEEV J
A2602052	SANTHOSH S
A2602053	SANTHOSSH VELAN S
A2602054	SHARVIN T
A2602055	SHIVESH SUBRAMANEYAM S S
A2602056	SOWBARANI G
A2602057	SRIHARI PRASATH S
A2602058	THIRISHIK M
A2602059	TRUNESH S
A2602060	UDAYASURYA P S
A2602061	VARUN M.S
A2602062	VENKATKISHORE S
A2602063	VISHNU N A
A2602064	VISHNUKARTHIK B
A2602065	YUVARAJ N
`;

function parseStudents(raw, section = 'A') {
  const lines = raw.trim().split('\n');
  const res = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\t|\s{2,}/);
    if (parts.length >= 2) {
      const regNo = parts[0].trim();
      const name = parts.slice(1).join(' ').trim();
      res.push({ regNo, name, section });
    }
  }
  return res;
}

async function main() {
  await client.connect();
  console.log("==================================================================");
  console.log("=== STARTING MECHANICAL ENGINEERING (AIDED) YEAR 1 SETUP ===");
  console.log("==================================================================");

  // 1. Verify Mechanical Aided Department
  const dept = await client.query("SELECT * FROM departments WHERE id = $1", [mechAidedDeptId]);
  if (dept.rows.length === 0) {
    throw new Error(`Mechanical Aided Department with ID ${mechAidedDeptId} not found!`);
  }
  console.log("Verified department:", dept.rows[0].department_name, `(${dept.rows[0].department_code})`);

  // 2. Batch: 2024-2027 (Year 1)
  let batch2024Id;
  const b24 = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND start_year = 2024",
    [mechAidedDeptId]
  );
  if (b24.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [mechAidedDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for Mechanical (Aided):", batch2024Id);
  } else {
    batch2024Id = b24.rows[0].id;
    console.log("Existing batch 2024-2027 for Mechanical (Aided):", batch2024Id);
  }

  // 3. Feedback Cycle: Year 1 Semester 1
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1 AND semester = 1",
    [mechAidedDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Mechanical (Aided) Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [mechAidedDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for Mechanical (Aided):", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for Mechanical (Aided):", cycleYear1Id);
  }

  // 4. Faculty Records & Auth Accounts
  const facMap = new Map();
  for (const fac of facultyMembers) {
    // Check by username first
    const checkUser = await client.query("SELECT id, faculty_name FROM faculty WHERE username = $1", [fac.username]);
    let facId;
    if (checkUser.rows.length > 0) {
      facId = checkUser.rows[0].id;
      await client.query("UPDATE faculty SET active = true WHERE id = $1", [facId]);
      console.log(`Reusing existing faculty by username: ${fac.name} (${fac.username}) -> ID: ${facId}`);
    } else {
      // Check by name within Mech Aided or globally
      const checkName = await client.query(
        "SELECT id FROM faculty WHERE faculty_name ILIKE $1",
        [fac.name]
      );
      if (checkName.rows.length > 0) {
        facId = checkName.rows[0].id;
        await client.query("UPDATE faculty SET username = $1, active = true WHERE id = $2", [fac.username, facId]);
        console.log(`Reusing existing faculty by name: ${fac.name} (${fac.username}) -> ID: ${facId}`);
      } else {
        // Create new faculty record
        const ins = await client.query(`
          INSERT INTO faculty (department_id, faculty_name, username, active)
          VALUES ($1, $2, $3, true) RETURNING id
        `, [mechAidedDeptId, fac.name, fac.username]);
        facId = ins.rows[0].id;
        console.log(`Created new faculty: ${fac.name} (${fac.username}) -> ID: ${facId}`);
      }
    }
    facMap.set(fac.name, facId);

    // Ensure Auth User exists in Supabase for login
    try {
      const email = `${fac.username}@tpt.edu.in`;
      const { error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: 'Faculty@123',
        email_confirm: true,
        user_metadata: { name: fac.name, role: 'faculty' }
      });
      if (!authErr) {
        console.log(`Created Supabase Auth user for ${fac.name} (${email})`);
      }
    } catch {
      // User may already exist
    }
  }

  // 5. Subjects Setup (Year 1, Semester 1)
  const subMap = new Map();
  for (const s of year1_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 1",
      [mechAidedDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, mechAidedDeptId]);
      subId = ins.rows[0].id;
      console.log(`Created Year 1 subject: ${s.code} - ${s.name}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(`
        UPDATE subjects SET subject_name = $1, semester = 1, active = true WHERE id = $2
      `, [s.name, subId]);
      console.log(`Updated Year 1 subject: ${s.code} - ${s.name}`);
    }
    subMap.set(s.code, subId);
  }

  // 6. Faculty Subject Assignments (Year 1, Semester 1, Section 'A')
  await client.query("BEGIN");
  try {
    // Clear existing Year 1 assignments for Mechanical Aided
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [mechAidedDeptId]);
    console.log("\nCleared previous Year 1 assignments for Mechanical (Aided).");

    let assignCount = 0;
    for (const c of year1_courses) {
      const subId = subMap.get(c.code);
      if (!subId) throw new Error(`Subject ID not found for ${c.code}`);
      for (const facName of c.facs) {
        const facId = facMap.get(facName.trim());
        if (!facId) throw new Error(`Faculty ID not found for "${facName}"`);
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 1, 1, 'A', true)
        `, [mechAidedDeptId, facId, subId]);
        assignCount++;
        console.log(`Assigned Year 1: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    await client.query("COMMIT");
    console.log(`\nSuccessfully committed ${assignCount} assignments for Year 1.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }

  // 7. Upsert Students
  const y1Students = parseStudents(year1_students_raw, 'A');
  console.log(`\nParsed students count: ${y1Students.length}`);

  let studentCount = 0;
  for (const s of y1Students) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
      VALUES ($1, $2, $3, $4, 1, 1, 'A', true)
      ON CONFLICT (register_number)
      DO UPDATE SET
        student_name = EXCLUDED.student_name,
        department_id = EXCLUDED.department_id,
        batch_id = EXCLUDED.batch_id,
        year = 1,
        semester = 1,
        section = 'A',
        active = true
    `, [s.regNo, s.name, mechAidedDeptId, batch2024Id]);
    studentCount++;
  }
  console.log(`Successfully upserted ${studentCount} students for Mechanical (Aided) Year 1.`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR MECHANICAL (AIDED) YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [mechAidedDeptId]);
  console.log("Students in Mechanical (Aided) by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [mechAidedDeptId]);
  console.log("Subjects in Mechanical (Aided) by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester
  `, [mechAidedDeptId]);
  console.log("Year 1 Faculty assignments in Mechanical (Aided):", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [mechAidedDeptId]);
  console.log("Active Feedback cycles in Mechanical (Aided):", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== MECHANICAL (AIDED) YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN MECHANICAL (AIDED) YEAR 1 SETUP:", err);
  process.exit(1);
});

