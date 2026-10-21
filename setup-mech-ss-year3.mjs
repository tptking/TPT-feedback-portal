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
A2410023	ABINAV D G
A2410024	ABISHEK R
A2410025	AKASH M
A2410026	ALFUR ATHEEK J
A2410027	ANBARASAN M
A2410028	ANBUSELVAN B
A2410029	ARAVINDH V
A2410030	ARJUN SINGH N
A2410031	ARUNACHALAM M
A2410032	ASHIK S
A2410033	AVINASH M J
A2410034	BHARANIDHARAN S S
A2410035	BHARATHI M
A2410036	BHARATHRAJ M
A2410037	BRITTO PIUS A S
A2410038	CHANDRU S
A2410039	CHINNANNAN S
A2410040	DANNY JOEL S
A2410041	DEENADHAYALAN N
A2410042	DEVNATH R
A2410043	DHAKSHITH M
A2410045	DHARANI A M
A2410046	DHARANI KRISHNAN M
A2410047	DHARSHAN N
A2410048	DHARSHAN S
A2410049	DHARUNKUMAR M
A2410050	DINESHKUMAR V
A2410051	DURAIRAJA P
A2410054	GANESH A
A2410055	GAUTHAMAN M P
A2410056	GILLILAVAN S E
A2410058	GOKUL R
A2410059	GOKULA KRISHNAN M
A2410060	GOKULRAJ K
A2410061	GOPALAKANNAN S
A2410063	GOWSIKRANGAN V
A2410064	GOWTHAM S
A2410065	GOWTHAM V
A2410066	GOWTHAM PRABAKAR M
A2410067	GURUPRASATH J
A2410068	HARISH V
A2410069	INBARASAN K
A2410070	JAYAPRASATH M
A2410071	JERRY K V
A2410072	KABIL M
A2410073	KARMUGHILAN V
A2410074	KAVIN M
A2410075	KAVIN KUMAR Y
A2410078	KISHORE KUMAR BALAJI
A2410079	KUMARESAN M
A2410080	LOGESH S
A2410081	LOGITH R
C2510001	ASHOKRAJ A S
C2510002	GANGADHARAN C
C2510003	GOKULRAJ T
C2510004	HARIHARAN N
C2510005	HARISH K
C2510006	KANNAN S
C2510007	MADHANKUMAR M
C2510008	MANIKANDAN M
C2510009	MEGANATHAN S
D2510020	DHIVAKAR M
D2510021	JAISURYA T
D2510022	NARENTHIRAKUMAR A
A2310034	BHAVISHYA KUMAR JAISWALA
A2310061	KAVIBHARATHI A
A2310132	SYED IBRAHIM A A
A2310057	KALAISELVAN S
`;

const sectionB_students_raw = `
A2410082	LOKEESHWARAN K S
A2410083	LOKESH R
A2410084	MANIKANDAN S
A2410085	MANOJ G
A2410086	MANOJ R T
A2410087	MOHAMMED MIFTHAK F
A2410088	MOHAN P
A2410089	MOHANKUMAR M
A2410090	MOHANRAJ S
A2410091	MOUNISHWARAN M
A2410092	MOUSHIK M
A2410093	MOWNISHWARAN M
A2410094	MUNTHAZAR AHAMED B
A2410095	MUTHARASU A
A2410096	NAGILAN A
A2410097	NARESH G
A2410098	NARESHKUMAR A K
A2410099	NATHISH A S
A2410100	NAVEEN KUMAR V
A2410102	NAVEENKUMAR S
A2410104	OMKAR T
A2410105	PADMANABAN K G
A2410106	PARANTHAMAN B
A2410108	PRAVEEN M
A2410109	PRAVEEN KUMAR V
A2410110	RAAGUL S
A2410111	RAVIRISHANTH S
A2410112	SABARISH M
A2410113	SACHIN M
A2410115	SANJAY A R
A2410116	SANJAY KUMAR B
A2410118	SANTHOSH K
A2410119	SANTHOSH S
A2410120	SARAN V S
A2410122	SELVARAGAVAN M
A2410123	SHANMUGARAI P
A2410124	SOUNDAR S
A2410125	SRI HAREESHWAR S
A2410126	SRI VISHNU S
A2410128	SRINATH S
A2410129	SUDHARSAN P
A2410130	SUJITH D
A2410131	TAMILARASAN K
A2410132	THARANISH R P
A2410133	THARUN S
A2410134	VARSHIT K
A2410136	VENKATESH K
A2410137	VIMAL S
A2410138	VISANTH S
A2410139	VISHWA V
A2410140	YASODHARAN A
A2410141	YOGESHWARAN R
C2510010	MOHANKUMAR V
C2510011	NITHEESWAR R
C2510012	NITHISH P
C2510014	PRAVEENSREE E
C2510015	PREMNATH M
C2510016	RAMKISHOR R
C2510017	SABARIKARTHICK S
C2510018	SHIYAM K
C2510019	VIGNESH S
D2510023	PRAVEENKUMAR A
D2510024	SANJAY VARSAN R
D2510025	SOUNDAR S
D2510026	VASANTHA KUMAR A
E2510027	MOULIDHARAN R
A2310107	SABARIMANI P
A2310111	SANJAY M
`;

const sectionA_courses = [
  { code: '240-025414', name: 'Elements of Machine Design', facs: ['S. Srinivasan'] },
  { code: '240-025415', name: 'Industrial Engineering and Management', facs: ['G. Saravanan', 'R. Ayanar'] },
  { code: '240-025501A', name: 'Refrigeration and Air-Conditioning', facs: ['P. Gopal', 'S. Ashok Saravanan'] },
  { code: '240-025416', name: 'Maintenance, Repairs & Service', facs: ['S. Prakash', 'R. Ayanar', 'S. Ashok Saravanan'] },
  { code: '240-025502A', name: 'Process Automation', facs: ['G. Saravanan', 'K. Karthick'] }
];

const sectionB_courses = [
  { code: '240-025414', name: 'Elements of Machine Design', facs: ['L. Kannan'] },
  { code: '240-025415', name: 'Industrial Engineering and Management', facs: ['S. Prakash', 'R. Ayanar'] },
  { code: '240-025501A', name: 'Refrigeration and Air-Conditioning', facs: ['S. Manikandan', 'S. R. Sandhiya'] },
  { code: '240-025416', name: 'Maintenance, Repairs & Service', facs: ['L. Kannan', 'S. Sabareesh'] },
  { code: '240-025502A', name: 'Process Automation', facs: ['S. Srinivasan', 'S. R. Sandhiya'] },
  { code: '240-025108', name: 'Innovation and Startup', facs: ['S. Manikandan'] }
];

function parseStudents(raw, section) {
  const lines = raw.trim().split('\n');
  const res = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.trim().split(/\t|\s{2,}/);
    if (parts.length < 2) continue;
    const regNo = parts[0].trim();
    const name = parts.slice(1).join(' ').trim();
    res.push({ regNo, name, section });
  }
  return res;
}

async function main() {
  await client.connect();
  console.log("=== SETUP MECHANICAL ENGINEERING (SS) THIRD YEAR ===");

  // 1. Get Mechanical (SS) Department
  const deptRes = await client.query("SELECT id FROM departments WHERE department_code = 'ME-SS'");
  if (deptRes.rows.length === 0) throw new Error("Mechanical (SS) department not found!");
  const ssDeptId = deptRes.rows[0].id;
  console.log("Mechanical (SS) Department ID:", ssDeptId);

  // 2. Batch for Third Year (2022-2025)
  let batch2022Id;
  const b22Check = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [ssDeptId]);
  if (b22Check.rows.length === 0) {
    const ins = await client.query(
      "INSERT INTO batches (department_id, batch_name, start_year, end_year, active) VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id",
      [ssDeptId]
    );
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for ME-SS:", batch2022Id);
  } else {
    batch2022Id = b22Check.rows[0].id;
    console.log("Using existing batch 2022-2025 for ME-SS:", batch2022Id);
  }

  // 3. Insert Students for Section A and Section B (Year 3, Semester 5)
  const studentsA = parseStudents(sectionA_students_raw, 'A');
  const studentsB = parseStudents(sectionB_students_raw, 'B');

  console.log(`Inserting ${studentsA.length} Section A (Year 3) students...`);
  let countA = 0;
  for (const s of studentsA) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section)
      VALUES ($1, $2, $3, $4, 3, 5, 'A')
      ON CONFLICT (register_number) 
      DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section
    `, [s.regNo, s.name, ssDeptId, batch2022Id]);
    countA++;
  }
  console.log(`Successfully saved ${countA} Section A students.`);

  console.log(`Inserting ${studentsB.length} Section B (Year 3) students...`);
  let countB = 0;
  for (const s of studentsB) {
    await client.query(`
      INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section)
      VALUES ($1, $2, $3, $4, 3, 5, 'B')
      ON CONFLICT (register_number) 
      DO UPDATE SET student_name = EXCLUDED.student_name, department_id = EXCLUDED.department_id, batch_id = EXCLUDED.batch_id, year = EXCLUDED.year, semester = EXCLUDED.semester, section = EXCLUDED.section
    `, [s.regNo, s.name, ssDeptId, batch2022Id]);
    countB++;
  }
  console.log(`Successfully saved ${countB} Section B students.`);

  // 4. Create/Verify Faculty Members
  const allCourses = [...sectionA_courses, ...sectionB_courses];
  const facultySet = new Set();
  allCourses.forEach(c => c.facs.forEach(f => facultySet.add(f.trim())));
  const allFaculties = Array.from(facultySet);
  console.log(`Verifying/Adding ${allFaculties.length} faculty members for Year 3:`, allFaculties);

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
        console.warn(`Auth note for ${email}:`, error.message);
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
      console.log(`Created new faculty record: ${facName} (${username})`);
    } else {
      facId = existFac.rows[0].id;
      await client.query("UPDATE faculty SET auth_user_id = COALESCE($1, auth_user_id), active = true WHERE id = $2", [authUserId, facId]);
      console.log(`Updated faculty record: ${facName}`);
    }
    facIdMap.set(facName, facId);
  }

  // 5. Create Subjects in ME-SS for Year 3, Semester 5
  const subjectIdMap = new Map();
  const uniqueSubjects = [
    { code: '240-025414', name: 'Elements of Machine Design' },
    { code: '240-025415', name: 'Industrial Engineering and Management' },
    { code: '240-025501A', name: 'Refrigeration and Air-Conditioning' },
    { code: '240-025416', name: 'Maintenance, Repairs & Service' },
    { code: '240-025502A', name: 'Process Automation' },
    { code: '240-025108', name: 'Innovation and Startup' }
  ];

  for (const s of uniqueSubjects) {
    let subId;
    const exist = await client.query("SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2", [ssDeptId, s.code]);
    if (exist.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO subjects (department_id, subject_name, course_code, year, semester, active) VALUES ($1, $2, $3, 3, 5, true) RETURNING id",
        [ssDeptId, s.name, s.code]
      );
      subId = ins.rows[0].id;
      console.log(`Created subject ${s.code}: ${s.name}`);
    } else {
      subId = exist.rows[0].id;
      await client.query("UPDATE subjects SET subject_name = $1, year = 3, semester = 5, active = true WHERE id = $2", [s.name, subId]);
      console.log(`Updated subject ${s.code}: ${s.name}`);
    }
    subjectIdMap.set(s.code, subId);
  }

  // 6. Create Faculty-Subject Assignments for Section A (Year 3)
  console.log("\nAssigning Section A (Year 3) Courses...");
  let countAssignA = 0;
  for (const course of sectionA_courses) {
    const subId = subjectIdMap.get(course.code);
    for (const facName of course.facs) {
      const facId = facIdMap.get(facName.trim());
      const exist = await client.query(
        "SELECT id FROM faculty_subject_assignments WHERE department_id = $1 AND subject_id = $2 AND faculty_id = $3 AND year = 3 AND semester = 5 AND section = 'A'",
        [ssDeptId, subId, facId]
      );
      if (exist.rows.length === 0) {
        await client.query(
          "INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active) VALUES ($1, $2, $3, 3, 5, 'A', true)",
          [ssDeptId, facId, subId]
        );
        console.log(`[Section A] Assigned ${facName} -> ${course.name} (${course.code})`);
      }
      countAssignA++;
    }
  }
  console.log(`Section A assignments processed: ${countAssignA}`);

  // 7. Create Faculty-Subject Assignments for Section B (Year 3)
  console.log("\nAssigning Section B (Year 3) Courses...");
  let countAssignB = 0;
  for (const course of sectionB_courses) {
    const subId = subjectIdMap.get(course.code);
    for (const facName of course.facs) {
      const facId = facIdMap.get(facName.trim());
      const exist = await client.query(
        "SELECT id FROM faculty_subject_assignments WHERE department_id = $1 AND subject_id = $2 AND faculty_id = $3 AND year = 3 AND semester = 5 AND section = 'B'",
        [ssDeptId, subId, facId]
      );
      if (exist.rows.length === 0) {
        await client.query(
          "INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active) VALUES ($1, $2, $3, 3, 5, 'B', true)",
          [ssDeptId, facId, subId]
        );
        console.log(`[Section B] Assigned ${facName} -> ${course.name} (${course.code})`);
      }
      countAssignB++;
    }
  }
  console.log(`Section B assignments processed: ${countAssignB}`);

  // 8. Active Feedback Cycle for Mechanical SS Year 3
  const cycleCheck = await client.query(
    "SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5",
    [ssDeptId]
  );
  if (cycleCheck.rows.length === 0) {
    const insCycle = await client.query(
      "INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, start_date, enabled) VALUES ('Mechanical (SS) Year 3 Sem 5 Feedback', $1, 3, 5, CURRENT_DATE, true) RETURNING id",
      [ssDeptId]
    );
    console.log("Created active feedback cycle for Mechanical (SS) 3rd Year with ID:", insCycle.rows[0].id);
  } else {
    await client.query("UPDATE feedback_cycles SET enabled = true, cycle_name = 'Mechanical (SS) Year 3 Sem 5 Feedback' WHERE id = $1", [cycleCheck.rows[0].id]);
    console.log("Verified/Enabled feedback cycle for Mechanical (SS) 3rd Year ID:", cycleCheck.rows[0].id);
  }

  console.log("\n=== MECHANICAL (SS) YEAR 3 SETUP COMPLETE ===");
  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN YEAR 3 SETUP:", err);
  process.exit(1);
});
