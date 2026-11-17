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

const mechSsDeptId = '49edc87b-0416-4d5a-9b20-adddd18cd3b1';

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. C. Sathya', username: 'csathya' },
  { name: 'Ms. R. Jeevitha', username: 'rjeevitha' },
  { name: 'Ms. N. Hemalatha', username: 'nhemalatha' },
  { name: 'Ms. A. Rajalakshmi', username: 'arajalakshmi' },
  { name: 'Ms. M. Vijayashree', username: 'mvijayashree' },
  { name: 'Mr. K. Logesh', username: 'klogesh' },
  { name: 'Mr. R. Sankar', username: 'rsankar' },
  { name: 'Dr. J. Sangeetha', username: 'jsangeetha' },
  { name: 'Mr. S. Prakash', username: 'sprakash' },
  { name: 'Mr. S. Sabaresh', username: 'ssabaresh' },
  { name: 'Mr. B. Nareshkumar', username: 'bnareshkumar' },
  { name: 'Ms. G. Anjalidevi', username: 'ganjalidevi' },
  { name: 'Ms. K. Abinaya', username: 'kabinaya' },
  { name: 'Mr. A. Srinivasan', username: 'asrinivasan' },
  { name: 'Dr. D. Nickson Sebastian', username: 'dnicksonsebastian' },
  { name: 'Mr. M. Gopi', username: 'mgopi' },
  { name: 'Ms. G. Latha', username: 'glatha' },
  { name: 'Mr. G. Saravanan', username: 'gsaravanan' },
  { name: 'Mr. S. Srinivasan', username: 'ssrinivasan' },
  { name: 'Ms. J. Deetchananjali', username: 'jdeetchananjali' }
];

// ==================== SECTION A COURSES ====================
const sectionA_courses = [
  { code: '240-001101', name: 'Tamil Marabu (Tamil)', facs: ['Ms. C. Sathya', 'Ms. R. Jeevitha'] },
  { code: '240-001201', name: 'Engineering Mathematics (Engg Maths)', facs: ['Ms. N. Hemalatha'] },
  { code: '240-001202', name: 'Engineering Physics (Engg Phy)', facs: ['Ms. A. Rajalakshmi', 'Ms. M. Vijayashree'] },
  { code: '240-001203', name: 'Engineering Chemistry (Engg Che)', facs: ['Mr. K. Logesh', 'Mr. R. Sankar'] },
  { code: '240-001102', name: 'Communicative English I (English-I)', facs: ['Dr. J. Sangeetha', 'Ms. R. Jeevitha'] },
  { code: '240-001301', name: 'Basic Workshop Practical (BWP)', facs: ['Mr. S. Prakash'] },
  { code: '240-001302', name: 'Digital Workplace Skills (DWS)', facs: ['Mr. S. Sabaresh', 'Mr. B. Nareshkumar'] }
];

// ==================== SECTION B COURSES ====================
const sectionB_courses = [
  { code: '240-001101', name: 'Tamil Marabu', facs: ['Ms. G. Anjalidevi', 'Ms. K. Abinaya'] },
  { code: '240-001201', name: 'Engineering Mathematics', facs: ['Mr. A. Srinivasan'] },
  { code: '240-001202', name: 'Engineering Physics', facs: ['Dr. D. Nickson Sebastian', 'Ms. A. Rajalakshmi'] },
  { code: '240-001202', name: 'Engineering Physics (Practical)', facs: ['Mr. M. Gopi', 'Dr. D. Nickson Sebastian'] },
  { code: '240-001203', name: 'Engineering Chemistry', facs: ['Ms. G. Latha', 'Mr. K. Lokesh'] },
  { code: '240-001203', name: 'Engineering Chemistry Practical', facs: ['Ms. G. Latha', 'Mr. K. Lokesh'] },
  { code: '240-001102', name: 'Communicative English-I', facs: ['Ms. R. Jeevitha'] },
  { code: '240-001102', name: 'Communicative English-I (Practical)', facs: ['Ms. K. Abinaya', 'Ms. R. Jeevitha'] },
  { code: '240-001301', name: 'Basic Workshop Practices (Practical)', facs: ['Mr. G. Saravanan'] },
  { code: '240-001302', name: 'Digital Workplace Skills', facs: ['Mr. S. Srinivasan', 'Ms. J. Deetchananjali'] }
];

// ==================== SECTION A STUDENTS ====================
const sectionA_students_raw = `
A2610021	AAKASH P
A2610022	AKSHAN K
A2610023	ANANTHAKRISHNAN K G
A2610024	ANEESH S
A2610025	ASHOKKUMAR U
A2610026	ATHIROJ T
A2610027	BHARATH C
A2610028	BHARATH V R
A2610029	BHARATHKUMAR G
A2610030	BOOBESH T
A2610031	BOOPALA S
A2610032	DHAKSHIN R
A2610033	DHARAN P
A2610034	DHARSHAN S
A2610035	DHARSHINI V
A2610036	DHARSHITH S
A2610037	DHASHANTHU C
A2610038	DIVAKAR R
A2610039	DIVASHKAR M
A2610040	DIVITH S
A2610041	GOKUL R
A2610042	GOKULNATH S
A2610043	GOWERISH R
A2610044	GOWTHAM B
A2610045	GOWTHAM P
A2610046	GOWTHAM R
A2610047	GOWTHAM S
A2610048	HARIHARAN S
A2610049	HARINISH R
A2610050	IRFAN I
A2610051	JAGAPPRIYAN P
A2610052	JEEVAKARAN S
A2610053	JEGAN S
A2610054	KARTHIKEYAN R
A2610055	KARTHIKEYAN S
A2610056	KAVIPRAKASH E
A2610057	KISHORE B
A2610058	KISHORE G
A2610059	KISHORE K
A2610060	KISHORE M
A2610061	KRISHNAHARISH E
A2610062	KUMARAGURU T
A2610063	LOGESH T S
A2610064	LOGITH R
A2610065	LOKESH K
A2610066	LOKESHWARAN P
A2610067	MADHAN R
A2610068	MAHA SAMRUTHA M
A2610069	MAKILAN K
A2610070	MANIKANDAN R
A2610071	MANOJ M
A2610072	MANOJKUMAR S
A2610073	MESHAK VARGHESE B
A2610074	MOHAMMED FAHEEM S
A2610075	MOUDHEESHWARAN K
A2610076	MOUNISH M
A2610077	MUKESHKANNAN S
A2610078	MUKESHKUMAR M
A2610079	MUKILAN S
`;

// ==================== SECTION B STUDENTS ====================
const sectionB_students_raw = `
A2610080	NIRMAL G B
A2610081	PISAL ROSHAN VIJAY
A2610082	POOVARASAN P
A2610083	PRANEETH S S
A2610084	PRASANNA K
A2610085	PRATHAP S
A2610086	PRATHAP T
A2610087	RAGHUL R D
A2610088	RAGHUL KANNAN S
A2610089	RAHUL K
A2610090	RAJAMURUGAN P
A2610091	RAYHAN S
A2610092	ROSHAN G L
A2610093	ROSHAN M
A2610094	SAKTHIVEL N
A2610095	SANJAY B S
A2610096	SANJAY V R
A2610097	SANTHOSH S
A2610098	SANTHOSH S
A2610099	SANTHOSHBALAJI S
A2610100	SARATHI S
A2610101	SARAVANAN R
A2610102	SARAVANAVEL S
A2610103	SARDAR A
A2610104	SARVESH S
A2610105	SARVESH V
A2610106	SASIDHARUN A
A2610107	SATHISHKUMAR V
A2610108	SATHYA NARAYANAN M
A2610109	SHAKTHI T
A2610110	SHANMUGA SIVA M
A2610111	SHARVESH R
A2610112	SHARVESH S
A2610113	SRIDEPEATH R
A2610114	SRIRAM P
A2610115	SUCHIT S
A2610116	SUDHARSAN E
A2610117	SUHAIL B
A2610118	SUNDARAM M
A2610119	SUTHISH S
A2610120	SYED SHUAIB S
A2610121	TAMIL ARASAN M
A2610122	TAMILARASAN M
A2610123	TAMILARASAN S
A2610124	THEERAN A
A2610125	UDHAYARAJ J
A2610126	VAITHEESHWARAN S
A2610127	VIMAL L
A2610128	VISHNU B
A2610129	VISHNU S
A2610130	VISHVA K
A2610131	YOGESH A
`;

function parseStudents(rawText, section) {
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
  const deptRes = await client.query("SELECT * FROM departments WHERE id = $1", [mechSsDeptId]);
  if (deptRes.rows.length === 0) {
    throw new Error("Mechanical Engineering (SS) Department not found!");
  }
  console.log("Department verified:", deptRes.rows[0].department_name, `(${deptRes.rows[0].department_code})`);

  // 2. Check / Create Batch 2024-2027 (Year 1)
  let batch2024Id;
  const bRes = await client.query(
    "SELECT id FROM batches WHERE department_id = $1 AND (batch_name ILIKE '%2024%' OR start_year = 2024)",
    [mechSsDeptId]
  );
  if (bRes.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [mechSsDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for Mechanical Engineering (SS):", batch2024Id);
  } else {
    batch2024Id = bRes.rows[0].id;
    console.log("Using existing batch for Mechanical Engineering (SS):", batch2024Id);
  }

  // 3. Feedback Cycle for Year 1 (Covering both sections: section is null, enabled: true)
  let cycleYear1Id;
  const c1 = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1",
    [mechSsDeptId]
  );
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Mechanical (SS) Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [mechSsDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for Mechanical (SS):", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query(
      "UPDATE feedback_cycles SET enabled = true, start_date = NOW(), section = null WHERE id = $1",
      [cycleYear1Id]
    );
    console.log("Updated/Enabled Year 1 feedback cycle for Mechanical (SS):", cycleYear1Id);
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
        `, [mechSsDeptId, fac.name, fac.username]);
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
  if (facMap.has('Mr. K. Logesh')) {
    facMap.set('Mr. K. Lokesh', facMap.get('Mr. K. Logesh'));
    facMap.set('K. Logesh', facMap.get('Mr. K. Logesh'));
    facMap.set('K. Lokesh', facMap.get('Mr. K. Logesh'));
  }
  if (facMap.has('Mr. S. Prakash')) {
    facMap.set('S. Prakash', facMap.get('Mr. S. Prakash'));
  }
  if (facMap.has('Mr. G. Saravanan')) {
    facMap.set('G. Saravanan', facMap.get('Mr. G. Saravanan'));
  }
  if (facMap.has('Mr. S. Srinivasan')) {
    facMap.set('S. Srinivasan', facMap.get('Mr. S. Srinivasan'));
  }

  // 5. Subjects Setup (Year 1, Semester 1)
  // Collect all unique subjects across Section A and Section B
  const allCourses = [...sectionA_courses, ...sectionB_courses];
  const uniqueSubjectsMap = new Map();
  for (const c of allCourses) {
    const key = `${c.code}|${c.name.trim().toLowerCase()}`;
    if (!uniqueSubjectsMap.has(key)) {
      uniqueSubjectsMap.set(key, { code: c.code, name: c.name });
    }
  }

  const subMap = new Map(); // key: code|name -> id
  for (const [key, s] of uniqueSubjectsMap.entries()) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND subject_name ILIKE $3 AND year = 1",
      [mechSsDeptId, s.code, s.name]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, mechSsDeptId]);
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

  // 6. Faculty Subject Assignments (Section A & Section B)
  await client.query("BEGIN");
  try {
    // Clear existing Year 1 assignments for Mechanical Engineering (SS)
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [mechSsDeptId]);
    console.log("\nCleared previous Year 1 assignments for Mechanical Engineering (SS).");

    async function assignCourses(courses, section) {
      let count = 0;
      for (const c of courses) {
        const key = `${c.code}|${c.name.trim().toLowerCase()}`;
        const subId = subMap.get(key);
        if (!subId) throw new Error(`Subject ID not found for ${key}`);
        for (const facName of c.facs) {
          const facId = facMap.get(facName.trim());
          if (!facId) throw new Error(`Faculty ID not found for "${facName}"`);
          await client.query(`
            INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
            VALUES ($1, $2, $3, 1, 1, $4, true)
          `, [mechSsDeptId, facId, subId, section]);
          count++;
          console.log(`Assigned Year 1 Sec ${section}: ${c.code} (${c.name}) -> ${facName}`);
        }
      }
      return count;
    }

    const countA = await assignCourses(sectionA_courses, 'A');
    const countB = await assignCourses(sectionB_courses, 'B');

    await client.query("COMMIT");
    console.log(`\nSuccessfully committed assignments: Sec A = ${countA}, Sec B = ${countB}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }

  // 7. Upsert Students
  const y1aStudents = parseStudents(sectionA_students_raw, 'A');
  const y1bStudents = parseStudents(sectionB_students_raw, 'B');

  console.log(`\nParsed students:`);
  console.log(`  Section A: ${y1aStudents.length}`);
  console.log(`  Section B: ${y1bStudents.length}`);
  console.log(`  Total: ${y1aStudents.length + y1bStudents.length}`);

  let upsertCountA = 0;
  for (const s of y1aStudents) {
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
    `, [s.regNo, s.name, mechSsDeptId, batch2024Id]);
    upsertCountA++;
  }

  let upsertCountB = 0;
  for (const s of y1bStudents) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
      VALUES ($1, $2, $3, $4, 1, 1, 'B', true)
      ON CONFLICT (register_number)
      DO UPDATE SET
        student_name = EXCLUDED.student_name,
        department_id = EXCLUDED.department_id,
        batch_id = EXCLUDED.batch_id,
        year = 1,
        semester = 1,
        section = 'B',
        active = true
    `, [s.regNo, s.name, mechSsDeptId, batch2024Id]);
    upsertCountB++;
  }
  console.log(`Successfully upserted: Sec A = ${upsertCountA}, Sec B = ${upsertCountB}`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR MECHANICAL (SS) YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [mechSsDeptId]);
  console.log("Students in Mechanical (SS) by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [mechSsDeptId]);
  console.log("Subjects in Mechanical (SS) by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT fsa.year, fsa.semester, fsa.section, count(*) as count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1 AND fsa.year = 1
    GROUP BY fsa.year, fsa.semester, fsa.section
    ORDER BY fsa.section
  `, [mechSsDeptId]);
  console.log("Year 1 Faculty assignments in Mechanical (SS):", assignmentSummary.rows);

  const cycleSummary = await client.query(`
    SELECT id, cycle_name, year, semester, section, enabled
    FROM feedback_cycles
    WHERE department_id = $1
    ORDER BY year, semester
  `, [mechSsDeptId]);
  console.log("Active Feedback cycles in Mechanical (SS):", cycleSummary.rows);

  console.log("==================================================================");
  console.log("=== MECHANICAL (SS) YEAR 1 SETUP COMPLETED SUCCESSFULLY ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("Setup failed:", err);
  process.exit(1);
});
