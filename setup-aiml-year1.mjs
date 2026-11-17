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

const aimlDeptId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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
    facs: ['Ms. N. Hemalatha']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Theory)',
    facs: ['Ms. B. Yokeshwari']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Practical)',
    facs: ['Ms. B. Yokeshwari', 'Ms. M. Vijayashree']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Theory)',
    facs: ['Ms. C. Sudha']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Practical)',
    facs: ['Ms. C. Sudha', 'Ms. R. M. Sasikala']
  },
  {
    code: '240-001102',
    name: 'Communicative English-I (Theory)',
    facs: ['Ms. J. S. Harini']
  },
  {
    code: '240-001102',
    name: 'Communicative English-I (Practical)',
    facs: ['Dr. J. Sangeetha', 'Ms. J. S. Harini']
  },
  {
    code: '240-001301',
    name: 'Basic Workshop Practical',
    facs: ['Mr. T. Ponnusamy']
  },
  {
    code: '240-001302',
    name: 'Digital Workplace Skills',
    facs: ['Mr. P. Saivenkat']
  }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. T. Bhovanaashwari', username: 'tbhovanaashwari' },
  { name: 'Ms. M. Angel', username: 'mangel' },
  { name: 'Ms. N. Hemalatha', username: 'nhemalatha' },
  { name: 'Ms. B. Yokeshwari', username: 'byokeshwari' },
  { name: 'Ms. M. Vijayashree', username: 'mvijayashree' },
  { name: 'Ms. C. Sudha', username: 'csudha' },
  { name: 'Ms. R. M. Sasikala', username: 'rmsasikala' },
  { name: 'Ms. J. S. Harini', username: 'jsharini' },
  { name: 'Dr. J. Sangeetha', username: 'jsangeetha' },
  { name: 'Mr. T. Ponnusamy', username: 'tponnusamy' },
  { name: 'Mr. P. Saivenkat', username: 'psaivenkat' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2614007	AHALIA K A
A2614008	AJAY G
A2614009	ANISHA N
A2614010	BHUPESH R R
A2614011	DEEPAK V
A2614012	DEVEAS B
A2614013	DHARSHINI P
A2614014	HARI SRI A S
A2614015	HARIPRASATH B M
A2614016	HARSHAVARTHINI B
A2614017	HARSHITH MANIKANDAN M K
A2614018	HARSHITHA M K
A2614019	HEMAMITHRA G
A2614020	JAISAKTHI A
A2614021	R JASWANTH
A2614022	A JOSHUA MAC
A2614023	KALIYANAM PARVATHISH
A2614024	M KAMALESH
A2614025	KOWNTIGA M P
A2614026	KRISH NAVNEETH S R
A2614027	KRISHNARAJ M
A2614028	KUNAAL V P
A2614029	LAKSHMANAN K
A2614030	LOGA RAKSHA V
A2614031	MEIRAMJLI V
A2614032	MOUNIKASRI V S
A2614033	MUGUNTHAN V
A2614034	MYTHRI P
A2614035	RAGAVIGNESH M S
A2614036	RITHEESH K S
A2614037	RUBA SATHYA NARAYANAN V
A2614038	SAMITHRA G
A2614039	SANJIV M S
A2614040	SANTHIYA S
A2614041	SANTHOSH V S
A2614042	SHARYU SANTAJI JAGADALE
A2614043	SHREE HARI B
A2614044	SHYAM G B
A2614045	SIDDIK M
A2614046	SOWMIYAN S
A2614047	SOWNDHARYA R
A2614048	SREENATH S
A2614049	SUDHARSAN G
A2614050	SUJITH S
A2614051	TARRUN C
A2614052	THIRUVETRI S K
A2614053	THISHANTH S
A2614054	UDHAYAVEL V
A2614055	VIKSHA POORVA V
A2614056	YUVAN SIDDHARTH S
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
  const deptRes = await client.query("SELECT * FROM departments WHERE id = $1", [aimlDeptId]);
  if (deptRes.rows.length === 0) {
    throw new Error("AI & ML Department not found!");
  }
  console.log("Department verified:", deptRes.rows[0].department_name, `(${deptRes.rows[0].department_code})`);

  // 2. Check / Create Batch 2024-2027 (Year 1)
  let batch2024Id;
  const bRes = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND (batch_name ILIKE '%2024%' OR start_year = 2024)",
    [aimlDeptId]
  );
  if (bRes.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [aimlDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for AI & ML:", batch2024Id);
  } else {
    batch2024Id = bRes.rows[0].id;
    console.log("Using existing batch for AI & ML:", batch2024Id);
  }

  // 3. Feedback Cycle for Year 1 (Single class: section is null, enabled: true)
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1",
    [aimlDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Artificial Intelligence (AI) and Machine Learning Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [aimlDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for AI & ML:", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for AI & ML:", cycleYear1Id);
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
        await client.query("UPDATE faculty SET active = true WHERE id = $1", [facId]);
        console.log(`Reusing existing faculty by name: ${fac.name} -> ID: ${facId}`);
      } else {
        const ins = await client.query(`
          INSERT INTO faculty (faculty_name, username, department_id, active)
          VALUES ($1, $2, $3, true) RETURNING id
        `, [fac.name, fac.username, aimlDeptId]);
        facId = ins.rows[0].id;
        console.log(`Created faculty record: ${fac.name} (${fac.username}) -> ID: ${facId}`);
      }
    }
    facMap.set(fac.name, facId);

    // Ensure Supabase Auth user exists
    const email = `${fac.username}@tpt.edu.in`;
    const { data: userList } = await supabase.auth.admin.listUsers();
    let authUser = userList?.users?.find(u => u.email === email);
    if (!authUser) {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: 'ChangeMe@123',
        email_confirm: true,
        user_metadata: { role: 'faculty', faculty_id: facId, full_name: fac.name }
      });
      if (createErr) {
        console.warn(`Auth user creation note for ${fac.name}:`, createErr.message);
      } else {
        console.log(`Created Supabase Auth user for ${fac.name} (${email})`);
      }
    }
  }

  // 5. Setup Year 1 Subjects and Assignments
  // Remove any previous Year 1 assignments & subjects for AI & ML
  await client.query(`
    DELETE FROM faculty_subject_assignments
    WHERE department_id = $1 AND subject_id IN (
      SELECT id FROM subjects WHERE department_id = $1 AND year = 1
    )
  `, [aimlDeptId]);

  await client.query(`
    DELETE FROM subjects
    WHERE department_id = $1 AND year = 1
  `, [aimlDeptId]);

  console.log("\nCleared previous Year 1 assignments and subjects for AI & ML.");

  const assignmentValues = [];
  for (const c of year1_courses) {
    const subRes = await client.query(`
      INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
      VALUES ($1, $2, $3, 1, 1, true) RETURNING id
    `, [c.code, c.name, aimlDeptId]);
    const subId = subRes.rows[0].id;
    console.log(`Created Year 1 subject: ${c.code} - ${c.name} -> ID: ${subId}`);

    for (const facName of c.facs) {
      const facId = facMap.get(facName);
      if (!facId) {
        console.error(`Faculty ID not found for: ${facName}`);
        continue;
      }
      assignmentValues.push({
        facId,
        subId,
        facName,
        courseCode: c.code,
        courseName: c.name
      });
    }
  }

  // Insert assignments
  for (const a of assignmentValues) {
    await client.query(`
      INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, academic_year, semester, section, year)
      VALUES ($1, $2, $3, '2024-2025', 1, 'A', 1)
    `, [a.facId, a.subId, aimlDeptId]);
    console.log(`Assigned Year 1: ${a.courseCode} (${a.courseName}) -> ${a.facName}`);
  }
  console.log(`\nSuccessfully committed ${assignmentValues.length} assignments for Year 1.`);

  // 6. Setup Students
  const students = parseStudents(year1_students_raw, 'A');
  console.log(`\nParsed students count: ${students.length}`);

  let upsertedCount = 0;
  for (const s of students) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
      VALUES ($1, $2, $3, $4, 1, 1, $5, true)
      ON CONFLICT (register_number) DO UPDATE SET
        student_name = EXCLUDED.student_name,
        department_id = EXCLUDED.department_id,
        batch_id = EXCLUDED.batch_id,
        year = EXCLUDED.year,
        semester = EXCLUDED.semester,
        section = EXCLUDED.section,
        active = true
    `, [s.regNo, s.name, aimlDeptId, batch2024Id, s.section]);
    upsertedCount++;
  }
  console.log(`Successfully upserted ${upsertedCount} students for AI & ML Year 1.`);

  // 7. Verification Summary
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR AI & ML YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [aimlDeptId]);
  console.log("Students in AI & ML by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [aimlDeptId]);
  console.log("Subjects in AI & ML by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester
  `, [aimlDeptId]);
  console.log("Year 1 Faculty assignments in AI & ML:", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [aimlDeptId]);
  console.log("Active Feedback cycles in AI & ML:", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== AI & ML YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("Setup failed:", err);
  process.exit(1);
});
