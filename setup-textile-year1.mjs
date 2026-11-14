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

const textileDeptId = '55555555-5555-5555-5555-555555555555';

// ==================== YEAR 1 COURSES ====================
const year1_courses = [
  {
    code: '240-001101',
    name: 'Tamil Marabu',
    facs: ['Ms. T. Bhovanaashwari', 'Ms. M. Angel']
  },
  {
    code: '240-001201',
    name: 'Engineering Mathematics',
    facs: ['Ms. P. Ramya']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics',
    facs: ['Ms. N. Vidhya', 'Ms. A. Rajalakshmi']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry',
    facs: ['Mr. R. Sankar', 'Ms. R. M. Sasikala']
  },
  {
    code: '240-001102',
    name: 'Communicative English – I',
    facs: ['Ms. J. S. Harini', 'Dr. A. Gandhimathi']
  },
  {
    code: '240-001301',
    name: 'Basic Workshop Practices',
    facs: ['Mr. C. Prabhu']
  },
  {
    code: '240-001302',
    name: 'Digital Workplace Skills',
    facs: ['Mrs. C. Jayathi', 'Mr. U. K. Sree Murugan']
  }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. T. Bhovanaashwari', username: 'tbhovanaashwari' },
  { name: 'Ms. M. Angel', username: 'mangel' },
  { name: 'Ms. P. Ramya', username: 'pramya' },
  { name: 'Ms. N. Vidhya', username: 'nvidhya' },
  { name: 'Ms. A. Rajalakshmi', username: 'arajalakshmi' },
  { name: 'Mr. R. Sankar', username: 'rsankar' },
  { name: 'Ms. R. M. Sasikala', username: 'rmsasikala' },
  { name: 'Ms. J. S. Harini', username: 'jsharini' },
  { name: 'Dr. A. Gandhimathi', username: 'agandhimathi' },
  { name: 'Mr. C. Prabhu', username: 'cprabhu' },
  { name: 'Mrs. C. Jayathi', username: 'cjayanthi' },
  { name: 'Mr. U. K. Sree Murugan', username: 'uksreemurugan' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2605018	ABHINOV B
A2605019	AMSA SHREE M
A2605020	BADRINARAYANAN M
A2605021	DEVISRI R
A2605022	DHAANISH AHAMED M
A2605023	DHARSHINI N S
A2605024	ELAMARAN R D
A2605025	ENIKAA S
A2605026	HARISUDHAN M K
A2605027	JAGADHEESAN S
A2605028	JHA KUNAL DAYANAND
A2605029	KANISHKA S
A2605030	KARTHIGA R K
A2605031	KAVINKUMAR V
A2605032	KAVIYA C
A2605033	KISHORE S
A2605034	MOSHINA D
A2605035	NARMATHA S
A2605036	NAVEEN S
A2605037	NAVEEN MANI S
A2605038	NAVEENKUMAR M
A2605039	NITHISH S
A2605040	POOVIZHI E
A2605041	PRAKASH A
A2605042	PRANAVKUMAR S
A2605043	PRASANNA A
A2605044	PRAVEEN BABU A G
A2605045	PUGALARASAN R
A2605046	RAGURAM H
A2605047	RENU GA SRI B
A2605048	ROHITH ASHWA V
A2605049	SANDHIYA V
A2605050	SANJAYBHARATHI K
A2605051	SASMITHA S
A2605052	SENTHAMIZHRAJA R
A2605053	S SHREYAA
A2605054	SIRANJEEVI S
A2605055	SOORAJKUMAR V
A2605056	P SRI VIJAYARAGAVI
A2605057	SUSITHRA S
A2605058	VASUGI V
A2605059	VEERASAMI V
A2605060	VIGNESH K
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
  console.log("=== STARTING TEXTILE TECHNOLOGY YEAR 1 SETUP ===");
  console.log("==================================================================");

  // 1. Verify Textile Department
  const dept = await client.query("SELECT * FROM departments WHERE id = $1", [textileDeptId]);
  if (dept.rows.length === 0) {
    throw new Error(`Textile Department with ID ${textileDeptId} not found!`);
  }
  console.log("Verified department:", dept.rows[0].department_name, `(${dept.rows[0].department_code})`);

  // 2. Batch: 2024-2027 (Year 1)
  let batch2024Id;
  const b24 = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND start_year = 2024",
    [textileDeptId]
  );
  if (b24.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [textileDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for Textile Technology:", batch2024Id);
  } else {
    batch2024Id = b24.rows[0].id;
    console.log("Existing batch 2024-2027 for Textile Technology:", batch2024Id);
  }

  // 3. Feedback Cycle: Year 1 Semester 1
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1 AND semester = 1",
    [textileDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Textile Technology Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [textileDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for Textile Technology:", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for Textile Technology:", cycleYear1Id);
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
      // Check by name globally
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
        `, [textileDeptId, fac.name, fac.username]);
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

  // Aliases for faculty mappings
  if (facMap.has('Mrs. C. Jayathi')) {
    facMap.set('C. Jayanthi', facMap.get('Mrs. C. Jayathi'));
  }
  if (facMap.has('Mr. C. Prabhu')) {
    facMap.set('Dr. C. Prabhu', facMap.get('Mr. C. Prabhu'));
    facMap.set('Dr. C. Prabu', facMap.get('Mr. C. Prabhu'));
  }

  // 5. Subjects Setup (Year 1, Semester 1)
  const subMap = new Map();
  for (const s of year1_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 1",
      [textileDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, textileDeptId]);
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
    // Clear existing Year 1 assignments for Textile Technology
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [textileDeptId]);
    console.log("\nCleared previous Year 1 assignments for Textile Technology.");

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
        `, [textileDeptId, facId, subId]);
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
    `, [s.regNo, s.name, textileDeptId, batch2024Id]);
    studentCount++;
  }
  console.log(`Successfully upserted ${studentCount} students for Textile Technology Year 1.`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR TEXTILE TECHNOLOGY YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [textileDeptId]);
  console.log("Students in Textile Technology by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [textileDeptId]);
  console.log("Subjects in Textile Technology by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester
  `, [textileDeptId]);
  console.log("Year 1 Faculty assignments in Textile Technology:", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [textileDeptId]);
  console.log("Active Feedback cycles in Textile Technology:", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== TEXTILE TECHNOLOGY YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN TEXTILE TECHNOLOGY YEAR 1 SETUP:", err);
  process.exit(1);
});

