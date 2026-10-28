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

const peDeptId = '44444444-4444-4444-4444-444444444444';

const year2_courses = [
  { code: '240-043402', name: 'Production Technology', facs: ['S. V. Giri Prasad'] },
  { code: '240-023403', name: 'Strength of Materials', facs: ['M. Dhamotharan'] },
  { code: '240-023404', name: 'Workshop Practices', facs: ['S. Bhuvaneswari', 'M. Dhamotharan'] },
  { code: '240-023405', name: 'Industrial Drives and Control', facs: ['S. Harisabarish'] },
  { code: '240-023406', name: 'Production Drawing and Modelling', facs: ['K. Jonathan', 'S. V. Giri Prasad'] },
  { code: '240-043407', name: 'Metrology and Metallography', facs: ['S. Bhuvaneswari', 'K. Jonathan'] }
];

const year3_courses = [
  { code: '240-024408', name: 'Advanced Manufacturing Technology', facs: ['K. Jonathan'] },
  { code: '240-025415', name: 'Industrial Engineering and Management', facs: ['S. Bhuvaneswari'] },
  { code: '240-045501A', name: 'Tool Design', facs: ['K. Sreenivasan'] },
  { code: '240-025416', name: 'Maintenance, Repairs and Service', facs: ['K. Jonathan', 'S. V. Giri Prasad'] },
  { code: '240-045502A', name: 'Process Planning, Cost Estimation and SPC', facs: ['K. Sreenivasan', 'M. Dhamotharan'] },
  { code: '240-045108', name: 'Innovation and Startup', facs: ['K. Sreenivasan', 'M. Dhamotharan'] }
];

const year2_students_raw = `
A2504013	ABISHEK SRI SANTH S
A2504014	ABRARHUSAIN J
A2504015	ANBARASAN D
A2504016	BALA MURUGAN T
A2504017	DEEPAK S
A2504018	DHARSHAN M
A2504020	ELAMARAN S T
A2504021	GOKUL SRI S
A2504022	GOWSHIK L
A2504023	GOWSHIK S
A2504024	GOWTHAM G
A2504025	HARISH D
A2504026	HARISH S
A2504027	JANAA SELVA V S
A2504028	JAYARAM K
A2504029	JHAGIR HUSSAIN S
A2504030	KAVIN S
A2504031	KAVIYARASAN S
A2504032	KISHONEKUMAR P
A2504033	KISHOREKUMAR S
A2504034	LAKSHMANA S
A2504035	LINGESWAR S P
A2504036	MATHIYARASU B
A2504037	MOHAMMED MUJEEB REHMAN J
A2504038	NAGENDRAN S
A2504039	NAVEEN P
A2504040	NIRANJAN D
A2504041	NITHISH M
A2504042	PRASANNA S
A2504043	RAGUL G
A2504044	RAMNATH K S
A2504045	RISHINANDHAN V
A2504046	SABARINATHAN D
A2504047	SANJAY K
A2504048	SANJAY S
A2504049	SANKAR M M
A2504050	SANTHOSH G
A2504051	SATHYASELVAN M
A2504052	SHREEKANTH S
A2504053	SIBIRAJ V
A2504054	SIDDHARTH S
A2504056	SRI MAHAVISHNU M
A2504057	SRIDHAR M
A2504058	SRIDHARAN M
A2504059	SRIDHARSHAN S
A2504060	SUGANESH S
A2504061	SWAMINATHAN S
A2504062	TAMILSELVAN C
A2504063	THARNISH S
A2504064	UDAYAJIT H
A2504065	VASANTH R
A2504066	VETRIVEL S
A2504067	VIJAY P
A2504068	VISHAL S
A2504069	YADHAVARAJ T
A2404013	AKILESHWARAN S
C2604001	DHAMOTHARAN P
C2604002	SRIDHAR S
C2604003	THILAKESWARAN P S
C2604004	VISHNEESWAR G
D2604005	KISHORE KUMAR S
D2604006	PRAPISWAR A
E2604007	DEEPANRAJ N
E2604008	KAVINRAJ S
E2604009	KAWREESH K
E2604010	RAGHU D
`;

const year3_students_raw = `
A2404010	AASHIPKHAN J
A2404011	ABHINESH A
A2404014	BARANITHARAN V
A2404016	DEENADHYALAN M
A2404017	DEVA PRASATH S K
A2404019	DHARANEESHWARAN V
A2404020	DHARSAN B
A2404021	DHARSAN V
A2404022	DHARUNAKARSAN D
A2404023	DHINESH S
A2404024	DINESH S
A2404025	ELANGO T
A2404026	GOKUL S
A2404027	GOKULPRASANTH P
A2404028	HARIDHASH K
A2404029	HARIPRASATH C S
A2404030	HARIPRATHAB K
A2404031	JEEVANANTHAM J
A2404032	KABILAN K
A2404033	KARTHIKEYAN M
A2404035	KEERTHI VASAN R
A2404036	KEERTHIVASAN S
A2404037	KIRUTHIK LOGESH E
A2404038	KISHORE K
A2404039	KISHORERAM S
A2404040	LOGESH M
A2404041	MANIMEGALAI M
A2404043	MEIVELRAJ M
A2404044	MOHAMMED ADHIL V
A2404045	MOHISH A
A2404046	NAVEEN S
A2404047	OBULI S
A2404049	PRAVEEN S
A2404050	PRAVEENKARTHIKEYAN I
A2404051	RISHI GANESH K S
A2404052	ROHITH K
A2404053	RUTHRAN M
A2404054	SAMEERASHREE P
A2404055	SAMITHSHREE P
A2404057	SASIDHARAN S
A2404060	SIVANESH T
A2404061	SRI RAMA CHANDRAN P
A2404062	TAMILARASAN S
A2404063	THIVAGAR P
A2404067	VINOTH D
A2404068	YATHAV SRINATH S T
A2404069	YOGANANTH M
C2504001	ARUNPRASATH P
C2504002	BHARATH S
C2504003	JAGADEESH S
C2504004	JAGADESH RAO M
C2504005	KARTHIKEYAN C
C2504006	MONISH M
C2504007	SRIKANTH M
C2504008	VIGNESH R
D2504009	AADESH K A V
D2504010	ISHANTH S
D2504011	KALAIYARASAN S
D2504012	SRINEES E
A2304025	HARISH S
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
  console.log("=== STARTING PRODUCTION ENGINEERING DEPARTMENT SETUP ===");

  // 1. Department Record
  let dept = await client.query("SELECT * FROM departments WHERE id = $1", [peDeptId]);
  if (dept.rows.length === 0) {
    await client.query(`
      INSERT INTO departments (id, department_name, department_code, active)
      VALUES ($1, 'Production Engineering', 'PE', true)
    `, [peDeptId]);
    console.log("Created department: Production Engineering with ID:", peDeptId);
  } else {
    await client.query(`
      UPDATE departments SET department_name = 'Production Engineering', department_code = 'PE', active = true
      WHERE id = $1
    `, [peDeptId]);
    console.log("Verified department: Production Engineering");
  }

  // 2. Department Admin Auth Accounts & Faculty Admin Record (password: Prod@2026)
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  // proddept@tpt.edu.in
  let prodDeptAuth = usersData?.users?.find(u => u.email === 'proddept@tpt.edu.in');
  if (!prodDeptAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'proddept@tpt.edu.in',
      password: 'Prod@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating proddept auth:", error.message);
    else prodDeptAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(prodDeptAuth.id, { password: 'Prod@2026' });
  }

  // prod@tpt.edu.in
  let prodAuth = usersData?.users?.find(u => u.email === 'prod@tpt.edu.in');
  if (!prodAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'prod@tpt.edu.in',
      password: 'Prod@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating prod auth:", error.message);
    else prodAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(prodAuth.id, { password: 'Prod@2026' });
  }

  // Upsert faculty admin records
  const adminFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'proddept'", [peDeptId]);
  if (adminFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Production Engineering Admin', 'proddept', $2, true)
    `, [peDeptId, prodDeptAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [prodDeptAuth?.id || null, adminFacCheck.rows[0].id]);
  }

  const prodFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'prod'", [peDeptId]);
  if (prodFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Production Engineering Admin', 'prod', $2, true)
    `, [peDeptId, prodAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [prodAuth?.id || null, prodFacCheck.rows[0].id]);
  }
  console.log("Department admin accounts verified: proddept / prod (password: Prod@2026)");

  // 3. Batches
  // Year 2 Batch: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [peDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id
    `, [peDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for Production Engineering:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for Production Engineering:", batch2023Id);
  }

  // Year 3 Batch: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [peDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id
    `, [peDeptId]);
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for Production Engineering:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for Production Engineering:", batch2022Id);
  }

  // 4. Feedback Cycles
  // Year 2 Cycle
  let cycleYear2Id;
  const c2 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3", [peDeptId]);
  if (c2.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Production Engineering Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW()) RETURNING id
    `, [peDeptId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for Production Engineering:", cycleYear2Id);
  } else {
    cycleYear2Id = c2.rows[0].id;
    console.log("Existing Year 2 feedback cycle for Production Engineering:", cycleYear2Id);
  }

  // Year 3 Cycle
  let cycleYear3Id;
  const c3 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [peDeptId]);
  if (c3.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Production Engineering Year 3 Sem 5 Feedback', $1, 3, 5, null, true, NOW()) RETURNING id
    `, [peDeptId]);
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for Production Engineering:", cycleYear3Id);
  } else {
    cycleYear3Id = c3.rows[0].id;
    console.log("Existing Year 3 feedback cycle for Production Engineering:", cycleYear3Id);
  }

  // 5. Faculty Records (No individual logins, auth_user_id = NULL)
  const facultyMembers = [
    { name: 'S. V. Giri Prasad', username: 'svgiriprasad' },
    { name: 'M. Dhamotharan', username: 'mdhamotharan' },
    { name: 'S. Bhuvaneswari', username: 'sbhuvaneswari' },
    { name: 'S. Harisabarish', username: 'sharisabarishpe' },
    { name: 'K. Jonathan', username: 'kjonathan' },
    { name: 'K. Sreenivasan', username: 'ksreenivasan' }
  ];

  const facMap = new Map();
  for (const fac of facultyMembers) {
    const check = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = $2", [peDeptId, fac.username]);
    let facId;
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
        VALUES ($1, $2, $3, NULL, true) RETURNING id
      `, [peDeptId, fac.name, fac.username]);
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
  }

  // 6. Subjects Setup
  const subMap = new Map(); // `${year}_${code}` -> id

  // Year 2 Subjects
  for (const c of year2_courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 2",
      [peDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 2, 3, true) RETURNING id
      `, [c.code, c.name, peDeptId]);
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
      [peDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 3, 5, true) RETURNING id
      `, [c.code, c.name, peDeptId]);
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
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1", [peDeptId]);

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
        `, [peDeptId, facId, subId]);
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
        `, [peDeptId, facId, subId]);
        y3AsgCount++;
        console.log(`Assigned Year 3: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    // 8. Students Setup
    const y2Students = parseStudents(year2_students_raw);
    console.log(`\nUpserting ${y2Students.length} Year 2 students for Production Engineering...`);
    let y2Count = 0;
    for (const s of y2Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, peDeptId, batch2023Id]);
      y2Count++;
    }
    console.log(`Saved ${y2Count} Year 2 students.`);

    const y3Students = parseStudents(year3_students_raw);
    console.log(`\nUpserting ${y3Students.length} Year 3 students for Production Engineering...`);
    let y3Count = 0;
    for (const s of y3Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 3, 5, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, peDeptId, batch2022Id]);
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
  console.log("\n=== FINAL VERIFICATION FOR PRODUCTION ENGINEERING DEPARTMENT ===");
  const stuSummary = await client.query(`
    SELECT year, semester, section, count(*) as student_count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year
  `, [peDeptId]);
  console.log("Students by Year:");
  console.table(stuSummary.rows);

  const asgSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as assignment_count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1
    GROUP BY fsa.year, fsa.semester
    ORDER BY fsa.year
  `, [peDeptId]);
  console.log("Assignments by Year:");
  console.table(asgSummary.rows);

  const facSummary = await client.query(`
    SELECT f.id, f.faculty_name, f.username, f.auth_user_id, u.email
    FROM faculty f
    LEFT JOIN auth.users u ON f.auth_user_id = u.id
    WHERE f.department_id = $1
    ORDER BY f.faculty_name
  `, [peDeptId]);
  console.log("Faculty & Logins:");
  console.table(facSummary.rows);

  await client.end();
  console.log("=== PRODUCTION ENGINEERING SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
