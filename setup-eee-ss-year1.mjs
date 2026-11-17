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

const eeeSsDeptId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

// ==================== YEAR 1 COURSES ====================
const year1_courses = [
  {
    code: '240-001101',
    name: 'Tamil Marabu (Tamil)',
    facs: ['Ms. Bhovanaashwari T', 'Ms. M. Angel']
  },
  {
    code: '240-001201',
    name: 'Engineering Mathematics',
    facs: ['Ms. P. Ramya']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Theory)',
    facs: ['Ms. B. Yokeshwari']
  },
  {
    code: '240-001202',
    name: 'Engineering Physics (Practical)',
    facs: ['Dr. Nickson Sebastian']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Theory)',
    facs: ['Ms. C. Sudha']
  },
  {
    code: '240-001203',
    name: 'Engineering Chemistry (Practical)',
    facs: ['Mr. R. Sankar']
  },
  {
    code: '240-001102',
    name: 'Communicative English-I (Theory)',
    facs: ['Ms. J. S. Harini']
  },
  {
    code: '240-001102',
    name: 'Communicative English-I (Practical)',
    facs: ['Ms. J. Sangeetha']
  },
  {
    code: '240-001301',
    name: 'Basic Workshop Practices',
    facs: ['Mr. T. Ponnusamy']
  },
  {
    code: '240-001302',
    name: 'Digital Workplace Skills',
    facs: ['Ms. K. Kiruthika', 'Ms. J. Deetchananjali']
  }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. T. Bhovanaashwari', username: 'tbhovanaashwari' },
  { name: 'Ms. M. Angel', username: 'mangel' },
  { name: 'Ms. P. Ramya', username: 'pramya' },
  { name: 'Ms. B. Yokeshwari', username: 'byokeshwari' },
  { name: 'Dr. D. Nickson Sebastian', username: 'dnicksonsebastian' },
  { name: 'Ms. C. Sudha', username: 'csudha' },
  { name: 'Mr. R. Sankar', username: 'rsankar' },
  { name: 'Ms. J. S. Harini', username: 'jsharini' },
  { name: 'Dr. J. Sangeetha', username: 'jsangeetha' },
  { name: 'Mr. T. Ponnusamy', username: 'tponnusamy' },
  { name: 'Ms. K. Kiruthika', username: 'kkiruthikass' },
  { name: 'Ms. J. Deetchananjali', username: 'jdeetchananjali' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_students_raw = `
A2611009	ADHAVAN S P
A2611010	AJITH HARIHARAN S B
A2611011	ARJUN G
A2611012	ARUNACHALAM P
A2611013	ASHWIN M
A2611014	DEEPADHARSAN G
A2611015	DEERENDHIRA S A
A2611016	DEVABHUDAN S M
A2611017	DHARANEESH K
A2611018	DHARUNKUMAR S
A2611019	DIVYANTH G
A2611020	ENIYAN THANGARAJAN A U
A2611021	GANISH K
A2611022	HARIKARASUDHAN S
A2611023	HARIKRISHNAN V
A2611024	JAI SAKTHI R
A2611025	JAYASURYA A
A2611026	JEEVAN L
A2611027	KARTHIKEYAN K
A2611028	LOKESHWARAN R
A2611029	MADHESH M
A2611030	MOULISHWARAN K
A2611031	NITHISH C
A2611032	PAVISH NITHAN G
A2611033	PRADEEV A
A2611034	PRAJWAL G
A2611035	PRAVEEN M
A2611036	RAGUL S
A2611037	RAMESH P
A2611038	ROHITHVARMAN L
A2611039	SABARESH A
A2611040	SABARISH P
A2611041	SABARISH D
A2611042	SAKTHIVEL R
A2611043	SANJAY J P
A2611044	SANJAYA PRASAD R
A2611045	SANKAR U G
A2611046	SATHANA M
A2611047	SHANMUGAVEL V
A2611048	SIVA PRAKASH P
A2611049	SOMASHEKHAR O
A2611050	SRICHARAN S D
A2611051	SRIHARSHAN L J
A2611052	SUDEEP S
A2611053	SUJIT P Y
A2611054	SURIYA R
A2611055	SYED AASHIF A
A2611056	TAMILARASU L
A2611057	THENNARASAN B K
A2611058	THIRUMURUGAN T
A2611059	THIRUSANKARAN S
A2611060	THURKESH B
A2611061	VASANTHKUMAR I
A2611062	VIDYADHARANI V K
A2611063	VIKRAM T
A2611064	VINOTH G
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
  const deptRes = await client.query("SELECT * FROM departments WHERE id = $1", [eeeSsDeptId]);
  if (deptRes.rows.length === 0) {
    throw new Error("Electrical & Electronics Engineering (SS) Department not found!");
  }
  console.log("Department verified:", deptRes.rows[0].department_name, `(${deptRes.rows[0].department_code})`);

  // 2. Check / Create Batch 2024-2027 (Year 1)
  let batch2024Id;
  const bRes = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND (batch_name ILIKE '%2024%' OR start_year = 2024)",
    [eeeSsDeptId]
  );
  if (bRes.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [eeeSsDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for EEE (SS):", batch2024Id);
  } else {
    batch2024Id = bRes.rows[0].id;
    console.log("Using existing batch for EEE (SS):", batch2024Id);
  }

  // 3. Feedback Cycle for Year 1 (Single class: section is null, enabled: true)
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1",
    [eeeSsDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electrical & Electronics Engineering (SS) Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [eeeSsDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for EEE (SS):", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for EEE (SS):", cycleYear1Id);
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
        `, [eeeSsDeptId, fac.name, fac.username]);
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
  if (facMap.has('Ms. T. Bhovanaashwari')) {
    facMap.set('Ms. Bhovanaashwari T', facMap.get('Ms. T. Bhovanaashwari'));
    facMap.set('Bhovanaashwari T', facMap.get('Ms. T. Bhovanaashwari'));
  }
  if (facMap.has('Dr. D. Nickson Sebastian')) {
    facMap.set('Dr. Nickson Sebastian', facMap.get('Dr. D. Nickson Sebastian'));
    facMap.set('Nickson Sebastian', facMap.get('Dr. D. Nickson Sebastian'));
  }
  if (facMap.has('Dr. J. Sangeetha')) {
    facMap.set('Ms. J. Sangeetha', facMap.get('Dr. J. Sangeetha'));
  }
  if (facMap.has('Mr. T. Ponnusamy')) {
    facMap.set('T. Ponnusamy', facMap.get('Mr. T. Ponnusamy'));
  }

  // 5. Subjects Setup (Year 1, Semester 1)
  const subMap = new Map();
  for (const s of year1_courses) {
    const key = `${s.code}|${s.name.trim().toLowerCase()}`;
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND subject_name ILIKE $3 AND year = 1",
      [eeeSsDeptId, s.code, s.name]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, eeeSsDeptId]);
      subId = ins.rows[0].id;
      console.log(`Created Year 1 subject: ${s.code} - ${s.name} -> ID: ${subId}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(`
        UPDATE subjects SET active = true, semester = 1 WHERE id = $1
      `, [subId]);
      console.log(`Reusing Year 1 subject: ${s.code} - ${s.name} -> ID: ${subId}`);
    }
    subMap.set(key, subId);
  }

  // 6. Faculty Subject Assignments (Single class: Section 'A')
  await client.query("BEGIN");
  try {
    // Clear existing Year 1 assignments for EEE (SS)
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [eeeSsDeptId]);
    console.log("\nCleared previous Year 1 assignments for EEE (SS).");

    let assignCount = 0;
    for (const c of year1_courses) {
      const key = `${c.code}|${c.name.trim().toLowerCase()}`;
      const subId = subMap.get(key);
      if (!subId) throw new Error(`Subject ID not found for ${key}`);
      for (const facName of c.facs) {
        const facId = facMap.get(facName.trim());
        if (!facId) throw new Error(`Faculty ID not found for "${facName}"`);
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 1, 1, 'A', true)
        `, [eeeSsDeptId, facId, subId]);
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
    `, [s.regNo, s.name, eeeSsDeptId, batch2024Id]);
    studentCount++;
  }
  console.log(`Successfully upserted ${studentCount} students for EEE (SS) Year 1.`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR EEE (SS) YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [eeeSsDeptId]);
  console.log("Students in EEE (SS) by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [eeeSsDeptId]);
  console.log("Subjects in EEE (SS) by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester
  `, [eeeSsDeptId]);
  console.log("Year 1 Faculty assignments in EEE (SS):", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [eeeSsDeptId]);
  console.log("Active Feedback cycles in EEE (SS):", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== EEE (SS) YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("Setup failed:", err);
  process.exit(1);
});
