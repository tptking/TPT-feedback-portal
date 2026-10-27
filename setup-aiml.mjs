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

const year2_courses = [
  { code: '240-143402', name: 'IPP – Introduction to Python Programming', facs: ['A. Satish'] },
  { code: '240-143403', name: 'FDS – Fundamentals of Data Science', facs: ['V. Naveen Kumar'] },
  { code: '240-143404', name: 'PPP – Programming Paradigms with Python', facs: ['A. Satish'] },
  { code: '240-143405', name: 'OWJ – OOPS with JAVA', facs: ['V. Naveen Kumar'] },
  { code: '240-143406', name: 'IDBC – Introduction to Database Concepts', facs: ['R. Sowndarya Lakshmi'] },
  { code: '240-073407', name: 'OS – Operating Systems', facs: ['D. Shakila Banu'] }
];

const year3_courses = [
  { code: '240-145412', name: 'IAI – Introduction to AI', facs: ['R. Sowndarya Lakshmi'] },
  { code: '240-145501A', name: 'DL – Deep Learning', facs: ['D. Shakila Banu'] },
  { code: '240-145413', name: 'AIL – Artificial Intelligence Laboratory', facs: ['R. Sowndarya Lakshmi'] },
  { code: '240-145414', name: 'FML – Fundamentals of Machine Learning', facs: ['D. Shakila Banu'] },
  { code: '240-145502A', name: 'WA – Web Analytics', facs: ['A. Satish'] },
  { code: '240-075108', name: 'IS – Innovation and Startup', facs: ['A. Satish'] }
];

const year2_students_raw = `
A2514008	AARISH KUMAR S R
A2514009	ADITHYAA A
A2514010	AKSHITHA S
A2514011	BOOPALAN B
A2514012	DANUSH N
A2514013	DEEPAN V
A2514014	DHARAN R
A2514015	DHARNISH K
A2514016	DHARSHINI N
A2514017	DHARUNESH K
A2514018	DIVYA SRI S
A2514019	GOKUL S
A2514020	GOKULA KRISHNA M
A2514021	GOWTHAM S
A2514022	GURUVISHNU P
A2514023	HANEY SHEREN A C
A2514024	HANIEL ANTONY Y
A2514025	HARI BALAJI B S
A2514026	JAGANNATHAN R
A2514028	JYOSHIKA B
A2514029	KANISHKA T
A2514031	KISHORE S A
A2514032	KRITHIKROSHAN S
A2514033	LAKSHNA E
A2514034	LINGESHKUMAR S
A2514035	LOGESH S
A2514036	MAHAA SRI G
A2514037	MANTHRESH S J
A2514038	MARIA DAVID M
A2514039	MEYROOBAN N
A2514040	MINITHA PRABHU
A2514041	MIRGESH B
A2514042	MOHAMMED IRFAN MYDEEN M
A2514043	MOHAMMED SAIFULLA U K
A2514044	MOHANAVEL V G
A2514045	MOHIT CHANDRAKANT WAGHMODE
A2514046	MUGIL PRIYAN G P
A2514047	NAGAHARINI K V
A2514048	NAGULAN R
A2514049	NISHANTH K
A2514050	PADMESH E
A2514051	PARKAVI SRI A
A2514052	POOVARASAN M
A2514053	PRANESH P
A2514054	PRAVIN M
A2514055	RAZEENNUDEEN S
A2514056	RESHMA K
A2514057	REVIN BHARATHI R T
A2514058	RITIKAA S
A2514059	ROSHAN P
A2514060	SACHIN S
A2514061	SARVESHWARAN M
A2514062	SRI S
A2514063	SWETHA LAKSHMI R
A2514064	THARUNIKA SRI M
A2514065	THIRUMURUGAN P
A2514066	TUSHAR YUVARAJ MULIK
A2514067	VELU S
C2614001	BALASIDDHESWARAN M
C2614002	NADISH S A
C2614003	SADHANA P
C2614004	SHRUTHI S
C2614005	VISHAL K B
D2614006	PANIS S R
`;

const year3_students_raw = `
C2414003	DHANUSH KUMAR S
A2414010	ABDUL RAZAK K
A2414011	ABUBAKKAR SIDDIQ M
A2414012	ARISHWARAN S
A2414014	ASHIQ HUSSAIN J
A2414015	BHARATH S
A2414016	DEVANANDHAN S
A2414017	DHANVANT V
A2414019	DHARRSHINI R
A2414020	GOWTHAM KATRI PERUMAL M
A2414021	GOWTHAMRAJ V
A2414022	HARINI S
A2414024	HATSHAVARATHAN V
A2414025	JAMES G
A2414026	JANASHRUTHIKA B B
A2414027	JAYAJOTHI BALAKAN T N
A2414028	JAYASHREE A
A2414029	KAMALESH S
A2414030	KARTHIKEYAN R
A2414031	KARTHIKEYAN S
A2414032	KAVYA SHREE G
A2414033	KEERTHANA R
A2414034	KRITHICK KUMAR V
A2414035	MAHENDRAN V
A2414036	MITHUNRAJ V
A2414037	MOGITH RAJ M
A2414038	MOHAMED ASADULLAH H
A2414039	MOHAMED IRFAN A
A2414040	MOHAMMED IBRAHEEM R
A2414041	MOULIKA S
A2414042	MUGIL V
A2414044	NAVEEN V
A2414045	NAVIN D R
A2414046	PRAKALYA S K
A2414047	RAGHU RAMAN S
A2414049	RAGUL N S
A2414050	RAGUL GANDHI M
A2414051	RANJEETH KUMAR M M
A2414052	RITHIK ROSHAN M
A2414053	ROKESH HARI V
A2414054	SACHIN S G
A2414055	SAJAN S
A2414056	SANJAY R
A2414057	SANJEEVAN R G
A2414058	SARANYA DEVI S
A2414060	SASIN PRASANNA G S
A2414061	SHARVESHRAM D
A2414062	SHIWANI B
A2414063	SRINATHI S
A2414064	SUGAVANESH S
A2414065	THANISHA P
A2414066	THARUN B
A2414067	VAITHEESHWARAN V
A2414068	VIJAYANARAYANAN S
A2414069	VISWA M
C2514001	LOGAPRASANNA S
C2514002	MAHAVAISHNAVI M G
C2514003	MATHIYARASAN R
C2514004	SAM SANJAY S
C2514005	SUBARAJA S
E2514006	SHRENITHIN E
E2514007	YESHVANTH R
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
  console.log("=== STARTING AIML DEPARTMENT SETUP ===");

  // 1. Department Record
  let dept = await client.query("SELECT * FROM departments WHERE id = $1", [aimlDeptId]);
  if (dept.rows.length === 0) {
    await client.query(`
      INSERT INTO departments (id, department_name, department_code, active)
      VALUES ($1, 'Artificial Intelligence (AI) and Machine Learning', 'AIML', true)
    `, [aimlDeptId]);
    console.log("Created department: AIML with ID:", aimlDeptId);
  } else {
    await client.query(`
      UPDATE departments SET department_name = 'Artificial Intelligence (AI) and Machine Learning', department_code = 'AIML', active = true
      WHERE id = $1
    `, [aimlDeptId]);
    console.log("Verified department: AIML");
  }

  // 2. Department Admin Auth Accounts & Faculty Admin Record (password: Aiml@2026)
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  // aimldept@tpt.edu.in
  let aimlDeptAuth = usersData?.users?.find(u => u.email === 'aimldept@tpt.edu.in');
  if (!aimlDeptAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'aimldept@tpt.edu.in',
      password: 'Aiml@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating aimldept auth:", error.message);
    else aimlDeptAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(aimlDeptAuth.id, { password: 'Aiml@2026' });
  }

  // aiml@tpt.edu.in
  let aimlAuth = usersData?.users?.find(u => u.email === 'aiml@tpt.edu.in');
  if (!aimlAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'aiml@tpt.edu.in',
      password: 'Aiml@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating aiml auth:", error.message);
    else aimlAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(aimlAuth.id, { password: 'Aiml@2026' });
  }

  // Upsert faculty admin records
  const adminFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'aimldept'", [aimlDeptId]);
  if (adminFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'AI & ML Admin', 'aimldept', $2, true)
    `, [aimlDeptId, aimlDeptAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [aimlDeptAuth?.id || null, adminFacCheck.rows[0].id]);
  }

  const aimlFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'aiml'", [aimlDeptId]);
  if (aimlFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Artificial Intelligence & Machine Learning Admin', 'aiml', $2, true)
    `, [aimlDeptId, aimlAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [aimlAuth?.id || null, aimlFacCheck.rows[0].id]);
  }
  console.log("Department admin accounts verified: aimldept / aiml (password: Aiml@2026)");

  // 3. Batches
  // Year 2 Batch: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [aimlDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id
    `, [aimlDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for AIML:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for AIML:", batch2023Id);
  }

  // Year 3 Batch: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [aimlDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id
    `, [aimlDeptId]);
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for AIML:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for AIML:", batch2022Id);
  }

  // 4. Feedback Cycles
  // Year 2 Cycle
  let cycleYear2Id;
  const c2 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3", [aimlDeptId]);
  if (c2.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('AIML Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW()) RETURNING id
    `, [aimlDeptId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for AIML:", cycleYear2Id);
  } else {
    cycleYear2Id = c2.rows[0].id;
    console.log("Existing Year 2 feedback cycle for AIML:", cycleYear2Id);
  }

  // Year 3 Cycle
  let cycleYear3Id;
  const c3 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [aimlDeptId]);
  if (c3.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('AIML Year 3 Sem 5 Feedback', $1, 3, 5, null, true, NOW()) RETURNING id
    `, [aimlDeptId]);
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for AIML:", cycleYear3Id);
  } else {
    cycleYear3Id = c3.rows[0].id;
    console.log("Existing Year 3 feedback cycle for AIML:", cycleYear3Id);
  }

  // 5. Faculty Records (No individual logins, auth_user_id = NULL)
  const facultyMembers = [
    { name: 'A. Satish', username: 'asatish' },
    { name: 'V. Naveen Kumar', username: 'vnaveenkumar' },
    { name: 'R. Sowndarya Lakshmi', username: 'rsowndaryalakshmi' },
    { name: 'D. Shakila Banu', username: 'dshakilabanu' }
  ];

  const facMap = new Map();
  for (const fac of facultyMembers) {
    const check = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = $2", [aimlDeptId, fac.username]);
    let facId;
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
        VALUES ($1, $2, $3, NULL, true) RETURNING id
      `, [aimlDeptId, fac.name, fac.username]);
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
      [aimlDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 2, 3, true) RETURNING id
      `, [c.code, c.name, aimlDeptId]);
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
      [aimlDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 3, 5, true) RETURNING id
      `, [c.code, c.name, aimlDeptId]);
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
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1", [aimlDeptId]);

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
        `, [aimlDeptId, facId, subId]);
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
        `, [aimlDeptId, facId, subId]);
        y3AsgCount++;
        console.log(`Assigned Year 3: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    // 8. Students Setup
    const y2Students = parseStudents(year2_students_raw);
    console.log(`\nUpserting ${y2Students.length} Year 2 students for AIML...`);
    let y2Count = 0;
    for (const s of y2Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, aimlDeptId, batch2023Id]);
      y2Count++;
    }
    console.log(`Saved ${y2Count} Year 2 students.`);

    const y3Students = parseStudents(year3_students_raw);
    console.log(`\nUpserting ${y3Students.length} Year 3 students for AIML...`);
    let y3Count = 0;
    for (const s of y3Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 3, 5, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, aimlDeptId, batch2022Id]);
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
  console.log("\n=== FINAL VERIFICATION FOR AIML DEPARTMENT ===");
  const stuSummary = await client.query(`
    SELECT year, semester, section, count(*) as student_count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year
  `, [aimlDeptId]);
  console.log("Students by Year:");
  console.table(stuSummary.rows);

  const asgSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as assignment_count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1
    GROUP BY fsa.year, fsa.semester
    ORDER BY fsa.year
  `, [aimlDeptId]);
  console.log("Assignments by Year:");
  console.table(asgSummary.rows);

  const facSummary = await client.query(`
    SELECT f.id, f.faculty_name, f.username, f.auth_user_id, u.email
    FROM faculty f
    LEFT JOIN auth.users u ON f.auth_user_id = u.id
    WHERE f.department_id = $1
    ORDER BY f.faculty_name
  `, [aimlDeptId]);
  console.log("Faculty & Logins:");
  console.table(facSummary.rows);

  await client.end();
  console.log("=== AIML SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
