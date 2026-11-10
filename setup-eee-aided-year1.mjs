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

const eeeDeptId = '33333333-3333-3333-3333-333333333333';

// ==================== YEAR 1 COURSES ====================
const year1_courses = [
  { code: '240-001101', name: 'Tamil Marabu', facs: ['Ms. C. Sathya', 'Ms. M. Angel'] },
  { code: '240-001201', name: 'Engineering Mathematics', facs: ['Mr. A. Srinivasan'] },
  { code: '240-001202', name: 'Engineering Physics', facs: ['Ms. N. Vidhya', 'Dr. D. Nickson Sebastian'] },
  { code: '240-001203', name: 'Engineering Chemistry', facs: ['Ms. G. Latha', 'Mr. K. Logesh'] },
  { code: '240-001102', name: 'Communicative English – I', facs: ['Dr. A. Gandhimathi', 'Ms. K. Abinaya'] },
  { code: '240-001301', name: 'Basic Workshop Practices', facs: ['Mr. G. Maniraj'] },
  { code: '240-001302', name: 'Digital Workplace Skills', facs: ['Mr. P. Udhayakumar', 'Ms. D. Deetchananjali'] }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. C. Sathya', username: 'csathya' },
  { name: 'Ms. M. Angel', username: 'mangel' },
  { name: 'Mr. A. Srinivasan', username: 'asrinivasan' },
  { name: 'Ms. N. Vidhya', username: 'nvidhya' },
  { name: 'Dr. D. Nickson Sebastian', username: 'dnicksonsebastian' },
  { name: 'Ms. G. Latha', username: 'glatha' },
  { name: 'Mr. K. Logesh', username: 'klogesh' },
  { name: 'Dr. A. Gandhimathi', username: 'agandhimathi' },
  { name: 'Ms. K. Abinaya', username: 'kabinaya' },
  { name: 'Mr. G. Maniraj', username: 'gmanirajeee' },
  { name: 'Mr. P. Udhayakumar', username: 'pudhayakumar' },
  { name: 'Ms. D. Deetchananjali', username: 'ddeetchananjali' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2603008	K ABDUL KAREEM
A2603009	ABDUL REHMAN S
A2603010	ABICHEKRAJHAN E K
A2603011	BARANEETHARAN A R
A2603012	BRATHIGA B
A2603013	DAN KINGSLIN R
A2603014	DHAKSHAYA SREE G
A2603015	DHARSHAN K
A2603016	DHARSHAN S
A2603017	DHAYA A
A2603018	S EDWIN
A2603019	GIRIVASAGAN R
A2603020	GOKUL RAJ T
A2603021	GOKULRAJ M
A2603022	GOWSIKVELAVAN M
A2603023	GOWTHAM K
A2603024	GUNAL R
A2603025	HARIHARAN M
A2603026	HARISH J
A2603027	JISHNUKANTH T
A2603028	KALAIMARAN H
A2603029	KARTHIKEYAN M
A2603030	KISHOR R
A2603031	KISHOR S
A2603032	KISHOR V
A2603033	LOKESHAVAN S
A2603034	MANOJ T
A2603035	A MIRUDHULA
A2603036	MOULIKRISHNAN G
A2603037	MOUSIKA J
A2603038	MUKUNDHAKRISHNAN R
A2603039	NARESH KARTHI P K
A2603040	NIVASHINI S
A2603041	PRANITHA R D
A2603042	S PRITHVEE
A2603043	PUGALA A
A2603044	RAJENDRAN B
A2603045	RITHICKRAJ A
A2603046	RITHISH B
A2603047	ROHIT M
A2603048	ROHITH S
A2603049	SAANVI G
A2603050	SABINRAJ M
A2603051	SAI MUTHUKUMARAN A K
A2603052	SAKTHIVEL S
A2603053	SANDEEPRAJ T
A2603054	SANJAI S
A2603055	SANTHOSH M
A2603056	SARAVANAVEL P
A2603057	SASHVANTH U
A2603058	SENTHILNADHAN D
A2603059	SHAMBATHRAJ T
A2603060	SRINIKA S
A2603061	SUJITH P
A2603062	SURENDHAR R
A2603063	THANIKA M
A2603064	THARULAKSHA M
`;

function parseStudents(raw, section) {
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
  console.log("=== STARTING ELECTRICAL & ELECTRONICS ENGINEERING (AIDED) YEAR 1 SETUP ===");
  console.log("==================================================================");

  // 1. Verify Department
  const dept = await client.query("SELECT * FROM departments WHERE id = $1", [eeeDeptId]);
  if (dept.rows.length === 0) {
    throw new Error(`Department with ID ${eeeDeptId} not found!`);
  }
  console.log("Verified department:", dept.rows[0].department_name);

  // 2. Batch: 2024-2027 (Year 1)
  let batch2024Id;
  const b24 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2024", [eeeDeptId]);
  if (b24.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [eeeDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for EEE Aided:", batch2024Id);
  } else {
    batch2024Id = b24.rows[0].id;
    console.log("Existing batch 2024-2027 for EEE Aided:", batch2024Id);
  }

  // 3. Feedback Cycle: Year 1 Semester 1
  let cycleYear1Id;
  const c1 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1 AND semester = 1", [eeeDeptId]);
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electrical & Electronics Engineering (Aided) Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [eeeDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for EEE Aided:", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query("UPDATE feedback_cycles SET enabled = true, start_date = NOW() WHERE id = $1", [cycleYear1Id]);
    console.log("Updated/Enabled Year 1 feedback cycle for EEE Aided:", cycleYear1Id);
  }

  // 4. Faculty Records
  const facMap = new Map();
  for (const fac of facultyMembers) {
    // Check by username first
    const checkUser = await client.query("SELECT id FROM faculty WHERE username = $1", [fac.username]);
    let facId;
    if (checkUser.rows.length > 0) {
      facId = checkUser.rows[0].id;
      await client.query("UPDATE faculty SET faculty_name = $1, active = true WHERE id = $2", [fac.name, facId]);
      console.log(`Updated existing faculty by username: ${fac.name} (${fac.username})`);
    } else {
      // Check by name and department
      const checkName = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND faculty_name = $2", [eeeDeptId, fac.name]);
      if (checkName.rows.length > 0) {
        facId = checkName.rows[0].id;
        await client.query("UPDATE faculty SET username = $1, active = true WHERE id = $2", [fac.username, facId]);
        console.log(`Updated existing faculty by name: ${fac.name} (${fac.username})`);
      } else {
        const ins = await client.query(`
          INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
          VALUES ($1, $2, $3, NULL, true) RETURNING id
        `, [eeeDeptId, fac.name, fac.username]);
        facId = ins.rows[0].id;
        console.log(`Inserted faculty: ${fac.name} (${fac.username})`);
      }
    }
    facMap.set(fac.name, facId);
  }

  // 5. Subjects Setup (Year 1, Semester 1)
  const subMap = new Map();
  for (const s of year1_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 1",
      [eeeDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, eeeDeptId]);
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
    // Clear existing Year 1 assignments for EEE Aided to allow clean re-run
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [eeeDeptId]);
    console.log("\nCleared previous Year 1 assignments for EEE Aided.");

    let assignCount = 0;
    for (const c of year1_courses) {
      const subId = subMap.get(c.code);
      if (!subId) throw new Error(`Subject ID not found for ${c.code}`);
      for (const facName of c.facs) {
        const facId = facMap.get(facName.trim());
        if (!facId) throw new Error(`Faculty ID not found for ${facName}`);
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 1, 1, 'A', true)
        `, [eeeDeptId, facId, subId]);
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
  console.log(`\nParsed ${y1Students.length} Year 1 students.`);

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
    `, [s.regNo, s.name, eeeDeptId, batch2024Id]);
    studentCount++;
  }
  console.log(`Successfully upserted ${studentCount} Year 1 students.`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR EEE AIDED YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [eeeDeptId]);
  console.log("Students by year & section in EEE Aided:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [eeeDeptId]);
  console.log("Subjects by year & semester in EEE Aided:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM faculty_subject_assignments
    WHERE department_id = $1 AND year = 1
    GROUP BY year, semester, section
  `, [eeeDeptId]);
  console.log("Year 1 Faculty assignments in EEE Aided:", assignmentSummary.rows);

  console.log("==================================================================");
  console.log("=== EEE AIDED YEAR 1 SETUP COMPLETED ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN SETUP:", err);
  process.exit(1);
});

