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

const sectionA_students_raw = `
A2510028	ABINESH K
A2510029	ALEXSARAN S
A2510030	ANANDA KRISHNAN S B
A2510031	ANTONY JOSVA S
A2510032	ARASU A
A2510033	ARAVINTHAN S
A2510034	ARUJ V S
A2510035	ASHWATH E S
A2510036	BHARANI V
A2510037	BHARATHRAJ P
A2510038	BHUPAN V
A2510039	DEEPAN KUMAR G
A2510041	DHANUSH A
A2510042	DHANUSH S
A2510043	DHARSHAN R
A2510044	DHARSHAN R
A2510045	DHARSHAN R K
A2510046	DHARSHAN S
A2510047	DHARSHAN S
A2510048	DHARSHAN V.G
A2510049	DINESH M
A2510050	ELAWARASAN S
A2510051	ESWARAMOORTHY S
A2510052	GANESH KANNA S
A2510053	GIRIBALA M
A2510054	GIRIPRASATH V
A2510055	GOKUL NATH D
A2510056	GOWRI PRASATH S
A2510057	GOWTHAM S
A2510059	HARISH R
A2510060	HEMANTH KUMAR V
A2510061	ILANGOVAN G
A2510062	IMRAN ALI M
A2510063	JAGADEEP S
A2510064	JANGIRSHA J
A2510065	JEGAN S
A2510066	JOSHVA JOHN VARGHESE J
A2510067	KALAISELVAN S
A2510069	KAMALESHWARAN A
A2510071	KARTHIK SABARINATHAN S
A2510072	KARTHIKEYAN B
A2510073	KAVIN P
A2510074	KESAVAN S
A2510075	KISHORE KUMAR R
A2510076	LOKESH E
A2510077	LOKESH S
A2510078	MANIKANDAN A
A2510079	MANOJ P
A2510080	MANOJKUMAR G
A2510081	MANOJKUMAR P
A2510082	MEIYZALAGAN P
A2510083	MITHUNESHWARAN K
A2510085	MOHAN J
A2510086	MOHANRAJ A
A2510087	MOWNISH T
C2610001	EMAIYAVAN S
C2610002	MURALIDHARAN S
C2610003	NANDHA C
C2610004	NANTHESWARAN K
C2610005	RITHISWARAN P
D2610010	AJAYANAND K
D2610011	DINESH M
D2610013	SANJAY K
E2610016	BALAJI E
E2610017	JEEVAGAN P
E2610018	MOHAMMED BILAL S
`;

const sectionB_students_raw = `
A2510088	NAVEEN B
A2510089	NAVEEN G S
A2510090	NAVEEN K
A2510091	NAVEEN M
A2510092	NISHANTH P
A2510093	NISHANTH V
A2510094	NITHISH R
A2510095	PASUPATHI N
A2510096	PAVITHIRAN S
A2510097	PONNARASAN N
A2510098	POOVARASAN G
A2510099	PRADEEP G
A2510101	PRAGATHESWARAN V
A2510102	PREM ANAND M
A2510103	PREMKUMAR R
A2510104	RAGUL P
A2510105	ROHITH S
A2510106	SABARI AKASH M
A2510107	SAJITHKUMAR S
A2510108	SAKTHI R
A2510109	SAKTHI SANJAY S I
A2510110	SANJAYA A
A2510111	SANJAY R
A2510112	SANTHOSH B
A2510113	SARAVANA PERUMAL S
A2510114	SARAVANAN P
A2510115	SASTA S
A2510116	SHANKAR M
A2510117	SHARAN R P
A2510118	SHARVESH S
A2510119	SHARVESHRAJA V
A2510120	SHARVIN JANA J
A2510121	SHREEDHAR S
A2510123	SIVADHARSHAN N V
A2510124	SRIDHAR V
A2510125	SRIDHARAN B
A2510126	SRIDHARAN S
A2510127	SUJAN S
A2510128	SUJITH M
A2510129	SUJITH P
A2510130	SUMAN K S
A2510131	SURYA L
A2510132	SUTHISH S
A2510133	TAMILSELVAN S
A2510134	THARAN M
A2510135	THIRUKKUMARAN A
A2510136	TUSHAR KUMAR S
A2510137	VAITHESWARAN V
A2510138	VASANTH V K
A2510139	VIGNESH K
A2510140	VIGNESH M
A2510141	VINOTH R
A2510142	VIYASAN S
A2510143	YASH BAPU BHONGALE B
A2510144	YASWANTH K
A2510145	YESHWANT GANESH BABU
D2610014	SANTHOSH JERALD H
C2610006	SARATHBABU G
C2610007	SIDHESVARAN V
C2610008	YOGESH K
C2610009	YOKESHABINAV R
D2610015	VIJAYAPRABHAKARAN A
D2610012	HARIHARAN A
E2610019	SRI MUNNARAYANAN S
E2610020	THILAKESHWARAN V
`;

const sectionA_courses = [
  { code: '240-023402', name: 'Manufacturing Process (MP)', facs: ['T. Ponnusamy'] },
  { code: '240-023403', name: 'Strength of Materials (SM)', facs: ['S. Sabareesh', 'K. Karthick'] },
  { code: '240-023404', name: 'Workshop Practices', facs: ['T. Ponnusamy', 'K. Karthick'] },
  { code: '240-023405', name: 'Industrial Drives and Control', facs: ['K. Kiruthika', 'P. Gopal'] },
  { code: '240-023406', name: 'Production Drawing and Modeling', facs: ['G. Saravanan', 'S. Sabareesh'] },
  { code: '240-023407', name: 'Machine Tool Technology', facs: ['S. Prakash', 'S. Ashok Saravanan'] }
];

const sectionB_courses = [
  { code: '240-023402', name: 'Manufacturing Process', facs: ['S. Ashok Saravanan'] },
  { code: '240-023403', name: 'Strength of Materials', facs: ['S. Manikandan', 'P. Gopal'] },
  { code: '240-023404', name: 'Workshop Practices', facs: ['S. Manikandan', 'L. Kannan', 'R. Palanimathi'] },
  { code: '240-023405', name: 'Industrial Drives and Control', facs: ['S. Prakash', 'P. Gopal'] },
  { code: '240-023406', name: 'Production Drawing and Modeling', facs: ['S. Ashok Saravanan', 'S. Srinivasan', 'S. R. Sandhiya'] },
  { code: '240-023407', name: 'Machine Tool Technology', facs: ['S. Manikandan', 'P. Gopal'] }
];

function parseStudents(raw, section) {
  const lines = raw.trim().split('\n');
  const res = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(/\t|\s{2,}/);
    if (parts.length < 2) continue;
    const regNo = parts[0].trim();
    const name = parts.slice(1).join(' ').trim();
    res.push({ regNo, name, section });
  }
  return res;
}

async function main() {
  await client.connect();
  console.log("=== SETUP MECHANICAL ENGINEERING (SS) & AIDED ===");

  // 1. Department Setup: Mechanical (Aided) and Mechanical (SS)
  // Let's check existing ME department:
  let aidedDeptId;
  const aidedCheck = await client.query("SELECT id FROM departments WHERE department_code = 'ME-AIDED' OR department_name ILIKE '%Mechanical%Aided%'");
  if (aidedCheck.rows.length === 0) {
    // Update existing 'ME' row (22222222-2222-2222-2222-222222222222) if present, or insert
    const meRow = await client.query("SELECT id FROM departments WHERE department_code = 'ME'");
    if (meRow.rows.length > 0) {
      await client.query("UPDATE departments SET department_name = 'Mechanical Engineering (Aided)', department_code = 'ME-AIDED' WHERE id = $1", [meRow.rows[0].id]);
      aidedDeptId = meRow.rows[0].id;
      console.log("Updated existing ME department to 'Mechanical Engineering (Aided)' with ID:", aidedDeptId);
    } else {
      const ins = await client.query("INSERT INTO departments (department_name, department_code, active) VALUES ('Mechanical Engineering (Aided)', 'ME-AIDED', true) RETURNING id");
      aidedDeptId = ins.rows[0].id;
      console.log("Created 'Mechanical Engineering (Aided)' department with ID:", aidedDeptId);
    }
  } else {
    aidedDeptId = aidedCheck.rows[0].id;
    console.log("Existing 'Mechanical Engineering (Aided)' department ID:", aidedDeptId);
  }

  // Mechanical (SS) Department
  let ssDeptId;
  const ssCheck = await client.query("SELECT id FROM departments WHERE department_code = 'ME-SS' OR department_name ILIKE '%Mechanical%SS%'");
  if (ssCheck.rows.length === 0) {
    const ins = await client.query("INSERT INTO departments (department_name, department_code, active) VALUES ('Mechanical Engineering (SS)', 'ME-SS', true) RETURNING id");
    ssDeptId = ins.rows[0].id;
    console.log("Created 'Mechanical Engineering (SS)' department with ID:", ssDeptId);
  } else {
    ssDeptId = ssCheck.rows[0].id;
    console.log("Existing 'Mechanical Engineering (SS)' department ID:", ssDeptId);
  }

  // 2. Admin Logins Creation in Supabase Auth & Faculty Table
  const adminAccounts = [
    {
      deptId: aidedDeptId,
      deptName: 'Mechanical Engineering (Aided)',
      username: 'mechaided',
      password: 'MechAided@2026',
      name: 'Mechanical Engineering (Aided) Admin'
    },
    {
      deptId: ssDeptId,
      deptName: 'Mechanical Engineering (SS)',
      username: 'mechss',
      password: 'MechSS@2026',
      name: 'Mechanical Engineering (SS) Admin'
    }
  ];

  for (const admin of adminAccounts) {
    const email = `${admin.username}@tpt.edu.in`;
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let authUser = usersData.users.find(u => u.email === email);

    if (authUser) {
      await supabase.auth.admin.updateUserById(authUser.id, { password: admin.password });
      console.log(`Updated auth password for ${email}`);
    } else {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: admin.password,
        email_confirm: true
      });
      if (createErr) {
        console.error(`Error creating auth user ${email}:`, createErr.message);
      } else {
        authUser = created.user;
        console.log(`Created auth user for ${email} with ID: ${authUser.id}`);
      }
    }

    if (authUser) {
      // Upsert into faculty table
      const facCheck = await client.query("SELECT id FROM faculty WHERE username = $1", [admin.username]);
      if (facCheck.rows.length === 0) {
        await client.query(
          "INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active) VALUES ($1, $2, $3, $4, true)",
          [admin.deptId, admin.name, admin.username, authUser.id]
        );
        console.log(`Inserted faculty record for ${admin.username}`);
      } else {
        await client.query(
          "UPDATE faculty SET department_id = $1, faculty_name = $2, auth_user_id = $3, active = true WHERE id = $4",
          [admin.deptId, admin.name, authUser.id, facCheck.rows[0].id]
        );
        console.log(`Updated faculty record for ${admin.username}`);
      }
    }
  }

  // 3. Batches for Mechanical (SS)
  let batch2023Id;
  const b23Check = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [ssDeptId]);
  if (b23Check.rows.length === 0) {
    const ins = await client.query("INSERT INTO batches (department_id, batch_name, start_year, end_year, active) VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id", [ssDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for ME-SS");
  } else {
    batch2023Id = b23Check.rows[0].id;
  }

  // 4. Insert Students for Section A and Section B
  const studentsA = parseStudents(sectionA_students_raw, 'A');
  const studentsB = parseStudents(sectionB_students_raw, 'B');
  console.log(`Inserting ${studentsA.length} Section A students...`);

  let countA = 0;
  for (const s of studentsA) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section)
      VALUES ($1, $2, $3, $4, 2, 3, 'A')
      ON CONFLICT (register_number) 
      DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section
    `, [s.regNo, s.name, ssDeptId, batch2023Id]);
    countA++;
  }
  console.log(`Successfully saved ${countA} Section A students.`);

  console.log(`Inserting ${studentsB.length} Section B students...`);
  let countB = 0;
  for (const s of studentsB) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section)
      VALUES ($1, $2, $3, $4, 2, 3, 'B')
      ON CONFLICT (register_number) 
      DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section
    `, [s.regNo, s.name, ssDeptId, batch2023Id]);
    countB++;
  }
  console.log(`Successfully saved ${countB} Section B students.`);

  // 5. Create Faculty Members for Mechanical (SS)
  const allCourses = [...sectionA_courses, ...sectionB_courses];
  const facultySet = new Set();
  allCourses.forEach(c => c.facs.forEach(f => facultySet.add(f.trim())));
  const allFaculties = Array.from(facultySet);
  console.log(`Creating/Verifying ${allFaculties.length} faculty members for ME-SS:`, allFaculties);

  const facIdMap = new Map();
  for (const facName of allFaculties) {
    const username = facName.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${username}@tpt.edu.in`;
    const password = 'Faculty@123';

    // 1) Auth User
    let authUserId = null;
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let authUser = usersData.users.find(u => u.email === email);
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
      }
    }
    if (authUser) authUserId = authUser.id;

    // 2) Faculty Table Record
    let facId;
    const existFac = await client.query("SELECT id FROM faculty WHERE faculty_name = $1 AND department_id = $2", [facName, ssDeptId]);
    if (existFac.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active) VALUES ($1, $2, $3, $4, true) RETURNING id",
        [ssDeptId, facName, username, authUserId]
      );
      facId = ins.rows[0].id;
      console.log(`Created faculty record: ${facName} (${username})`);
    } else {
      facId = existFac.rows[0].id;
      await client.query("UPDATE faculty SET auth_user_id = COALESCE($1, auth_user_id), active = true WHERE id = $2", [authUserId, facId]);
      console.log(`Updated faculty record: ${facName}`);
    }
    facIdMap.set(facName, facId);
  }

  // 6. Create Subjects in ME-SS
  const subjectIdMap = new Map();
  // Unique subjects by course_code
  const uniqueSubjects = [
    { code: '240-023402', name: 'Manufacturing Process (MP)' },
    { code: '240-023403', name: 'Strength of Materials (SM)' },
    { code: '240-023404', name: 'Workshop Practices' },
    { code: '240-023405', name: 'Industrial Drives and Control' },
    { code: '240-023406', name: 'Production Drawing and Modeling' },
    { code: '240-023407', name: 'Machine Tool Technology' }
  ];

  for (const s of uniqueSubjects) {
    let subId;
    const exist = await client.query("SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2", [ssDeptId, s.code]);
    if (exist.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO subjects (department_id, subject_name, course_code, year, semester, active) VALUES ($1, $2, $3, 2, 3, true) RETURNING id",
        [ssDeptId, s.name, s.code]
      );
      subId = ins.rows[0].id;
      console.log(`Created subject ${s.code}: ${s.name}`);
    } else {
      subId = exist.rows[0].id;
      await client.query("UPDATE subjects SET subject_name = $1, active = true WHERE id = $2", [s.name, subId]);
      console.log(`Updated subject ${s.code}: ${s.name}`);
    }
    subjectIdMap.set(s.code, subId);
  }

  // 7. Create Faculty-Subject Assignments for Section A
  console.log("\nAssigning Section A Courses...");
  let countAssignA = 0;
  for (const course of sectionA_courses) {
    const subId = subjectIdMap.get(course.code);
    for (const facName of course.facs) {
      const facId = facIdMap.get(facName.trim());
      const exist = await client.query(
        "SELECT id FROM faculty_subject_assignments WHERE department_id = $1 AND subject_id = $2 AND faculty_id = $3 AND year = 2 AND semester = 3 AND section = 'A'",
        [ssDeptId, subId, facId]
      );
      if (exist.rows.length === 0) {
        await client.query(
          "INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active) VALUES ($1, $2, $3, 2, 3, 'A', true)",
          [ssDeptId, facId, subId]
        );
        console.log(`[Section A] Assigned ${facName} -> ${course.name} (${course.code})`);
      }
      countAssignA++;
    }
  }
  console.log(`Section A assignments processed: ${countAssignA}`);

  // 8. Create Faculty-Subject Assignments for Section B
  console.log("\nAssigning Section B Courses...");
  let countAssignB = 0;
  for (const course of sectionB_courses) {
    const subId = subjectIdMap.get(course.code);
    for (const facName of course.facs) {
      const facId = facIdMap.get(facName.trim());
      const exist = await client.query(
        "SELECT id FROM faculty_subject_assignments WHERE department_id = $1 AND subject_id = $2 AND faculty_id = $3 AND year = 2 AND semester = 3 AND section = 'B'",
        [ssDeptId, subId, facId]
      );
      if (exist.rows.length === 0) {
        await client.query(
          "INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active) VALUES ($1, $2, $3, 2, 3, 'B', true)",
          [ssDeptId, facId, subId]
        );
        console.log(`[Section B] Assigned ${facName} -> ${course.name} (${course.code})`);
      }
      countAssignB++;
    }
  }
  console.log(`Section B assignments processed: ${countAssignB}`);

  // 9. Active Feedback Cycle for Mechanical SS Year 2
  const cycleCheck = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3",
    [ssDeptId]
  );
  if (cycleCheck.rows.length === 0) {
    const insCycle = await client.query(
      "INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, start_date, enabled) VALUES ('Mechanical (SS) Year 2 Sem 3 Feedback', $1, 2, 3, CURRENT_DATE, true) RETURNING id",
      [ssDeptId]
    );
    console.log("Created active feedback cycle for Mechanical (SS) 2nd Year with ID:", insCycle.rows[0].id);
  } else {
    await client.query("UPDATE feedback_cycles SET enabled = true, cycle_name = 'Mechanical (SS) Year 2 Sem 3 Feedback' WHERE id = $1", [cycleCheck.rows[0].id]);
    console.log("Verified/Enabled feedback cycle for Mechanical (SS) 2nd Year ID:", cycleCheck.rows[0].id);
  }

  // 10. Also verify feedback questions exist globally for feedback_cycles
  const qCount = await client.query("SELECT count(*) FROM feedback_questions WHERE active = true");
  console.log(`Global active feedback questions available: ${qCount.rows[0].count}`);

  console.log("\n=== MECHANICAL (SS) YEAR 2 SETUP COMPLETE ===");
  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN SETUP:", err);
  process.exit(1);
});
