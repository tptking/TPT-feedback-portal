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

const ttDeptId = '55555555-5555-5555-5555-555555555555';

const year2_courses = [
  { code: '240-053402', name: 'Fibre Science and Technology (FST)', facs: ['C. Jayanthi'] },
  { code: '240-053403', name: 'Technology of Yarn Formation (TYF)', facs: ['M. Mirudhula'] },
  { code: '240-053404', name: 'Technology of Fabric Formation (TFF)', facs: ['P. Ranjani'] },
  { code: '240-053405', name: 'Fibre Identification Practical (FIP)', facs: ['C. Jayanthi', 'M. Mirudhula'] },
  { code: '240-053406', name: 'Technology of Spinning Process-I (TSP-I)', facs: ['M. Mirudhula', 'C. Jayanthi'] },
  { code: '240-053407', name: 'Technology of Weaving Process-I (TWP-I)', facs: ['P. Ranjani', 'E. Vijayalakshmi'] }
];

const year3_courses = [
  { code: '240-055414', name: 'Textile Testing (TT)', facs: ['E. Vijayalakshmi'] },
  { code: '240-056502C', name: 'Textile Management and Industrial Engineering (TMIE)', facs: ['M. Sumipriya'] },
  { code: '240-055415', name: 'Textile Testing Practical (TT Practical)', facs: ['E. Vijayalakshmi', 'P. Ranjani', 'M. Sumipriya'] },
  { code: '240-055416', name: 'Garment Manufacture Technology (GMT)', facs: ['B. Munusamy', 'M. Sumipriya'] },
  { code: '240-055417', name: 'Knitting Technology (KT)', facs: ['B. Munusamy', 'P. Ranjani'] },
  { code: '240-055418', name: 'Innovation & Startup (IS)', facs: ['B. Munusamy', 'C. Jayanthi'] }
];

const year2_students_raw = `
A2405028	KESAVAN P
A2405058	SWETHA S
A2505016	AATHIRA S
A2505017	AISHWARYA S
A2505018	ANISHA KUMARI R
A2505020	ARAVINDH KUMAR G
A2505021	BEN ALWIN T
A2505023	DEEPTHI M
A2505025	DHANYA SHRIN N
A2505026	DHARANI L
A2505028	DHARUNENDRA K
A2505029	GANESH G
A2505030	GOKUL M
A2505031	GOWTHAM S
A2505033	HARIHARAN R
A2505035	JANUSHIYA H
A2505036	KAILASH J
A2505037	KANIYAN M
A2505039	KRITHIC SRI M
A2505040	MAADHAVAN R K
A2505041	MENAGA B
A2505042	MOHANRAJ B
A2505043	MOHANRAJ R
A2505044	NANDHA GOPAL M
A2505045	NAVAZ SHEREEF J
A2505046	NEERAASHREE K
A2505048	PRADHUSHA T
A2505049	PRAGADEESWARAN K
A2505050	PRASHANDHINI R
A2505051	PREM S
A2505052	PRIYADHARSHINI M
A2505053	RABIYATHULBASHIRIYA M
A2505054	RITHIK S V
A2505055	ROHITH SHARMA M
A2505056	SABARI R
A2505057	SABARIESHWARI S
A2505059	SAKTHIVEL R
A2505060	SANJANA S
A2505061	SARVESH K S
A2505062	SASIPRIYA T
A2505063	SHIVALI S
A2505064	SHREE LAKSHMI S P
A2505065	SRI DHARSIKA V K
A2505067	SRIHANTHA K
A2505068	THARANISH KISHORE M S
A2505069	VIMALDHARSHAN M
A2505070	VISHAL S
A2505071	YAZHINI S
A2505072	YESWANTH PRABHU K
C2605001	AKAASH T
C2605002	DIVAKAR S
C2605003	KANIMOZHI M
C2605004	KANISHKA G
C2605005	KAVIYA M
C2605006	POOVARASAN K
C2605007	RADHAKRISHNAN S
C2605008	RANJANI M
C2605009	RATHISHA S
C2605010	SHALINI V
C2605011	SUGUMAR M
D2605012	HARINI S
D2605013	HUSSAIN I
D2605014	JAGAN T
D2605015	LOGESH S
D2605016	MOHANAPRASATH R
D2605017	SANJAY B
D2605018	VIGNESH S
D2605019	YOGESHWARAN S
`;

const year3_students_raw = `
A2405010	AAKASH P
A2405012	ASHOK B
A2405013	BHARATHI C
A2405014	CHARAN K
A2405015	CHARLES M
A2405016	DEEPAK R
A2405017	DEVIBALA Y
A2405018	ERVIN S S
A2405021	HARISH B
A2405022	HARISH S
A2405023	JASWANTH S
A2405024	KABILESH K
A2405025	KARTHICK A
A2405027	KARTHIKEYAN M
A2405029	KIRUTHIKA P
A2405030	KOKILA K
A2405031	MENAKA S
A2405034	NIKITHA S
A2405036	PAVYASRI N S
A2405039	PRIYANGA J
A2405040	RABIYABASHRIN M
A2405043	RUBAN
A2405044	SABARINATHAN P
A2405045	SANA S
A2405047	SANJAY RAJ S
A2405048	SANTHOSH S
A2405049	SEDHU MADAV SHREE S
A2405050	SHALINI B
A2405051	SHALINY S
A2405052	SHARMITHA K
A2405053	SHIVANI R
A2405054	SOUNDAR R
A2405055	SRISANTHINI T
A2405056	SUDARINDHI J
A2405057	SUJITH S
A2405059	TAHEERA BANU H
A2405060	THANGAIAVELAVAN B
A2405064	VIGNESH K
A2405065	VIGNESHWARAN S
A2405067	YAMUNA A
A2405068	YOGALAKSHMI P
A2405069	YUKESH R
C2505001	ABUTHAYAK B
C2505002	BALAKRISHNAN M
C2505003	DHIYVA R
C2505004	GOKILA D
C2505005	GOWTHAMRAJ D
C2505006	MOHANKUMAR S
C2505007	SANJAY D
C2505009	VALARAMATHI S
D2505010	BHARATHKUMAR S
D2505011	DEIVANAI S
D2505012	GOKUL S
D2505013	HARIPREETHA S
D2505014	KAVIN K
D2505015	PRADHAP G
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
  console.log("=== STARTING TEXTILE TECHNOLOGY DEPARTMENT SETUP ===");

  // 1. Verify Department Record
  let dept = await client.query("SELECT * FROM departments WHERE id = $1", [ttDeptId]);
  if (dept.rows.length === 0) {
    await client.query(`
      INSERT INTO departments (id, department_name, department_code, active)
      VALUES ($1, 'Textile Technology', 'TT', true)
    `, [ttDeptId]);
    console.log("Created department: Textile Technology with ID:", ttDeptId);
  } else {
    await client.query(`
      UPDATE departments SET department_name = 'Textile Technology', department_code = 'TT', active = true
      WHERE id = $1
    `, [ttDeptId]);
    console.log("Verified department: Textile Technology");
  }

  // 2. Department Admin Auth Accounts & Faculty Admin Record (password: Textile@2026)
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  // textiledept@tpt.edu.in
  let textileDeptAuth = usersData?.users?.find(u => u.email === 'textiledept@tpt.edu.in');
  if (!textileDeptAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'textiledept@tpt.edu.in',
      password: 'Textile@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating textiledept auth:", error.message);
    else textileDeptAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(textileDeptAuth.id, { password: 'Textile@2026' });
  }

  // textile@tpt.edu.in
  let textileAuth = usersData?.users?.find(u => u.email === 'textile@tpt.edu.in');
  if (!textileAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'textile@tpt.edu.in',
      password: 'Textile@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating textile auth:", error.message);
    else textileAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(textileAuth.id, { password: 'Textile@2026' });
  }

  // Upsert faculty admin records
  const adminFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'textiledept'", [ttDeptId]);
  if (adminFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Textile Technology Admin', 'textiledept', $2, true)
    `, [ttDeptId, textileDeptAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [textileDeptAuth?.id || null, adminFacCheck.rows[0].id]);
  }

  const textileFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'textile'", [ttDeptId]);
  if (textileFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Textile Technology Admin', 'textile', $2, true)
    `, [ttDeptId, textileAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [textileAuth?.id || null, textileFacCheck.rows[0].id]);
  }
  console.log("Department admin accounts verified: textiledept / textile (password: Textile@2026)");

  // 3. Batches
  // Year 2 Batch: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [ttDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id
    `, [ttDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for Textile Technology:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for Textile Technology:", batch2023Id);
  }

  // Year 3 Batch: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [ttDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id
    `, [ttDeptId]);
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for Textile Technology:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for Textile Technology:", batch2022Id);
  }

  // 4. Feedback Cycles
  // Year 2 Cycle
  let cycleYear2Id;
  const c2 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3", [ttDeptId]);
  if (c2.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Textile Technology Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW()) RETURNING id
    `, [ttDeptId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for Textile Technology:", cycleYear2Id);
  } else {
    cycleYear2Id = c2.rows[0].id;
    console.log("Existing Year 2 feedback cycle for Textile Technology:", cycleYear2Id);
  }

  // Year 3 Cycle
  let cycleYear3Id;
  const c3 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [ttDeptId]);
  if (c3.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Textile Technology Year 3 Sem 5 Feedback', $1, 3, 5, null, true, NOW()) RETURNING id
    `, [ttDeptId]);
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for Textile Technology:", cycleYear3Id);
  } else {
    cycleYear3Id = c3.rows[0].id;
    console.log("Existing Year 3 feedback cycle for Textile Technology:", cycleYear3Id);
  }

  // 5. Faculty Records (No individual logins, auth_user_id = NULL)
  const facultyMembers = [
    { name: 'C. Jayanthi', username: 'cjayanthi' },
    { name: 'M. Mirudhula', username: 'mmirudhula' },
    { name: 'P. Ranjani', username: 'pranjani' },
    { name: 'E. Vijayalakshmi', username: 'evijayalakshmi' },
    { name: 'M. Sumipriya', username: 'msumipriya' },
    { name: 'B. Munusamy', username: 'bmunusamy' }
  ];

  const facMap = new Map();
  for (const fac of facultyMembers) {
    const check = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = $2", [ttDeptId, fac.username]);
    let facId;
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
        VALUES ($1, $2, $3, NULL, true) RETURNING id
      `, [ttDeptId, fac.name, fac.username]);
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
      [ttDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 2, 3, true) RETURNING id
      `, [c.code, c.name, ttDeptId]);
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
      [ttDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 3, 5, true) RETURNING id
      `, [c.code, c.name, ttDeptId]);
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
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1", [ttDeptId]);

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
        `, [ttDeptId, facId, subId]);
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
        `, [ttDeptId, facId, subId]);
        y3AsgCount++;
        console.log(`Assigned Year 3: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    // 8. Students Setup
    const y2Students = parseStudents(year2_students_raw);
    console.log(`\nUpserting ${y2Students.length} Year 2 students for Textile Technology...`);
    let y2Count = 0;
    for (const s of y2Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, ttDeptId, batch2023Id]);
      y2Count++;
    }
    console.log(`Saved ${y2Count} Year 2 students.`);

    const y3Students = parseStudents(year3_students_raw);
    console.log(`\nUpserting ${y3Students.length} Year 3 students for Textile Technology...`);
    let y3Count = 0;
    for (const s of y3Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 3, 5, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, ttDeptId, batch2022Id]);
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
  console.log("\n=== FINAL VERIFICATION FOR TEXTILE TECHNOLOGY DEPARTMENT ===");
  const stuSummary = await client.query(`
    SELECT year, semester, section, count(*) as student_count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year
  `, [ttDeptId]);
  console.log("Students by Year:");
  console.table(stuSummary.rows);

  const asgSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as assignment_count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1
    GROUP BY fsa.year, fsa.semester
    ORDER BY fsa.year
  `, [ttDeptId]);
  console.log("Assignments by Year:");
  console.table(asgSummary.rows);

  const facSummary = await client.query(`
    SELECT f.id, f.faculty_name, f.username, f.auth_user_id, u.email
    FROM faculty f
    LEFT JOIN auth.users u ON f.auth_user_id = u.id
    WHERE f.department_id = $1
    ORDER BY f.faculty_name
  `, [ttDeptId]);
  console.log("Faculty & Logins:");
  console.table(facSummary.rows);

  await client.end();
  console.log("=== TEXTILE TECHNOLOGY SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
