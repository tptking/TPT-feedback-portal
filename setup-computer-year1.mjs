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

const compDeptId = '66666666-6666-6666-6666-666666666666';

// ==================== YEAR 1 COURSES ====================
const year1_courses = [
  {
    code: '240-001101',
    name: 'Tamil Marabu',
    facs: ['Ms. G. Anjalidevi', 'Ms. M. Angel']
  },
  {
    code: '240-001201',
    name: 'Engineering Mathematics',
    facs: ['Mr. I. Nagarajan']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics',
    facs: ['Ms. N. Vidhya', 'Dr. D. Nickson Sebastian']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry',
    facs: ['Ms. G. Latha', 'Mr. K. Logesh']
  },
  {
    code: '240-001102',
    name: 'Communicative English – I',
    facs: ['Dr. J. Sangeetha', 'Ms. J. S. Harini']
  },
  {
    code: '240-001301',
    name: 'Basic Workshop Practices',
    facs: ['Ms. S. R. Sandhiya']
  },
  {
    code: '240-001302',
    name: 'Digital Workplace Skills',
    facs: ['Mr. B. Nareshkumar', 'Mr. P. Sai Venkat']
  }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. G. Anjalidevi', username: 'ganjalidevi' },
  { name: 'Ms. M. Angel', username: 'mangel' },
  { name: 'Mr. I. Nagarajan', username: 'inagarajan' },
  { name: 'Ms. N. Vidhya', username: 'nvidhya' },
  { name: 'Dr. D. Nickson Sebastian', username: 'dnicksonsebastian' },
  { name: 'Ms. G. Latha', username: 'glatha' },
  { name: 'Mr. K. Logesh', username: 'klogesh' },
  { name: 'Dr. J. Sangeetha', username: 'jsangeetha' },
  { name: 'Ms. J. S. Harini', username: 'jsharini' },
  { name: 'Ms. S. R. Sandhiya', username: 'srsandhiya' },
  { name: 'Mr. B. Nareshkumar', username: 'bnareshkumar' },
  { name: 'Mr. P. Sai Venkat', username: 'psaivenkat' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2607009	AFRIN F
A2607010	BHARATH R
A2607011	DARWIN SHARMA A
A2607012	DEEPSHIKA SHREE T K
A2607013	DEVENDRA ROGEETH DEVDAS
A2607014	DILIP RAJ R
A2607015	DIWAKAR R
A2607016	DIYA S
A2607017	GANGESH G M
A2607018	GOWTHAM M
A2607019	GOWTHAM R
A2607020	GURUSHARAN S C
A2607021	HARINI S
A2607022	HARISH BALA R S
A2607023	ISHWARYA D
A2607024	JAGADEESHWARAN S
A2607025	JEEVA J
A2607026	JEEVANANDAM Y
A2607027	JOEL JOHN GOPALAN
A2607028	KANISHKA S
A2607029	KANISHKAR D
A2607030	KARAN M
A2607031	S KISHORE
A2607032	LEO J
A2607033	P LINGESHVAR
A2607034	MANISHA A
A2607035	MONISH V K
A2607036	S NITHISH
A2607037	POOJA SHREE M
A2607038	POOJASHRI V
A2607039	PRAVEEN RAJ R
A2607040	PRITHIKA N
A2607041	PRITHIKSHA S
A2607042	RAAGHAV VIJAY S
A2607043	RAJA SABARI G
A2607044	RAVINA Y
A2607045	SACHIN V R
A2607046	SAI PRASATH S
A2607047	SANJAY G
A2607048	SANJAY KRISHNA S B
A2607049	SANJITH G
A2607050	SARAVANABALAJI S
A2607051	SHAARVESH K
A2607052	SHARVESH M
A2607053	SIDDHARTH M
A2607054	SIVARANJANI B
A2607055	SOWHARINI R
A2607056	SRI AKSHAYA V
A2607057	SRI HARI K
A2607058	SRIHARINATH R
A2607059	TANYA S
A2607060	THARANITHARAN A
A2607061	VARSHITHA SREE B
A2607062	VIMLESH V Narayan
`;

function parseStudents(rawText, section = 'A') {
  return rawText
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        return {
          regNo: parts[0].trim().toUpperCase(),
          name: parts.slice(1).join(' ').trim().toUpperCase(),
          section
        };
      }
      const spaceIdx = line.indexOf(' ');
      if (spaceIdx > 0) {
        return {
          regNo: line.substring(0, spaceIdx).trim().toUpperCase(),
          name: line.substring(spaceIdx + 1).trim().toUpperCase(),
          section
        };
      }
      return null;
    })
    .filter(Boolean);
}

async function main() {
  console.log("Connecting to PostgreSQL database...");
  await client.connect();

  // 1. Verify Department
  const deptRes = await client.query("SELECT * FROM departments WHERE id = $1", [compDeptId]);
  if (deptRes.rows.length === 0) {
    throw new Error("Computer Engineering Department not found!");
  }
  console.log("Department verified:", deptRes.rows[0].department_name, `(${deptRes.rows[0].department_code})`);

  // 2. Check / Create Batch 2024-2027 (Year 1)
  let batch2024Id;
  const bRes = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND (batch_name ILIKE '%2024%' OR start_year = 2024)",
    [compDeptId]
  );
  if (bRes.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [compDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for Computer Engineering:", batch2024Id);
  } else {
    batch2024Id = bRes.rows[0].id;
    console.log("Using existing batch for Computer Engineering:", batch2024Id);
  }

  // 3. Feedback Cycle for Year 1 (Single class: section is null, enabled: true)
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1",
    [compDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Computer Engineering Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [compDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for Computer Engineering:", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for Computer Engineering:", cycleYear1Id);
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
        `, [compDeptId, fac.name, fac.username]);
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
  if (facMap.has('Ms. S. R. Sandhiya')) {
    facMap.set('S. R. Sandhiya', facMap.get('Ms. S. R. Sandhiya'));
  }
  if (facMap.has('Mr. P. Sai Venkat')) {
    facMap.set('Mr. P. Saivenkat', facMap.get('Mr. P. Sai Venkat'));
    facMap.set('Mr.P. Sai Venkat', facMap.get('Mr. P. Sai Venkat'));
  }

  // 5. Subjects Setup (Year 1, Semester 1)
  const subMap = new Map();
  for (const s of year1_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 1",
      [compDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, compDeptId]);
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
    // Clear existing Year 1 assignments for Computer Engineering
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [compDeptId]);
    console.log("\nCleared previous Year 1 assignments for Computer Engineering.");

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
        `, [compDeptId, facId, subId]);
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
    `, [s.regNo, s.name, compDeptId, batch2024Id]);
    studentCount++;
  }
  console.log(`Successfully upserted ${studentCount} students for Computer Engineering Year 1.`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR COMPUTER ENGINEERING YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [compDeptId]);
  console.log("Students in Computer Engineering by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [compDeptId]);
  console.log("Subjects in Computer Engineering by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester
  `, [compDeptId]);
  console.log("Year 1 Faculty assignments in Computer Engineering:", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [compDeptId]);
  console.log("Active Feedback cycles in Computer Engineering:", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== COMPUTER ENGINEERING YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("Setup failed:", err);
  process.exit(1);
});
