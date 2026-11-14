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

const civilDeptId = '11111111-1111-1111-1111-111111111111';

// ==================== YEAR 1 COURSES ====================
const year1_courses = [
  {
    code: '240-001101',
    name: 'Tamil Marabu (Tamil)',
    facs: ['Ms. G. Anjalidevi', 'Ms. J. S. Harini']
  },
  {
    code: '240-001201',
    name: 'Engineering Mathematics (Engg Maths)',
    facs: ['Ms. G. Haritha']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Engg Phy)',
    facs: ['Ms. M. Vijayashree', 'Ms. B. Yokeshwari']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Engg Che)',
    facs: ['Ms. R. M. Sasikala', 'Mr. C. Sudha']
  },
  {
    code: '240-001102',
    name: 'Communicative English I (English-I)',
    facs: ['Dr. A. Gandhimathi', 'Ms. J. S. Harini']
  },
  {
    code: '240-001301',
    name: 'Basic Workshop Practical (BWP)',
    facs: ['Dr. C. Prabu']
  },
  {
    code: '240-001302',
    name: 'Digital Workplace Skills (DWS)',
    facs: ['Ms. J. Deetchananjali', 'Ms. S. Ambiga']
  }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. G. Anjalidevi', username: 'ganjalidevi' },
  { name: 'Ms. J. S. Harini', username: 'jsharini' },
  { name: 'Ms. G. Haritha', username: 'gharitha' },
  { name: 'Ms. M. Vijayashree', username: 'mvijayashree' },
  { name: 'Ms. B. Yokeshwari', username: 'byokeshwari' },
  { name: 'Ms. R. M. Sasikala', username: 'rmsasikala' },
  { name: 'Mr. C. Sudha', username: 'csudha' },
  { name: 'Dr. A. Gandhimathi', username: 'agandhimathi' },
  { name: 'Dr. C. Prabu', username: 'cprabu' },
  { name: 'Ms. J. Deetchananjali', username: 'jdeetchananjali' },
  { name: 'Ms. S. Ambiga', username: 'sambiga' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2601012	AAFREEN R
A2601013	AKASH I
A2601014	ANBARASAN S
A2601015	ANBURAJA M
A2601016	ATCHAYA K
A2601017	AVISHKAR R
A2601018	BHARATHKUMAR C
A2601019	BHUVANESWARAN S
A2601020	BRINDHA P
A2601021	DHARUNIKA M
A2601022	DIVYA S
A2601023	FREDRICK A
A2601024	GOKULAKANNAN S
A2601025	GOKULANATHAN M
A2601026	HARI BALA K
A2601027	HARISH S
A2601028	HEMA B M
A2601029	HEMANTHKUMAR M S
A2601030	ILAKKIYAT M
A2601031	IMANUL MUHSIN B
A2601032	JAI AKASH P
A2601033	JAMUNA RANI M
A2601034	JAYASEELAN E
A2601035	KABILAN V
A2601036	KALIRATHINAM S
A2601037	KARTHICK V
A2601038	KARUNANITHI G
A2601039	KAVIARASAN R V
A2601040	KAVINRAGHAV P
A2601041	KAVIYARASAN A
A2601042	KOWSALYA M
A2601043	MANOJ M
A2601044	MITHUN A
A2601045	MONIKA M
A2601046	MONISH M
A2601047	MUHIL SANJITH B
A2601048	MUKESHKUMAR S
A2601049	NAVARASAN P
A2601050	NAVEENA M
A2601051	NAVEENA V
A2601052	NITHISWAR S
A2601053	RITHIK M
A2601054	SACHIN S L
A2601055	SAKTHIVEL L
A2601056	SANJEETH G
A2601057	SARABANGAN M
A2601058	SARANKUMAR S
A2601059	SATHASIVAN M
A2601060	SRIDHARSHAN V
A2601061	SRISANTH M
A2601062	SUBIKSHAN D
A2601063	SUJITHKUMAR I
A2601064	THENNARASU K
A2601065	THENNARASU V
A2601066	THULASINATHAN E
A2601067	VARUNRAJ S
A2601068	VENKATRAGHAV A S
A2601069	VENU KRISHNA M
A2601070	YESWANTH RAJKUMAR A
A2601071	YOGITA DEVI M
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
  console.log("=== STARTING CIVIL ENGINEERING YEAR 1 SETUP ===");
  console.log("==================================================================");

  // 1. Verify Civil Department
  const dept = await client.query("SELECT * FROM departments WHERE id = $1", [civilDeptId]);
  if (dept.rows.length === 0) {
    throw new Error(`Civil Department with ID ${civilDeptId} not found!`);
  }
  console.log("Verified department:", dept.rows[0].department_name, `(${dept.rows[0].department_code})`);

  // 2. Batch: 2024-2027 (Year 1)
  let batch2024Id;
  const b24 = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND start_year = 2024",
    [civilDeptId]
  );
  if (b24.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [civilDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for Civil:", batch2024Id);
  } else {
    batch2024Id = b24.rows[0].id;
    console.log("Existing batch 2024-2027 for Civil:", batch2024Id);
  }

  // 3. Feedback Cycle: Year 1 Semester 1
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1 AND semester = 1",
    [civilDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Civil Engineering Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [civilDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for Civil:", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for Civil:", cycleYear1Id);
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
      // Check by name within Civil or globally
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
        `, [civilDeptId, fac.name, fac.username]);
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

  // Also support 'Mr. C. Sudha' or 'Ms. C. Sudha'
  if (facMap.has('Mr. C. Sudha')) {
    facMap.set('Ms. C. Sudha', facMap.get('Mr. C. Sudha'));
  }

  // 5. Subjects Setup (Year 1, Semester 1)
  const subMap = new Map();
  for (const s of year1_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 1",
      [civilDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, civilDeptId]);
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
    // Clear existing Year 1 assignments for Civil
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [civilDeptId]);
    console.log("\nCleared previous Year 1 assignments for Civil.");

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
        `, [civilDeptId, facId, subId]);
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
    `, [s.regNo, s.name, civilDeptId, batch2024Id]);
    studentCount++;
  }
  console.log(`Successfully upserted ${studentCount} students for Civil Year 1.`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR CIVIL YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [civilDeptId]);
  console.log("Students in Civil by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [civilDeptId]);
  console.log("Subjects in Civil by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester
  `, [civilDeptId]);
  console.log("Year 1 Faculty assignments in Civil:", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [civilDeptId]);
  console.log("Active Feedback cycles in Civil:", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== CIVIL YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN CIVIL YEAR 1 SETUP:", err);
  process.exit(1);
});

