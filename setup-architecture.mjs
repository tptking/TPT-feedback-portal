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

const archDeptId = '99999999-9999-9999-9999-999999999999';

const year2_courses = [
  { code: '240-153402', name: 'History of Architecture-I', facs: ['S. Surya'] },
  { code: '240-153403', name: 'Building Materials', facs: ['T. Renuka'] },
  { code: '240-153404', name: 'Surveying', facs: ['G. Alamelu'] },
  { code: '240-153309', name: 'Architectural Drawing-II', facs: ['M. Jegadeeswaran'] },
  { code: '240-153405', name: 'Architectural Design Studio-I', facs: ['S. Surya'] },
  { code: '240-153406', name: 'Computer Studio in Architecture-I', facs: ['T. Renuka'] },
  { code: '240-153407', name: 'Building Construction and Detailing-I', facs: ['G. Alamelu'] }
];

const year3_courses = [
  { code: '240-155415', name: 'Structural Design (SD)', facs: ['G. Alamelu'] },
  { code: '240-155416', name: 'Quantity Surveying and Cost Estimation (QSCE)', facs: ['S. Surya', 'P. Venugopal'] },
  { code: '240-155501A', name: 'Theory of Design (ToD)', facs: ['M. Jegadeeswaran'] },
  { code: '240-155417', name: 'Architectural Design Studio-III (ADS-III)', facs: ['T. Renuka'] },
  { code: '240-155418', name: 'Computer Studio in Architecture-III (CSA-III)', facs: ['M. Jegadeeswaran'] },
  { code: '240-155502A', name: 'Architecture Model Making (AMM)', facs: ['M. Jegadeeswaran'] },
  { code: '240-155108', name: 'Innovation and Start-up (I&S)', facs: ['S. Surya'] }
];

const year2_students_raw = `
A2415012	LOGESH D
A2415038	YOGARAJ S
A2515002	ADHITHYA S
A2515003	AJAI K
A2515004	ASWIN G
A2515005	ASWIN KUMAR R
A2515006	BHARANISHARMA M
A2515008	DHATCHINAMOORTHI C
A2515009	DINESH S
A2515010	DOMESH S
A2515012	HASIS S
A2515013	JAYAPERARASU S
A2515014	JEEVAKRISHNAN M
A2515016	KAVIYARASU C
A2515017	KIRTHIKA Y
A2515018	KISHORE S
A2515019	KISHORE KUMAR A
A2515020	KOWSHIK S
A2515021	LINDUM TANIA
A2515022	MOHAMED NOWFAL A
A2515024	MONISH KUMAR K
A2515025	NAVISAL D
A2515027	NIVEDITAA M
A2515029	POOVARASAN P
A2515030	RAGU R
A2515032	ROHID S P
A2515033	SABARI S
A2515034	SAHUL S
A2515035	SANGESH S
A2515037	SRIVISHNU I
A2515038	SYED SHAMEER S I
`;

const year3_students_raw = `
A2415001	ABIRAMI P
A2415002	BHARANI K
A2415004	DHANUSU K
A2415006	GOWTHAM M
A2415007	HEMAPRIYA M
A2415008	JAYA SURYA A
A2415009	JERUSHA SUBI Y S
A2415010	KARTHIK R
A2415011	KAVIPRIYA V
A2415013	MAHEMA M
A2415014	MOHAMED SHIFAN M
A2415016	NAGUL R
A2415017	NANDIKA J S
A2415018	NAVEEN K
A2415019	NISHA V
A2415020	NITHISH S
A2415021	NITUL T
A2415022	PASUPATHI S
A2415023	PERIYASAMY M
A2415024	POORNISHAA S
A2415025	PRAVIN B P
A2415026	PREM KANNAN C
A2415027	RAGHUL A
A2415029	SANTHOSH S
A2415031	SRIDHAR K
A2415032	SUBASRI K
A2415033	SUHANTHAN M S
A2415034	SUNDARAMOORTHY K
A2415037	THARUN S
A2415039	YOGESHWARAN S
A2415040	YOGHANANDH R
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
  console.log("=== STARTING ARCHITECTURE DEPARTMENT SETUP ===");

  // 1. Department Record
  let dept = await client.query("SELECT * FROM departments WHERE id = $1", [archDeptId]);
  if (dept.rows.length === 0) {
    await client.query(`
      INSERT INTO departments (id, department_name, department_code, active)
      VALUES ($1, 'Architecture', 'AR', true)
    `, [archDeptId]);
    console.log("Created department: Architecture (AR) with ID:", archDeptId);
  } else {
    await client.query(`
      UPDATE departments SET department_name = 'Architecture', department_code = 'AR', active = true
      WHERE id = $1
    `, [archDeptId]);
    console.log("Updated department: Architecture (AR)");
  }

  // 2. Department Admin Auth Accounts & Faculty Admin Record
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  // archdept@tpt.edu.in
  let archDeptAuth = usersData?.users?.find(u => u.email === 'archdept@tpt.edu.in');
  if (!archDeptAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'archdept@tpt.edu.in',
      password: 'Arch@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating archdept auth:", error.message);
    else archDeptAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(archDeptAuth.id, { password: 'Arch@2026' });
  }

  // arch@tpt.edu.in (also enable with Arch@2026)
  let archAuth = usersData?.users?.find(u => u.email === 'arch@tpt.edu.in');
  if (!archAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'arch@tpt.edu.in',
      password: 'Arch@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating arch auth:", error.message);
    else archAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(archAuth.id, { password: 'Arch@2026' });
  }

  // Upsert admin faculty records
  const adminFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'archdept'", [archDeptId]);
  if (adminFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Architecture Admin', 'archdept', $2, true)
    `, [archDeptId, archDeptAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [archDeptAuth?.id || null, adminFacCheck.rows[0].id]);
  }

  const archFacCheck = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'arch'", [archDeptId]);
  if (archFacCheck.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Architecture Admin', 'arch', $2, true)
    `, [archDeptId, archAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, active = true WHERE id = $2
    `, [archAuth?.id || null, archFacCheck.rows[0].id]);
  }
  console.log("Department admin accounts verified: archdept / arch (password: Arch@2026)");

  // 3. Batches
  // Year 2 Batch: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [archDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id
    `, [archDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for Architecture:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for Architecture:", batch2023Id);
  }

  // Year 3 Batch: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [archDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id
    `, [archDeptId]);
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for Architecture:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for Architecture:", batch2022Id);
  }

  // 4. Feedback Cycles
  // Year 2 Cycle
  let cycleYear2Id;
  const c2 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3", [archDeptId]);
  if (c2.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Architecture Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW()) RETURNING id
    `, [archDeptId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for Architecture:", cycleYear2Id);
  } else {
    cycleYear2Id = c2.rows[0].id;
    console.log("Existing Year 2 feedback cycle for Architecture:", cycleYear2Id);
  }

  // Year 3 Cycle
  let cycleYear3Id;
  const c3 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [archDeptId]);
  if (c3.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Architecture Year 3 Sem 5 Feedback', $1, 3, 5, null, true, NOW()) RETURNING id
    `, [archDeptId]);
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for Architecture:", cycleYear3Id);
  } else {
    cycleYear3Id = c3.rows[0].id;
    console.log("Existing Year 3 feedback cycle for Architecture:", cycleYear3Id);
  }

  // 5. Faculty Records (No individual logins, auth_user_id = NULL)
  const facultyMembers = [
    { name: 'S. Surya', username: 'ssurya' },
    { name: 'T. Renuka', username: 'trenuka' },
    { name: 'G. Alamelu', username: 'galamelu' },
    { name: 'M. Jegadeeswaran', username: 'mjegadeeswaran' },
    { name: 'P. Venugopal', username: 'pvenugopal' }
  ];

  const facMap = new Map();
  for (const fac of facultyMembers) {
    const check = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = $2", [archDeptId, fac.username]);
    let facId;
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
        VALUES ($1, $2, $3, NULL, true) RETURNING id
      `, [archDeptId, fac.name, fac.username]);
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
      [archDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 2, 3, true) RETURNING id
      `, [c.code, c.name, archDeptId]);
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
      [archDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 3, 5, true) RETURNING id
      `, [c.code, c.name, archDeptId]);
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
    // Clear old assignments if any
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1", [archDeptId]);

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
        `, [archDeptId, facId, subId]);
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
        `, [archDeptId, facId, subId]);
        y3AsgCount++;
        console.log(`Assigned Year 3: ${c.code} (${c.name}) -> ${facName}`);
      }
    }

    // 8. Students Setup
    const y2Students = parseStudents(year2_students_raw);
    console.log(`\nUpserting ${y2Students.length} Year 2 students for Architecture...`);
    let y2Count = 0;
    for (const s of y2Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, archDeptId, batch2023Id]);
      y2Count++;
    }
    console.log(`Saved ${y2Count} Year 2 students.`);

    const y3Students = parseStudents(year3_students_raw);
    console.log(`\nUpserting ${y3Students.length} Year 3 students for Architecture...`);
    let y3Count = 0;
    for (const s of y3Students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 3, 5, 'A', true)
        ON CONFLICT (register_number)
        DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
      `, [s.regNo, s.name, archDeptId, batch2022Id]);
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
  console.log("\n=== FINAL VERIFICATION FOR ARCHITECTURE DEPARTMENT ===");
  const stuSummary = await client.query(`
    SELECT year, semester, section, count(*) as student_count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year
  `, [archDeptId]);
  console.log("Students by Year:");
  console.table(stuSummary.rows);

  const asgSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as assignment_count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1
    GROUP BY fsa.year, fsa.semester
    ORDER BY fsa.year
  `, [archDeptId]);
  console.log("Assignments by Year:");
  console.table(asgSummary.rows);

  const facSummary = await client.query(`
    SELECT f.id, f.faculty_name, f.username, f.auth_user_id, u.email
    FROM faculty f
    LEFT JOIN auth.users u ON f.auth_user_id = u.id
    WHERE f.department_id = $1
    ORDER BY f.faculty_name
  `, [archDeptId]);
  console.log("Faculty & Logins:");
  console.table(facSummary.rows);

  await client.end();
  console.log("=== ARCHITECTURE SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
