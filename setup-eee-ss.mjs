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

const eeessDeptId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const year2_courses = [
  { code: '240-033401', name: 'Electrical Machines I', facs: ['Ms. A. Rathna'] },
  { code: '240-033402', name: 'Electrical Circuit Theory', facs: ['Mr. M. Arunkumar'] },
  { code: '240-033403', name: 'Sensors and Measurement', facs: ['Mr. M. Arunkumar', 'Ms. K. Sri Nandhini'] },
  { code: '240-033404', name: 'Analog and Digital Electronics', facs: ['Ms. R. Palanimathi', 'Mr. M. Arunkumar'] },
  { code: '240-033301', name: 'Programming in C', facs: ['Ms. K. Kiruthika', 'Mr. M. Arunkumar'] },
  { code: '240-033405', name: 'Electrical Machines – I Practical', facs: ['Ms. A. Rathna', 'Dr. D. Mary Jeyanthi'] }
];

const year3_courses = [
  { code: '240-035412', name: 'Power System Protection and Utilization (PSPU)', facs: ['Dr. D. Mary Jeyanthi'] },
  { code: '240-035413', name: 'Electric Vehicle Technology (EV)', facs: ['Ms. K. Sri Nandhini'] },
  { code: '240-035414', name: 'Power Electronics (PE)', facs: ['Ms. K. Kiruthika', 'Mr. M. Arunkumar'] },
  { code: '240-035415', name: 'PLC and Automation (PLC)', facs: ['Ms. A. Rathna', 'Ms. R. Palanimathi'] },
  { code: '240-035501C', name: 'Control of Electrical Machines (CEM)', facs: ['Ms. K. Sri Nandhini', 'Dr. D. Mary Jeyanthi'] },
  { code: '240-035102', name: 'Innovation and Start-ups (I&S)', facs: ['Dr. D. Mary Jeyanthi', 'Ms. K. Kiruthika'] }
];

const year2_students_raw = `
A2411039	NAVANEETHAN S 
A2511013	AAKASH K
A2511014	ABINAYA S
A2511015	AJAY G
A2511016	AKASH G
A2511017	AKASH S
A2511018	AKASH S
A2511019	AKILAN S R
A2511020	ANUKIRUTHIKA V
A2511021	ARSATH K
A2511022	BALA D
A2511023	BHARATH S
A2511024	BHUVANESHWARAN D
A2511025	CIRANJEVE K
A2511026	DEEPAK C
A2511027	DHARANIROOBAN R
A2511028	DHARANISH C C
A2511029	DHARSHANA S
A2511030	ELAVARASUKUMAR M
A2511031	ESHANTH S
A2511032	GIRI PRASATH V
A2511033	GIRIDHARAN M
A2511034	GIRIDHARAN R
A2511035	GOWTHAM J
A2511036	GOWTHAM S M
A2511037	HARISHKUMAR S
A2511038	IKRAMFARID M S
A2511039	JOTHI SHABANA V
A2511040	KADHIRAVAN S
A2511041	KAVIN A
A2511042	LIKCHANA V
A2511043	MANOJ A
A2511044	MEIRAJ R
A2511045	MERLIN K
A2511046	MOHAMMED AJMAL M
A2511047	MONISHA M
A2511048	NAVEEN KUMAR E
A2511050	NITHISH A
A2511051	POOJA SRI V
A2511052	PRABAKARAN C
A2511053	PRASATH C
A2511054	PRITHISH V
A2511055	RAVISANKAR T
A2511056	ROHITH S
A2511057	RUTHRESH R
A2511058	SANJAY V
A2511059	SANJAY RAHUL R
A2511060	SARO M
A2511061	SASVIN S
A2511062	SELVAMURUGAN G
A2511064	SUKESH V
A2511065	SURENDHAR S
A2511066	TAMILARASU G
A2511067	THIRUMALAI K
A2511068	VISHNU V
A2511069	YOGAVEERA C
A2511070	YOGESHWARAN S
A2511071	YOSHINI G
A2511072	YUKESH D
C2611001	GOKUL A
C2611002	PRADEEP M R
C2611003	RAJABOOPATHY V
C2611004	SRIRAM K
D2611005	MANIKANDAN B
E2611006	KAVIRAJ M
E2611007	NITHEESH S
E2611008	SWARNAKUMAR D
`;

const year3_students_raw = `
A2411008	ARUNKUMAR S
A2411009	BALAN MANI M
A2411010	DEEPAK K
A2411011	DEEPAK M
A2411012	DEVESH V
A2411013	ELANGO S
A2411014	ESHWARAN S
A2411015	GIRI G
A2411016	GOKULAKASH V
A2411017	HARIBASKAR S
A2411018	HARIHARAN D
A2411019	HARIPRASATH V
A2411020	HARISHRAJ S
A2411021	JAI ADITIYA M
A2411022	JAWAKARAN K T
A2411023	JEEVA S
A2411024	KAMALESH VIKRAM I
A2411025	KANISHKAR R
A2411026	KARTHIKEYAN M (2004)
A2411027	KARTHIKEYAN M (2008)
A2411028	KAVINESH K R
A2411030	KOWSICK S
A2411031	LITHISWARAN V S
A2411033	MANIKANDAN S
A2411034	MOHAMMED HAZZATH A
A2411036	MOULIDHARAN B
A2411037	MURALI PRASHATH A
A2411040	NAVEEN KUMAR A
A2411041	NIFAS S
A2411042	NISANTHKUMAR G
A2411044	NIYAS MOHAMED A
A2411045	PRADEEP B
A2411047	PREM S
A2411048	SABARIBALAJI K
A2411049	SAKTHIVEL S
A2411050	SALABUDHEEN S
A2411052	SANJAY G
A2411053	SANJAYKUMAR M
A2411054	SANJEEV D
A2411056	SHARAN S G
A2411057	SIRAJ R
A2411059	SREE SUDHARSAN G
A2411060	SRIRAM N
A2411061	SUDARSHAN S
A2411062	SURJITH S
A2411063	VASAN S
A2411064	VASANTHAKUMAR M
A2411065	VIGNESH V
A2411067	YOKESWARAN S
C2511001	ERAIANBU S
C2511002	GIRIMURUGAN S
C2511003	GOPI G
C2511004	HARISH P (18.02.2008)
C2511005	HARISH P (12.04.2008)
C2511006	MADHAN S
C2511007	PADMAPRIYAN B
C2511008	PRASATH P
C2511009	RAGUL P
C2511010	VISHNUKUMAR S
D2511011	DEEPAN KUMAR S
D2511012	VINOTH P
A2311031	KARAN R
A2111037	PUGALARASAN S M
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
  console.log("=== STARTING ELECTRICAL & ELECTRONICS ENGINEERING (SS) SETUP ===");

  // 1. Verify / Insert Department Record
  let dept = await client.query("SELECT * FROM departments WHERE id = $1", [eeessDeptId]);
  if (dept.rows.length === 0) {
    await client.query(`
      INSERT INTO departments (id, department_name, department_code, active)
      VALUES ($1, 'Electrical & Electronics Engineering (SS)', 'EEE-SS', true)
    `, [eeessDeptId]);
    console.log("Created department: Electrical & Electronics Engineering (SS) with ID:", eeessDeptId);
  } else {
    await client.query(`
      UPDATE departments SET department_name = 'Electrical & Electronics Engineering (SS)', department_code = 'EEE-SS', active = true
      WHERE id = $1
    `, [eeessDeptId]);
    console.log("Verified department: Electrical & Electronics Engineering (SS)");
  }

  // 2. Department Admin Auth Account & Faculty Admin Record (Username: eeess, Password: EeeSS@2026)
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  // eeess@tpt.edu.in
  let eeeSSAuth = usersData?.users?.find(u => u.email === 'eeess@tpt.edu.in');
  if (!eeeSSAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'eeess@tpt.edu.in',
      password: 'EeeSS@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating eeess auth:", error.message);
    else eeeSSAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(eeeSSAuth.id, { password: 'EeeSS@2026' });
  }

  // eeessdept@tpt.edu.in
  let eeeSSDeptAuth = usersData?.users?.find(u => u.email === 'eeessdept@tpt.edu.in');
  if (!eeeSSDeptAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'eeessdept@tpt.edu.in',
      password: 'EeeSS@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating eeessdept auth:", error.message);
    else eeeSSDeptAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(eeeSSDeptAuth.id, { password: 'EeeSS@2026' });
  }

  // Upsert faculty admin record for eeess
  const adminFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'eeess'", [eeessDeptId]);
  if (adminFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Electrical & Electronics Engineering (SS) Admin', 'eeess', $2, true)
    `, [eeessDeptId, eeeSSAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, faculty_name = 'Electrical & Electronics Engineering (SS) Admin', active = true WHERE id = $2
    `, [eeeSSAuth?.id || null, adminFacCheck.rows[0].id]);
  }

  // Upsert faculty admin record for eeessdept
  const deptFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'eeessdept'", [eeessDeptId]);
  if (deptFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Electrical & Electronics Engineering (SS) Admin', 'eeessdept', $2, true)
    `, [eeessDeptId, eeeSSDeptAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, faculty_name = 'Electrical & Electronics Engineering (SS) Admin', active = true WHERE id = $2
    `, [eeeSSDeptAuth?.id || null, deptFacCheck.rows[0].id]);
  }
  console.log("Department admin accounts verified: eeess / eeessdept (password: EeeSS@2026)");

  // 3. Batches
  // Year 2 Batch: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [eeessDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id
    `, [eeessDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for EEE-SS:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for EEE-SS:", batch2023Id);
  }

  // Year 3 Batch: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [eeessDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id
    `, [eeessDeptId]);
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for EEE-SS:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for EEE-SS:", batch2022Id);
  }

  // 4. Feedback Cycles
  // Year 2 Cycle
  let cycleYear2Id;
  const c2 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3", [eeessDeptId]);
  if (c2.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electrical & Electronics Engineering (SS) Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW()) RETURNING id
    `, [eeessDeptId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for EEE-SS:", cycleYear2Id);
  } else {
    cycleYear2Id = c2.rows[0].id;
    console.log("Existing Year 2 feedback cycle for EEE-SS:", cycleYear2Id);
  }

  // Year 3 Cycle
  let cycleYear3Id;
  const c3 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [eeessDeptId]);
  if (c3.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electrical & Electronics Engineering (SS) Year 3 Sem 5 Feedback', $1, 3, 5, null, true, NOW()) RETURNING id
    `, [eeessDeptId]);
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for EEE-SS:", cycleYear3Id);
  } else {
    cycleYear3Id = c3.rows[0].id;
    console.log("Existing Year 3 feedback cycle for EEE-SS:", cycleYear3Id);
  }

  // 5. Faculty Records (No individual logins, auth_user_id = NULL)
  // Usernames are globally unique, kkiruthikass and rpalanimathiss avoid conflict with ME-SS
  const facultyMembers = [
    { name: 'Ms. A. Rathna', cleanName: 'A. Rathna', username: 'arathna' },
    { name: 'Mr. M. Arunkumar', cleanName: 'M. Arunkumar', username: 'marunkumar' },
    { name: 'Ms. K. Sri Nandhini', cleanName: 'K. Sri Nandhini', username: 'ksrinandhini' },
    { name: 'Ms. R. Palanimathi', cleanName: 'R. Palanimathi', username: 'rpalanimathiss' },
    { name: 'Ms. K. Kiruthika', cleanName: 'K. Kiruthika', username: 'kkiruthikass' },
    { name: 'Dr. D. Mary Jeyanthi', cleanName: 'D. Mary Jeyanthi', username: 'dmaryjeyanthi' }
  ];

  const facMap = new Map();
  for (const fac of facultyMembers) {
    const check = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = $2", [eeessDeptId, fac.username]);
    let facId;
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
        VALUES ($1, $2, $3, NULL, true) RETURNING id
      `, [eeessDeptId, fac.name, fac.username]);
      facId = ins.rows[0].id;
      console.log(`Inserted faculty: ${fac.name} (${fac.username})`);
    } else {
      facId = check.rows[0].id;
      await client.query(`
        UPDATE faculty SET faculty_name = $1, auth_user_id = NULL, active = true WHERE id = $2
      `, [fac.name, facId]);
      console.log(`Updated faculty: ${fac.name} (${fac.username})`);
    }
    facMap.set(fac.name, facId);
    facMap.set(fac.cleanName, facId);
  }

  // 6. Subjects Setup
  const subMap = new Map(); // `${year}_${code}` -> id

  // Year 2 Subjects
  for (const c of year2_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 2",
      [eeessDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 2, 3, true) RETURNING id
      `, [c.code, c.name, eeessDeptId]);
      subId = ins.rows[0].id;
      console.log(`Created Year 2 subject: ${c.code} - ${c.name}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(`
        UPDATE subjects SET subject_name = $1, semester = 3, active = true WHERE id = $2
      `, [c.name, subId]);
      console.log(`Updated Year 2 subject: ${c.code} - ${c.name}`);
    }
    subMap.set(`2_${c.code}`, subId);
  }

  // Year 3 Subjects
  for (const c of year3_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 3",
      [eeessDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 3, 5, true) RETURNING id
      `, [c.code, c.name, eeessDeptId]);
      subId = ins.rows[0].id;
      console.log(`Created Year 3 subject: ${c.code} - ${c.name}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(`
        UPDATE subjects SET subject_name = $1, semester = 5, active = true WHERE id = $2
      `, [c.name, subId]);
      console.log(`Updated Year 3 subject: ${c.code} - ${c.name}`);
    }
    subMap.set(`3_${c.code}`, subId);
  }

  // 7. Faculty Subject Assignments
  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1", [eeessDeptId]);

    // Year 2 assignments
    let y2AsgCount = 0;
    for (const c of year2_courses) {
      const subId = subMap.get(`2_${c.code}`);
      for (const facName of c.facs) {
        const facId = facMap.get(facName.trim());
        if (!facId) throw new Error(`Faculty ID not found for ${facName}`);
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 2, 3, 'A', true)
        `, [eeessDeptId, facId, subId]);
        y2AsgCount++;
        console.log(`Assigned Year 2: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    // Year 3 assignments
    let y3AsgCount = 0;
    for (const c of year3_courses) {
      const subId = subMap.get(`3_${c.code}`);
      for (const facName of c.facs) {
        const facId = facMap.get(facName.trim());
        if (!facId) throw new Error(`Faculty ID not found for ${facName}`);
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 3, 5, 'A', true)
        `, [eeessDeptId, facId, subId]);
        y3AsgCount++;
        console.log(`Assigned Year 3: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    // 8. Students Setup
    const y2Students = parseStudents(year2_students_raw);
    console.log(`\nUpserting ${y2Students.length} Year 2 students for EEE-SS...`);
    let y2Count = 0;
    for (const s of y2Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, eeessDeptId, batch2023Id]);
      y2Count++;
    }
    console.log(`Saved ${y2Count} Year 2 students.`);

    const y3Students = parseStudents(year3_students_raw);
    console.log(`\nUpserting ${y3Students.length} Year 3 students for EEE-SS...`);
    let y3Count = 0;
    for (const s of y3Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 3, 5, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, eeessDeptId, batch2022Id]);
      y3Count++;
    }
    console.log(`Saved ${y3Count} Year 3 students.`);

    await client.query("COMMIT");
    console.log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("TRANSACTION ROLLED BACK DUE TO ERROR:", err);
    throw err;
  }

  // 9. Final Verification
  console.log("\n=== FINAL VERIFICATION FOR EEE (SS) DEPARTMENT ===");
  const stuSummary = await client.query(`
    SELECT year, semester, section, count(*) as student_count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year
  `, [eeessDeptId]);
  console.log("Students by Year:");
  console.table(stuSummary.rows);

  const asgSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as assignment_count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1
    GROUP BY fsa.year, fsa.semester
    ORDER BY fsa.year
  `, [eeessDeptId]);
  console.log("Assignments by Year:");
  console.table(asgSummary.rows);

  const facSummary = await client.query(`
    SELECT f.id, f.faculty_name, f.username, f.auth_user_id
    FROM faculty f
    WHERE f.department_id = $1
    ORDER BY f.username
  `, [eeessDeptId]);
  console.log("Faculty:");
  console.table(facSummary.rows);

  await client.end();
  console.log("=== EEE (SS) SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
