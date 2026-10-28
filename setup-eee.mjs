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

const year2_courses = [
  { code: '240-033401', name: 'Electrical Machines I', facs: ['Mr. M. A. Suresh Babu', 'Ms. T. Kanimozhi'] },
  { code: '240-033402', name: 'Electrical Circuit Theory', facs: ['Mr. P. Udhayakumar'] },
  { code: '240-033403', name: 'Sensors and Measurement', facs: ['Ms. T. Kanimozhi', 'Mr. P. Jayakumar'] },
  { code: '240-033404', name: 'Analog and Digital Electronics', facs: ['Mr. P. Udhayakumar', 'Dr. K. Senathipathi'] },
  { code: '240-033301', name: 'Programming in C', facs: ['Dr. K. Senathipathi', 'Ms. G. Kavitha'] },
  { code: '240-033405', name: 'Electrical Machines-I Practical', facs: ['Ms. G. Kavitha', 'Mr. M. A. Suresh Babu'] }
];

const year3_courses = [
  { code: '240-035412', name: 'Power System Protection & Utilization', facs: ['Mr. P. Jayakumar', 'Ms. T. Kanimozhi'] },
  { code: '240-035413', name: 'Electric Vehicle Technology', facs: ['Ms. G. Kavitha'] },
  { code: '240-035414', name: 'Power Electronics', facs: ['Mr. M. A. Suresh Babu', 'Mr. P. Udhayakumar'] },
  { code: '240-035415', name: 'PLC & Automation', facs: ['Mr. P. Jayakumar', 'Ms. T. Kanimozhi'] },
  { code: '240-035501', name: 'Control of Electrical Machines', facs: ['Mr. P. Jayakumar', 'Ms. G. Kavitha'] },
  { code: '240-035101', name: 'Innovation & Start-ups', facs: ['Dr. K. Senathipathi', 'Mr. M. A. Suresh Babu'] }
];

const year2_students_raw = `
A2503008	ANBUSELVAN K
A2503009	ANIRUTHAN A
A2503010	AVILNATHAN M
A2503011	BALAJI S
A2503012	DEEPITHAN P
A2503013	DENNISH RAJ A
A2503014	DEVAKKI B
A2503015	DHARANEESH S
A2503016	DHARANESH J
A2503017	DHARANIDHARAN K S
A2503018	DHARSIKA K
A2503019	DHARUNKUMAR M
A2503020	DHAYANEESHWAR S
A2503021	DILIPRAJ S
A2503022	DINESH J
A2503023	HARINI V
A2503024	JAGAN RUDRA A
A2503025	KARTHIKEYAN D
A2503026	KAVITHA SRI V
A2503027	KRISHNA A G
A2503028	KRISHNAN S
A2503029	LAKSHMANAN V
A2503030	LATHIKA SRI K
A2503031	MADHAN P
A2503032	MALLISHAM C M
A2503033	MANOJ S
A2503035	MOKSHANAND V G
A2503036	MOULIDHARAN M
A2503037	MUBASHRAA S
A2503038	NANISHQ I
A2503039	NAVEEN KUMAR P
A2503040	NILAVALAGAN T
A2503041	POOJAVARTHINI K
A2503042	POONTHALINI B C
A2503043	PRADEEPAN S
A2503044	PRAJITH B
A2503045	PRAVEEN N
A2503046	RAGULAN K
A2503047	RAVIVARMA V
A2503048	RISHIKESAN S
A2503049	ROHAN R
A2503050	RUPESH B
A2503051	SABARINATHAN R
A2503052	SABARISWARAN T M
A2503053	SACHIN M
A2503054	SAKTHIVEL K V
A2503055	SARVESH T
A2503056	SHARWIN P R
A2503057	SHEELA S
A2503058	SHIRINIWASAN P
A2503059	SHREE PRAVEENA L
A2503060	SRI KANDES KUMAR M
A2503061	SRINIVAS S
A2503062	THARUN VISHNU G
A2503063	VEERRAMOHANTH S
A2503064	VIBIN G
A2503065	VINNAVAN T R
A2503066	YALINI P
A2503067	YASWANTHA A
C2603001	AKSAYAKUMAR M R
C2603002	ARUNKARTHI R M
C2603003	DHIVESH M
C2603004	ROSHINI V
C2603005	RUHENDIRAN K
C2603006	SRIVISHNUVARDHAN M
D2603007	RITHUVIKH B G
A2403021	DHEENA P A
`;

const year3_students_raw = `
A2403010	AKASH E
A2403011	ARIKRISH V
A2403012	ARIPRASANNA J
A2403013	ASWANTH S
A2403014	AVINASH S
A2403015	BALABHARATHI R
A2403016	BOOPATHI R
A2403017	CHANDRU K
A2403018	DEEPAN V
A2403019	DHANUSH R
A2403020	DHAVEETHU RAJA J
A2403023	DHOSHITH N S
A2403024	DURESH S
A2403025	GOWRISANKAR K V
A2403026	GOWTHAM V
A2403027	GOWTHAMRAJ M
A2403028	HARIHARAN M
A2403029	HARIPRAKASH R
A2403030	HEMA SHREE B
A2403031	INBATHAMIZHANM P
A2403032	JAIWANTH R
A2403033	JAMUNASHRI V
A2403034	JANANI C
A2403035	KAMALESWARA G
A2403036	KANISHKAR N
A2403037	KISHORE J E
A2403038	KOVARDHAN N P
A2403039	KOWSIK M
A2403040	LOGITH M
A2403041	LOHITA S
A2403042	MOHAMMED IRFAN M
A2403043	MOHAN S
A2403044	MOHITH SURYA M
A2403045	MONIKA A
A2403046	MUHAMED ARIF A
A2403047	MUKESH KRISHNA Y
A2403048	NARMADHA C
A2403049	NAZEEM AKTHAR N
A2403050	PAVAN R
A2403051	PRAVEENKUMAR S
A2403052	PRIYADHARSHINI S
A2403053	PUGAL M
A2403054	RAVISH M K
A2403055	ROHITH B
A2403056	SANJAY S
A2403057	SANJAY DEV K
A2403058	SANTHOSHKUMAR R
A2403059	SATHYAN V G
A2403060	SUDHAN BALAJI M V
A2403061	SUMAN B
A2403062	SUSANTH M
A2403064	THARANITHARAN M T
A2403065	THARSHYAN K S
A2403066	THARUN A
A2403067	THIVISH S
A2403068	THULASIDHARAN K K
A2403069	VISHAL S K
C2503001	ABISHEK P
C2503002	DEENA M
C2503003	HARINESH R M
C2503004	NARENSRI V
C2503005	VIKASHSABARI N M
D2503006	NEELAVENI S
E2503007	THARUN R
A2303035	KISHORE J
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
  console.log("=== STARTING ELECTRICAL & ELECTRONICS ENGINEERING (AIDED) SETUP ===");

  // 1. Verify Department Record
  let dept = await client.query("SELECT * FROM departments WHERE id = $1", [eeeDeptId]);
  if (dept.rows.length === 0) {
    await client.query(`
      INSERT INTO departments (id, department_name, department_code, active)
      VALUES ($1, 'Electrical & Electronics Engineering (Aided)', 'EEE-AIDED', true)
    `, [eeeDeptId]);
    console.log("Created department: Electrical & Electronics Engineering (Aided) with ID:", eeeDeptId);
  } else {
    await client.query(`
      UPDATE departments SET department_name = 'Electrical & Electronics Engineering (Aided)', department_code = 'EEE-AIDED', active = true
      WHERE id = $1
    `, [eeeDeptId]);
    console.log("Verified department: Electrical & Electronics Engineering (Aided)");
  }

  // 2. Department Admin Auth Account & Faculty Admin Record (Username: eeeaided, Password: EeeAided@2026)
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  // eeeaided@tpt.edu.in
  let eeeAidedAuth = usersData?.users?.find(u => u.email === 'eeeaided@tpt.edu.in');
  if (!eeeAidedAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'eeeaided@tpt.edu.in',
      password: 'EeeAided@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating eeeaided auth:", error.message);
    else eeeAidedAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(eeeAidedAuth.id, { password: 'EeeAided@2026' });
  }

  // Upsert faculty admin record for eeeaided
  const adminFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'eeeaided'", [eeeDeptId]);
  if (adminFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Electrical & Electronics Engineering (Aided) Admin', 'eeeaided', $2, true)
    `, [eeeDeptId, eeeAidedAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, faculty_name = 'Electrical & Electronics Engineering (Aided) Admin', active = true WHERE id = $2
    `, [eeeAidedAuth?.id || null, adminFacCheck.rows[0].id]);
  }

  // Remove old eee / eeedept faculty records
  await client.query("DELETE FROM faculty WHERE department_id = $1 AND username IN ('eee', 'eeedept')", [eeeDeptId]);
  console.log("Department admin account verified: eeeaided (password: EeeAided@2026)");

  // 3. Batches
  // Year 2 Batch: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [eeeDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id
    `, [eeeDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for EEE:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for EEE:", batch2023Id);
  }

  // Year 3 Batch: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [eeeDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id
    `, [eeeDeptId]);
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for EEE:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for EEE:", batch2022Id);
  }

  // 4. Feedback Cycles
  // Year 2 Cycle
  let cycleYear2Id;
  const c2 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3", [eeeDeptId]);
  if (c2.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electrical & Electronics Engineering Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW()) RETURNING id
    `, [eeeDeptId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for EEE:", cycleYear2Id);
  } else {
    cycleYear2Id = c2.rows[0].id;
    console.log("Existing Year 2 feedback cycle for EEE:", cycleYear2Id);
  }

  // Year 3 Cycle
  let cycleYear3Id;
  const c3 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [eeeDeptId]);
  if (c3.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electrical & Electronics Engineering Year 3 Sem 5 Feedback', $1, 3, 5, null, true, NOW()) RETURNING id
    `, [eeeDeptId]);
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for EEE:", cycleYear3Id);
  } else {
    cycleYear3Id = c3.rows[0].id;
    console.log("Existing Year 3 feedback cycle for EEE:", cycleYear3Id);
  }

  // 5. Faculty Records (No individual logins, auth_user_id = NULL)
  const facultyMembers = [
    { name: 'Mr. M. A. Suresh Babu', cleanName: 'M. A. Suresh Babu', username: 'masureshbabu' },
    { name: 'Ms. T. Kanimozhi', cleanName: 'T. Kanimozhi', username: 'tkanimozhi' },
    { name: 'Mr. P. Udhayakumar', cleanName: 'P. Udhayakumar', username: 'pudhayakumar' },
    { name: 'Mr. P. Jayakumar', cleanName: 'P. Jayakumar', username: 'pjayakumar' },
    { name: 'Dr. K. Senathipathi', cleanName: 'K. Senathipathi', username: 'ksenathipathi' },
    { name: 'Ms. G. Kavitha', cleanName: 'G. Kavitha', username: 'gkavitha' }
  ];

  const facMap = new Map();
  for (const fac of facultyMembers) {
    const check = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = $2", [eeeDeptId, fac.username]);
    let facId;
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
        VALUES ($1, $2, $3, NULL, true) RETURNING id
      `, [eeeDeptId, fac.name, fac.username]);
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
      [eeeDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 2, 3, true) RETURNING id
      `, [c.code, c.name, eeeDeptId]);
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
      [eeeDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 3, 5, true) RETURNING id
      `, [c.code, c.name, eeeDeptId]);
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
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1", [eeeDeptId]);

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
        `, [eeeDeptId, facId, subId]);
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
        `, [eeeDeptId, facId, subId]);
        y3AsgCount++;
        console.log(`Assigned Year 3: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    // 8. Students Setup
    const y2Students = parseStudents(year2_students_raw);
    console.log(`\nUpserting ${y2Students.length} Year 2 students for EEE...`);
    let y2Count = 0;
    for (const s of y2Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, eeeDeptId, batch2023Id]);
      y2Count++;
    }
    console.log(`Saved ${y2Count} Year 2 students.`);

    const y3Students = parseStudents(year3_students_raw);
    console.log(`\nUpserting ${y3Students.length} Year 3 students for EEE...`);
    let y3Count = 0;
    for (const s of y3Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 3, 5, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, eeeDeptId, batch2022Id]);
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
  console.log("\n=== FINAL VERIFICATION FOR EEE (AIDED) DEPARTMENT ===");
  const stuSummary = await client.query(`
    SELECT year, semester, section, count(*) as student_count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year
  `, [eeeDeptId]);
  console.log("Students by Year:");
  console.table(stuSummary.rows);

  const asgSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as assignment_count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1
    GROUP BY fsa.year, fsa.semester
    ORDER BY fsa.year
  `, [eeeDeptId]);
  console.log("Assignments by Year:");
  console.table(asgSummary.rows);

  const facSummary = await client.query(`
    SELECT f.id, f.faculty_name, f.username, f.auth_user_id, u.email
    FROM faculty f
    LEFT JOIN auth.users u ON f.auth_user_id = u.id
    WHERE f.department_id = $1
    ORDER BY f.faculty_name
  `, [eeeDeptId]);
  console.log("Faculty & Logins:");
  console.table(facSummary.rows);

  await client.end();
  console.log("=== EEE (AIDED) SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
