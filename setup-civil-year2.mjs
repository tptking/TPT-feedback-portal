import pg from 'pg';
import { createClient } from '@supabase/supabase-js';


const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const rawStudents = `
A2501010	ASHWANTH K
A2501011	ASHWIN P
A2501012	BALAJI K
A2501013	BAVYA E
A2501014	DEEBISHINI S
A2501015	DHARAN KUMAR S
A2501016	DHARSHIN R
A2501017	DHARSHINI G
A2501018	DHARSHINI P
A2501019	DHEIVANATHI B
A2501020	DIVYA SHRI R
A2501021	DURAISINGAM R
A2501022	GOWTHAM V
A2501023	HARISH M
A2501024	HEMANISHA S
A2501025	KABILESH R
A2501026	KANISHGA R
A2501027	KANNAN S
A2501028	KARTHIKEYAN V
A2501029	KAVIASRASU V A
A2501031	KISHORE P
A2501032	LUCKSHIKA V R
A2501033	MANI M
A2501035	MOUNISH B
A2501036	MUTHUMANI C
A2501038	NAVEEN KUMAR S
A2501039	NIRANJANA K
A2501040	NISHANTH K
A2501041	NITHISH M
A2501042	NITHISH KUMAR S
A2501043	PRADEEPA A
A2501044	PRAGUL M
A2501045	PRANEET R
A2501046	PRAVEEN S
A2501047	PRAVEEN KUMAR P
A2501048	RAGUL PRASANNA R
A2501049	RAMYA A
A2501050	RANJITHKUMAR J
A2501051	RITHIK M
A2501052	ROHITH R
A2501053	ROHITH S
A2501054	RUTHRAGANESH G
A2501055	SANDEEP S R
A2501056	SETHUMATHAVAN A
A2501057	SHAM V
A2501058	SOUNDARYA V
A2501059	SRI KRISHNA A P
A2501060	SRIJAA K
A2501061	SRINITHI G
A2501062	SUDHARSAN C
A2501063	TAMILARASU P R
A2501064	THILIPAN M
A2501065	VISWAKARTHICK L J
A2501066	YASVINI R
A2201062	SARAVANAN P
C2601001	ANBUSELVAM R K
C2601002	INDHUMATHI S
C2601003	KALPANA T
C2601004	ROHINI M
C2601005	RONALDBALA F
C2601006	SANTHOSH KUMAR G
C2601007	TAMILSELVAN R
C2601008	THENMOZHI S
D2601009	INIYA M
D2601010	NIVASH N
D2601011	SRINANDHANA K
`;

const subjects = [
  { code: '240-013402', name: 'Mechanics of Materials (MOM)', facs: ['M. Ponni'] },
  { code: '240-013403', name: 'Construction Materials (CM)', facs: ['Dr. R. Lavanya'] },
  { code: '240-013404', name: 'Surveying Practice (SP)', facs: ['Dr. R. Lavanya', 'N. Gokulkannan'] },
  { code: '240-013405', name: 'Building Planning and Drawing (BPD)', facs: ['S. Ambiga', 'R. Renuka'] },
  { code: '240-013406', name: 'Hydraulics (HYD)', facs: ['Dr. R. Lavanya', 'G. Vairamani'] },
  { code: '240-013407', name: 'Material Testing Lab (MTL)', facs: ['M. Ponni', 'S. Ambiga', 'R. Renuka'] }
];

async function run() {
  try {
    await client.connect();

    // 1. Create or get CIVIL Department
    let deptId;
    const deptRes = await client.query("SELECT id FROM departments WHERE department_code = 'CIVIL'");
    if (deptRes.rows.length === 0) {
      const ins = await client.query("INSERT INTO departments (department_code, department_name) VALUES ('CIVIL', 'Civil Engineering') RETURNING id");
      deptId = ins.rows[0].id;
      console.log("Created CIVIL department");
    } else {
      deptId = deptRes.rows[0].id;
    }

    // 2. Insert Batch (2023 start for Year 2)
    let batchId;
    const batchRes = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [deptId]);
    if (batchRes.rows.length === 0) {
      const ins = await client.query("INSERT INTO batches (department_id, batch_name, start_year, end_year) VALUES ($1, '2023-2026', 2023, 2026) RETURNING id", [deptId]);
      batchId = ins.rows[0].id;
    } else {
      batchId = batchRes.rows[0].id;
    }

    // 3. Insert Students
    const studentLines = rawStudents.trim().split('\n');
    let studentCount = 0;
    for (const line of studentLines) {
      if (!line.trim()) continue;
      const [regNo, ...nameParts] = line.split('\t');
      const name = nameParts.join(' ').trim();
      if (!regNo) continue;
      
      try {
        await client.query(
          "INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section) VALUES ($1, $2, $3, $4, 2, 3, 'A') ON CONFLICT (register_number) DO NOTHING",
          [regNo.trim(), name, deptId, batchId]
        );
        studentCount++;
      } catch(err) {
        console.error("Error with student:", regNo, err.message);
      }
    }
    console.log("Successfully processed", studentCount, "students");

    // 4. Create Faculties and Map to Auth
    const facSet = new Set();
    subjects.forEach(s => s.facs.forEach(f => facSet.add(f)));
    const faculties = Array.from(facSet);

    for (const facName of faculties) {
      const username = facName.toLowerCase().replace(/[^a-z]/g, '');
      const email = `${username}@tpt.edu.in`;
      const password = 'Faculty@123';

      // Ensure faculty auth account
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error && !error.message.includes("User already registered")) {
        console.error("Auth error for", facName, error.message);
        continue;
      }

      // We might need direct DB insert if user already exists
      const { data: existingAuth } = await supabase.from('auth_users_view').select('id').eq('email', email).maybeSingle();
      
      // But we can just use the user ID from the login attempt if it exists.
      // Easiest is to direct SQL the auth schema.
      const authRes = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
      let authUserId = null;
      if (authRes.rows.length > 0) {
        authUserId = authRes.rows[0].id;
      }

      if (!authUserId && user) {
        authUserId = user.id;
      }

      // Insert into faculty table
      const exist = await client.query("SELECT id FROM faculty WHERE faculty_name = $1 AND department_id = $2", [facName, deptId]);
      if (exist.rows.length === 0) {
        await client.query(
          "INSERT INTO faculty (department_id, faculty_name, username, auth_user_id) VALUES ($1, $2, $3, $4)",
          [deptId, facName, username, authUserId]
        );
        console.log("Created faculty:", facName);
      } else {
        await client.query("UPDATE faculty SET auth_user_id = $1 WHERE id = $2", [authUserId, exist.rows[0].id]);
      }
    }

    const facRes = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1", [deptId]);
    const facDb = facRes.rows;
    function findFacultyId(name) {
      return facDb.find(f => f.faculty_name === name)?.id;
    }

    // 5. Insert Subjects & Assignments
    for (const sub of subjects) {
      let subId;
      const existSub = await client.query("SELECT id FROM subjects WHERE course_code = $1 AND department_id = $2", [sub.code, deptId]);
      if (existSub.rows.length > 0) {
        subId = existSub.rows[0].id;
      } else {
        const ins = await client.query(
          "INSERT INTO subjects (department_id, subject_name, course_code, year, semester) VALUES ($1, $2, $3, 2, 3) RETURNING id",
          [deptId, sub.name, sub.code]
        );
        subId = ins.rows[0].id;
        console.log("Created subject:", sub.name);
      }

      for (const facName of sub.facs) {
        const facId = findFacultyId(facName);
        if (facId) {
          const existAssign = await client.query(
            "SELECT id FROM faculty_subject_assignments WHERE faculty_id = $1 AND subject_id = $2 AND year = 2",
            [facId, subId]
          );
          if (existAssign.rows.length === 0) {
            await client.query(
              "INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, year, semester, section, active) VALUES ($1, $2, $3, 2, 3, 'A', true)",
              [facId, subId, deptId]
            );
            console.log(`Assigned ${facName} to ${sub.name}`);
          }
        }
      }
    }

    // 6. Create Active Feedback Cycle
    const cycleCheck = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND enabled = true", [deptId]);
    if (cycleCheck.rows.length === 0) {
      await client.query(
        "INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, start_date, enabled) VALUES ('CIVIL Year 2 Sem 3 Feedback', $1, 2, 3, CURRENT_DATE, true)",
        [deptId]
      );
      console.log("Created active feedback cycle for CIVIL 2nd Year");
    }

    console.log("Setup complete for CIVIL Second Year!");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
