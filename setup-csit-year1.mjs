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

const csitDeptId = '77777777-7777-7777-7777-777777777777';

// ==================== YEAR 1 COURSES ====================
const year1_courses = [
  {
    code: '240-001101',
    name: 'Tamil Marabu',
    facs: ['Ms. S. Sudha', 'Ms. M. Angel']
  },
  {
    code: '240-001201',
    name: 'Engineering Mathematics',
    facs: ['Mr. A. Srinivasan', 'Ms. G. Haritha']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Theory)',
    facs: ['Dr. D. Nickson Sebastian']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Practical)',
    facs: ['Dr. D. Nickson Sebastian', 'Ms. B. Yokeshwari']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Theory)',
    facs: ['Ms. R. M. Sasikala']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Practical)',
    facs: ['Ms. R. M. Sasikala', 'Ms. C. Sudha']
  },
  {
    code: '240-001102',
    name: 'Communicative English-I (Theory)',
    facs: ['Ms. R. Jeevitha']
  },
  {
    code: '240-001102',
    name: 'Communicative English-I (Practical)',
    facs: ['Dr. A. Gandhimathi', 'Ms. R. Jeevitha']
  },
  {
    code: '240-001301',
    name: 'Basic Workshop Practices',
    facs: ['Mr. K. Karthick']
  },
  {
    code: '240-001302',
    name: 'Digital Workplace Skills',
    facs: ['Ms. J. Deetchananjali', 'Mr. P. Saivenkat']
  }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. S. Sudha', username: 'ssudha' },
  { name: 'Ms. M. Angel', username: 'mangel' },
  { name: 'Mr. A. Srinivasan', username: 'asrinivasan' },
  { name: 'Ms. G. Haritha', username: 'gharitha' },
  { name: 'Dr. D. Nickson Sebastian', username: 'dnicksonsebastian' },
  { name: 'Ms. B. Yokeshwari', username: 'byokeshwari' },
  { name: 'Ms. R. M. Sasikala', username: 'rmsasikala' },
  { name: 'Ms. C. Sudha', username: 'csudha' },
  { name: 'Ms. R. Jeevitha', username: 'rjeevitha' },
  { name: 'Dr. A. Gandhimathi', username: 'agandhimathi' },
  { name: 'Mr. K. Karthick', username: 'kkarthick' },
  { name: 'Ms. J. Deetchananjali', username: 'jdeetchananjali' },
  { name: 'Mr. P. Saivenkat', username: 'psaivenkat' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2616009	ABDUL BASEETH P N
A2616010	AHAMED NOWFAL M
A2616011	ARJUN HARIHARAN S B
A2616012	ARSATH FATHIMA A
A2616013	ASHWIN B
A2616014	BARUN S
A2616015	V BAVIDRA
A2616016	DAYAANITHI V
A2616017	DHARANISH R
A2616018	DHASWANTH V K
A2616019	FARID S
A2616020	FIZA ANJUM G N
A2616021	HARI MURUGAN T
A2616022	JANANI M
A2616023	JASVANTH V
A2616024	JEEVA R S
A2616025	LOGASENDUR S
A2616026	G MAGILESH
A2616027	MISBA UL HAQ M
A2616028	MISHARY AL AFASY M A
A2616029	MOHAMED FARHAN F
A2616030	MOHAMMED IRSHATH B
A2616031	MOHAMMED NAFFEEZ R
A2616032	MONICAPRIYA G
A2616033	MURUGA SRINITHI R
A2616034	MUTHARASI M
A2616035	P NAGA ARJUN
A2616036	NAKSHATRAA SREVINI G M
A2616037	NANDHAKISHORE M
A2616038	NITHISH KUMARAN M
A2616039	PRAVEEN M
A2616040	PREETHI B
A2616041	PUGAZHSABARINADHAN T
A2616042	ROHITH S
A2616043	ROSHAN J
A2616044	SABARI V
A2616045	SABARI VASAN K
A2616046	SANJANA V
A2616047	SANJANA KUMARI R
A2616048	SANJAY K
A2616049	SANTHOSH R
A2616050	SATHISH KRISHNA R
A2616051	S SHRI CHAARAN
A2616052	S SIVADHARSHINI
A2616053	P SREE VARSHA
A2616054	SRINISHA S K
A2616055	SRISHARAN J
A2616056	F SYED MANSOOR PEERAN
A2616057	THASHWIN K
A2616058	VIJAYARAGAVAN
A2616059	VISHNU VIKAS S
A2616060	YASHWANTH S
A2616061	YASVANTH KUMAR M
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
  const deptRes = await client.query("SELECT * FROM departments WHERE id = $1", [csitDeptId]);
  if (deptRes.rows.length === 0) {
    throw new Error("CS & IT Department not found!");
  }
  console.log("Department verified:", deptRes.rows[0].department_name, `(${deptRes.rows[0].department_code})`);

  // 2. Check / Create Batch 2024-2027 (Year 1)
  let batch2024Id;
  const bRes = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND (batch_name ILIKE '%2024%' OR start_year = 2024)",
    [csitDeptId]
  );
  if (bRes.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [csitDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for CS & IT:", batch2024Id);
  } else {
    batch2024Id = bRes.rows[0].id;
    console.log("Using existing batch for CS & IT:", batch2024Id);
  }

  // 3. Feedback Cycle for Year 1 (Single class: section is null, enabled: true)
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1",
    [csitDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Computer Science & Information Technology Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [csitDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for CS & IT:", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for CS & IT:", cycleYear1Id);
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
        `, [fac.name, fac.username, csitDeptId]);
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
  // Remove any previous Year 1 assignments & subjects for CS & IT
  await client.query(`
    DELETE FROM faculty_subject_assignments
    WHERE department_id = $1 AND subject_id IN (
      SELECT id FROM subjects WHERE department_id = $1 AND year = 1
    )
  `, [csitDeptId]);

  await client.query(`
    DELETE FROM subjects
    WHERE department_id = $1 AND year = 1
  `, [csitDeptId]);

  console.log("\nCleared previous Year 1 assignments and subjects for CS & IT.");

  const assignmentValues = [];
  for (const c of year1_courses) {
    const subRes = await client.query(`
      INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
      VALUES ($1, $2, $3, 1, 1, true) RETURNING id
    `, [c.code, c.name, csitDeptId]);
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
    `, [a.facId, a.subId, csitDeptId]);
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
    `, [s.regNo, s.name, csitDeptId, batch2024Id, s.section]);
    upsertedCount++;
  }
  console.log(`Successfully upserted ${upsertedCount} students for CS & IT Year 1.`);

  // 7. Verification Summary
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR CS & IT YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [csitDeptId]);
  console.log("Students in CS & IT by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [csitDeptId]);
  console.log("Subjects in CS & IT by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester
  `, [csitDeptId]);
  console.log("Year 1 Faculty assignments in CS & IT:", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [csitDeptId]);
  console.log("Active Feedback cycles in CS & IT:", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== CS & IT YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("Setup failed:", err);
  process.exit(1);
});
