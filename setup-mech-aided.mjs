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

const year2_students_raw = `
A2502008		AARYAN K
A2502009		ANEESH S
A2502010		ANISH SELVAN S
A2502011		ARUNRAJ K
A2502012		ATHISELVAM A
A2502013		AVINESH KUMAR S
A2502014		BALAJI P M
A2502015		BATHMA VISHNU S
A2502016		DATCHANAMOORTHY C
A2502017		DEEPAGANESH P
A2502018		DHANASREE V
A2502019		DHARANIDHARAN M
A2502020		DHARNEESWARAN G
A2502021		GURUBALAJI A R
A2502022		HARI A
A2502023		ILAYABHARATHI S V
A2502024		INPARASU K
A2502025		JEEVA S
A2502026		JEEVANYA A
A2502027		KARTHIKEYAN S
A2502028		KATHIRAVAN S
A2502029		KAVIN B
A2502030		KAVIN M
A2502031		KISHORE K
A2502032		MADHANKUMAR P
A2502033		MAKUDESVARAN S
A2502034		MANIKANDAN N
A2502035		MONIESH S
A2502037		NAREN G S
A2502038		NARENKUMAR M
A2502039		NISHANTH M
A2502040		POOJA S
A2502041		PRANITH VEL KARTHIKEYAN
A2502042		PRASANNA M
A2502043		PRASITH R
A2502044		RETHISH A
A2502045		RISHIKESH S
A2502046		RUBIN V
A2502047		SABARI KESAVAN
A2502048		SABARINATHAN S
A2502049		SANGAMITHRA R
A2502050		SANJAI S
A2502051		SANJAY S
A2502052		SANTHOSH S
A2502053		SATHISHWARAN A
A2502054		SHAI PRIYA R
A2502055		SRINITHISH G
A2502056		SURYA G
A2502057		SYED REHAN A R
A2502058		TAMILARASU T
A2502059		THARUN B
A2502060		THRISHIKA S
A2502061		VIDHARSHAN G.R
A2502062		VINEETH RAJ K
A2502063		VINOTH S
A2502064		VINOTH S
A2502065		VISHNU S
A2502066		VISHWAJITH E .G
A2502067		YOGESHPAVITHRAN M S
C2602001		JEEVA S
C2602002		LOGITH M
C2602003		PHAVADHARANI G
C2602004		VISHNUPRASATH S
D2602005		KIRUBAKARAN K
D2602006		SASIKUMAR G
D2602007		THARUNRAJ B A
`;

const year3_students_raw = `
A2402008	BALAJI R
A2402009	BHARATHKANNAN V
A2402010	CHANDRANITHI M
A2402011	DEEPAK S
A2402012	DHAKSHINAMOORTHY K M
A2402013	DHARANISH A
A2402014	DHARSHAA S S
A2402015	DHARSHINI K
A2402016	DHISNUKKUMAR K
A2402017	DINESHKUMAR T
A2402018	GOKUL P
A2402019	GOKULPRASATH V
A2402020	JAI AKASH A
A2402021	JAYAPRABU G
A2402022	JEEVITH N
A2402023	KAMALNATH K
A2402024	KANJOOL MAAREFBAA M
A2402025	KANU KRISHNAN G
A2402027	KATHIR SELVAN K
A2402028	KAVINRAJ A S
A2402029	KIRTHICK R
A2402030	KISHORE M
A2402031	KISHORE V
A2402032	KISHORE KUMAR S
A2402033	KOWSICK A
A2402034	KOWSIGAN D
A2402035	LAKSHMAN K
A2402036	LOKESH R
A2402037	MANIKANDAN S
A2402038	MANOJ R
A2402039	MOULI K
A2402040	MOWLISHANKAR K
A2402041	MUBARAK BASHA K
A2402042	MURALIDHARAN K
A2402043	MUTHUKRISHNA N
A2402044	NARESH R
A2402045	NITHEESWARAN S
A2402046	NITHIN BALAJI R
A2402047	PRADEEP C M
A2402048	PRASANNA V
A2402049	PRAWIN D
A2402050	PREMA G
A2402051	RAGHUL V J
A2402052	RANJAN N
A2402053	RANJAN S
A2402054	RATHEESH A
A2402055	RISHIKUMAR V
A2402056	ROHITH S
A2402057	SANJESHWARAN P E
A2402059	SHRICHARULATHA S V
A2402060	SUBHISHWARRAN D
A2402061	TAMILARASAN C
A2402062	THARANI KISHORE B
A2402063	VAITHEESHWARAN J
A2402064	VIKASHKANTH V
A2402065	VINAL S
A2402067	YASIKA V M
C2502001	DHILIP S
C2502002	LOGESH R
C2502003	YUVAN BALAJI P
D2502004	HARI K S
D2502005	RAGAVAN G
E2502006	VEERAMANIKANDAN G
`;

// Helper: parse student lines
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

// Year 2 Courses
const year2Courses = [
  { code: '240-023402', name: 'Manufacturing Process', facs: ['Dr. A. Kannan'] },
  { code: '240-023403', name: 'Strength of Materials', facs: ['Dr. A. Kannan', 'Dr. B. Selvakumar'] },
  { code: '240-023404', name: 'Workshop Practices', facs: ['Dr. A. Kanakaraj', 'Dr. C. Prabhu'] },
  { code: '240-023405', name: 'Industrial Drives and Control', facs: ['Mr. S. Harisabarish'] },
  { code: '240-023406', name: 'Production Drawing and Modeling', facs: ['Mr. G. Maniraj'] },
  { code: '240-023407', name: 'Machine Tool Technology', facs: ['Dr. P. Ganapathi', 'Dr. C. Prabhu'] }
];

// Year 3 Courses
const year3Courses = [
  { code: '240-025414', name: 'Elements of Machine Design', facs: ['Mr. G. Maniraj'] },
  { code: '240-025415', name: 'Industrial Engineering and Management', facs: ['Dr. A. Kanakaraj', 'Dr. A. Kannan'] },
  { code: '240-025501A', name: 'Refrigeration and Air Conditioning', facs: ['Dr. B. Selvakumar', 'Dr. P. Ganapathi'] },
  { code: '240-025416', name: 'Maintenance, Repairs & Service', facs: ['Dr. B. Selvakumar', 'Dr. P. Ganapathi'] },
  { code: '240-025502A', name: 'Process Automation', facs: ['Dr. A. Kannan', 'Mr. G. Maniraj'] },
  { code: '240-025108', name: 'Innovation and Startup', facs: ['Dr. P. Ganapathi'] }
];

async function main() {
  await client.connect();
  console.log("=== STARTING MECHANICAL ENGINEERING (AIDED) SETUP ===");

  // 1. Department
  const aidedDeptId = '22222222-2222-2222-2222-222222222222';
  const deptRes = await client.query("SELECT id, department_name, department_code FROM departments WHERE id = $1", [aidedDeptId]);
  if (deptRes.rows.length === 0) {
    throw new Error("Mechanical Engineering (Aided) department with ID 22222222-2222-2222-2222-222222222222 not found!");
  }
  console.log(`Department verified: ${deptRes.rows[0].department_name} (${deptRes.rows[0].department_code})`);

  // 2. Batches
  // Year 2: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [aidedDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(
      "INSERT INTO batches (department_id, batch_name, start_year, end_year, active) VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id",
      [aidedDeptId]
    );
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for ME-AIDED:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for ME-AIDED:", batch2023Id);
  }

  // Year 3: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [aidedDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(
      "INSERT INTO batches (department_id, batch_name, start_year, end_year, active) VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id",
      [aidedDeptId]
    );
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for ME-AIDED:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for ME-AIDED:", batch2022Id);
  }

  // 3. Feedback Cycles
  // Year 2 Sem 3 Cycle
  let cycleYear2Id;
  const c2Res = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3",
    [aidedDeptId]
  );
  if (c2Res.rows.length === 0) {
    const ins = await client.query(
      "INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date) VALUES ($1, $2, 2, 3, null, true, NOW()) RETURNING id",
      ['Mechanical (Aided) Year 2 Sem 3 Feedback', aidedDeptId]
    );
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for ME-AIDED:", cycleYear2Id);
  } else {
    cycleYear2Id = c2Res.rows[0].id;
    console.log("Existing Year 2 feedback cycle for ME-AIDED:", cycleYear2Id);
  }

  // Year 3 Sem 5 Cycle
  let cycleYear3Id;
  const c3Res = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5",
    [aidedDeptId]
  );
  if (c3Res.rows.length === 0) {
    const ins = await client.query(
      "INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date) VALUES ($1, $2, 3, 5, null, true, NOW()) RETURNING id",
      ['Mechanical (Aided) Year 3 Sem 5 Feedback', aidedDeptId]
    );
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for ME-AIDED:", cycleYear3Id);
  } else {
    cycleYear3Id = c3Res.rows[0].id;
    console.log("Existing Year 3 feedback cycle for ME-AIDED:", cycleYear3Id);
  }

  // 4. Faculty Creation (Auth + DB)
  const facultyMembers = [
    { name: 'Dr. A. Kannan', username: 'akannan' },
    { name: 'Dr. B. Selvakumar', username: 'bselvakumar' },
    { name: 'Dr. A. Kanakaraj', username: 'akanakaraj' },
    { name: 'Dr. C. Prabhu', username: 'cprabhu' },
    { name: 'Mr. S. Harisabarish', username: 'sharisabarish' },
    { name: 'Mr. G. Maniraj', username: 'gmaniraj' },
    { name: 'Dr. P. Ganapathi', username: 'pganapathi' }
  ];

  const facMap = new Map(); // name -> id

  for (const fac of facultyMembers) {
    const email = `${fac.username}@tpt.edu.in`;
    const password = 'Faculty@123';

    // 1) Auth User
    let authUserId = null;
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let authUser = usersData?.users?.find(u => u.email === email);

    if (!authUser) {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) {
        console.warn(`Auth user creation note for ${email}:`, error.message);
      } else {
        authUser = created.user;
        console.log(`Created auth user for ${email}`);
      }
    } else {
      await supabase.auth.admin.updateUserById(authUser.id, { password });
      console.log(`Verified auth user for ${email}`);
    }

    if (authUser) authUserId = authUser.id;

    // 2) Faculty DB Record
    const facCheck = await client.query(
      "SELECT id FROM faculty WHERE department_id = $1 AND username = $2",
      [aidedDeptId, fac.username]
    );

    let facId;
    if (facCheck.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active) VALUES ($1, $2, $3, $4, true) RETURNING id",
        [aidedDeptId, fac.name, fac.username, authUserId]
      );
      facId = ins.rows[0].id;
      console.log(`Inserted faculty record for ${fac.name} (${fac.username}): ${facId}`);
    } else {
      facId = facCheck.rows[0].id;
      await client.query(
        "UPDATE faculty SET faculty_name = $1, auth_user_id = $2, active = true WHERE id = $3",
        [fac.name, authUserId, facId]
      );
      console.log(`Updated faculty record for ${fac.name} (${fac.username}): ${facId}`);
    }

    facMap.set(fac.name, facId);
  }

  // 5. Subjects for ME-AIDED
  const subMap = new Map(); // `${year}_${code}` -> id

  // Year 2 Subjects
  for (const c of year2Courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 2",
      [aidedDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active) VALUES ($1, $2, $3, 2, 3, true) RETURNING id",
        [c.code, c.name, aidedDeptId]
      );
      subId = ins.rows[0].id;
      console.log(`Created Year 2 subject ${c.code} - ${c.name}: ${subId}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(
        "UPDATE subjects SET subject_name = $1, semester = 3, active = true WHERE id = $2",
        [c.name, subId]
      );
      console.log(`Updated Year 2 subject ${c.code} - ${c.name}: ${subId}`);
    }
    subMap.set(`2_${c.code}`, subId);
  }

  // Year 3 Subjects
  for (const c of year3Courses) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 3",
      [aidedDeptId, c.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active) VALUES ($1, $2, $3, 3, 5, true) RETURNING id",
        [c.code, c.name, aidedDeptId]
      );
      subId = ins.rows[0].id;
      console.log(`Created Year 3 subject ${c.code} - ${c.name}: ${subId}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(
        "UPDATE subjects SET subject_name = $1, semester = 5, active = true WHERE id = $2",
        [c.name, subId]
      );
      console.log(`Updated Year 3 subject ${c.code} - ${c.name}: ${subId}`);
    }
    subMap.set(`3_${c.code}`, subId);
  }

  // 6. Faculty Subject Assignments
  console.log("\nSetting up Faculty Subject Assignments for Year 2...");
  for (const c of year2Courses) {
    const subId = subMap.get(`2_${c.code}`);
    for (const facName of c.facs) {
      const facId = facMap.get(facName.trim());
      if (!facId) throw new Error(`Faculty ID not found for ${facName}`);

      const asgCheck = await client.query(
        "SELECT id FROM faculty_subject_assignments WHERE department_id = $1 AND subject_id = $2 AND faculty_id = $3 AND year = 2 AND section = 'A'",
        [aidedDeptId, subId, facId]
      );
      if (asgCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 2, 3, 'A', true)
        `, [aidedDeptId, facId, subId]);
        console.log(`Assigned Year 2: ${c.code} (${c.name}) -> ${facName}`);
      } else {
        await client.query(
          "UPDATE faculty_subject_assignments SET active = true, semester = 3 WHERE id = $1",
          [asgCheck.rows[0].id]
        );
        console.log(`Updated Year 2 assignment: ${c.code} -> ${facName}`);
      }
    }
  }

  console.log("\nSetting up Faculty Subject Assignments for Year 3...");
  for (const c of year3Courses) {
    const subId = subMap.get(`3_${c.code}`);
    for (const facName of c.facs) {
      const facId = facMap.get(facName.trim());
      if (!facId) throw new Error(`Faculty ID not found for ${facName}`);

      const asgCheck = await client.query(
        "SELECT id FROM faculty_subject_assignments WHERE department_id = $1 AND subject_id = $2 AND faculty_id = $3 AND year = 3 AND section = 'A'",
        [aidedDeptId, subId, facId]
      );
      if (asgCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 3, 5, 'A', true)
        `, [aidedDeptId, facId, subId]);
        console.log(`Assigned Year 3: ${c.code} (${c.name}) -> ${facName}`);
      } else {
        await client.query(
          "UPDATE faculty_subject_assignments SET active = true, semester = 5 WHERE id = $1",
          [asgCheck.rows[0].id]
        );
        console.log(`Updated Year 3 assignment: ${c.code} -> ${facName}`);
      }
    }
  }

  // 7. Students Setup
  const y2Students = parseStudents(year2_students_raw);
  console.log(`\nInserting ${y2Students.length} Year 2 students for ME-AIDED...`);
  let y2Count = 0;
  for (const s of y2Students) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
      VALUES ($1, $2, $3, $4, 2, 3, 'A', true)
      ON CONFLICT (register_number)
      DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
    `, [s.regNo, s.name, aidedDeptId, batch2023Id]);
    y2Count++;
  }
  console.log(`Successfully saved ${y2Count} Year 2 students.`);

  const y3Students = parseStudents(year3_students_raw);
  console.log(`\nInserting ${y3Students.length} Year 3 students for ME-AIDED...`);
  let y3Count = 0;
  for (const s of y3Students) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
      VALUES ($1, $2, $3, $4, 3, 5, 'A', true)
      ON CONFLICT (register_number)
      DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section, active = true
    `, [s.regNo, s.name, aidedDeptId, batch2022Id]);
    y3Count++;
  }
  console.log(`Successfully saved ${y3Count} Year 3 students.`);

  // 8. Verification queries
  console.log("\n=== FINAL VERIFICATION FOR MECHANICAL (AIDED) ===");
  const finalSummary = await client.query(`
    SELECT s.year, s.semester, s.section, count(*) as student_count
    FROM students s
    WHERE s.department_id = $1
    GROUP BY s.year, s.semester, s.section
    ORDER BY s.year
  `, [aidedDeptId]);
  console.log("Students by Year:");
  console.table(finalSummary.rows);

  const asgSummary = await client.query(`
    SELECT fsa.year, fsa.semester, count(*) as assignment_count
    FROM faculty_subject_assignments fsa
    WHERE fsa.department_id = $1
    GROUP BY fsa.year, fsa.semester
    ORDER BY fsa.year
  `, [aidedDeptId]);
  console.log("Assignments by Year:");
  console.table(asgSummary.rows);

  const fList = await client.query(`
    SELECT faculty_name, username, active
    FROM faculty
    WHERE department_id = $1
    ORDER BY faculty_name
  `, [aidedDeptId]);
  console.log("Faculty in ME-AIDED:");
  console.table(fList.rows);

  await client.end();
  console.log("=== SETUP COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Fatal Error during setup:", err);
  process.exit(1);
});
