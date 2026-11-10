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

const eceDeptId = '88888888-8888-8888-8888-888888888888';

// ==================== YEAR 1 SECTION A COURSES ====================
const year1_sectionA_courses = [
  { code: '240-001101', name: 'Tamil Marabu', facs: ['Ms. C. Sathya', 'Ms. M. Angel'] },
  { code: '240-001201', name: 'Engineering Mathematics', facs: ['Ms. G. Haritha'] },
  { code: '240-001202', name: 'Engineering Physics', facs: ['Ms. A. Rajalakshmi', 'Ms. M. Vijayashree'] },
  { code: '240-001203', name: 'Engineering Chemistry', facs: ['Ms. G. Latha', 'Mr. K. Logesh'] },
  { code: '240-001102', name: 'Communicative English – I', facs: ['Dr. J. Sangeetha', 'Ms. K. Abinaya'] },
  { code: '240-001301', name: 'Basic Workshop Practices', facs: ['Mr. S. Srinivasan'] },
  { code: '240-001302', name: 'Digital Workplace Skills', facs: ['Ms. R. Suganya', 'Mr. U. K. Sree Murugan'] }
];

// ==================== YEAR 1 SECTION B COURSES ====================
const year1_sectionB_courses = [
  { code: '240-001101', name: 'Tamil Marabu', facs: ['Ms. S. Sudha', 'Ms. R. Jeevitha'] },
  { code: '240-001201', name: 'Engineering Mathematics', facs: ['Ms. P. Ramya', 'Ms. N. Hemalatha'] },
  { code: '240-001202', name: 'Engineering Physics', facs: ['Ms. N. Vidhya', 'Ms. M. Vijayashree'] },
  { code: '240-001203', name: 'Engineering Chemistry', facs: ['Ms. C. Sudha', 'Mr. R. Shankar'] },
  { code: '240-001102', name: 'Communicative English – I', facs: ['Ms. R. Jeevitha', 'Ms. M. Angel'] },
  { code: '240-001301', name: 'Basic Workshop Practices', facs: ['Mr. P. Gopal'] },
  { code: '240-001302', name: 'Digital Workplace Skills', facs: ['Ms. J. Saranya', 'Mr. P. Saivenkat'] }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'Ms. C. Sathya', username: 'csathyaece' },
  { name: 'Ms. M. Angel', username: 'mangelece' },
  { name: 'Ms. G. Haritha', username: 'gharitha' },
  { name: 'Ms. A. Rajalakshmi', username: 'arajalakshmi' },
  { name: 'Ms. M. Vijayashree', username: 'mvijayashree' },
  { name: 'Ms. G. Latha', username: 'glathaece' },
  { name: 'Mr. K. Logesh', username: 'klogeshece' },
  { name: 'Dr. J. Sangeetha', username: 'jsangeetha' },
  { name: 'Ms. K. Abinaya', username: 'kabinayaece' },
  { name: 'Mr. S. Srinivasan', username: 'ssrinivasanece' },
  { name: 'Ms. R. Suganya', username: 'rsuganya' }, // already exists in ECE
  { name: 'Mr. U. K. Sree Murugan', username: 'uksreemuruganece' },
  { name: 'Ms. S. Sudha', username: 'ssudha' },
  { name: 'Ms. R. Jeevitha', username: 'rjeevitha' },
  { name: 'Ms. P. Ramya', username: 'pramya' },
  { name: 'Ms. N. Hemalatha', username: 'nhemalatha' },
  { name: 'Ms. N. Vidhya', username: 'nvidhyaece' },
  { name: 'Ms. C. Sudha', username: 'csudha' },
  { name: 'Mr. R. Shankar', username: 'rshankar' },
  { name: 'Mr. P. Gopal', username: 'pgopalece' },
  { name: 'Ms. J. Saranya', username: 'jsaranya' }, // already exists in ECE
  { name: 'Mr. P. Saivenkat', username: 'psaivenkat' }
];

// ==================== RAW STUDENTS DATA ====================
const year1_sectionA_students_raw = `
A2609032	AAKASH S
A2609033	AJAY G
A2609034	AKASH K
A2609035	ALLEN GEORGE
A2609036	ANBUSELVAN E
A2609037	ARAVIND S
A2609038	ASHVAT A
A2609039	ASHWATH R
A2609040	ASHWIN S B
A2609041	ASWIN KARTHICK S
A2609042	BATHRINATHAN S
A2609043	BHARANIDHARAN R
A2609044	BHAVANTHIKA K S
A2609045	BHAVESH S K
A2609046	CHANDRU K S
A2609047	CHANDRU P
A2609048	DEEPAK EASWAR M
A2609049	DHAKSHAN M
A2609050	DHANUSH V
A2609051	DHANUSHYA R
A2609052	DHARANISH R
A2609053	DHARUN M
A2609054	DRUVA S
A2609055	DUSHYANT T
A2609056	EZHILARASAN R
A2609057	GIRIMURUGAN S
A2609058	GOKUL G
A2609059	GOKUL V
A2609060	GURU PRASANTH S
A2609061	GURUAKHIL M
A2609062	GURUTHATH S
A2609063	HARI HARA SUDAN S K
A2609064	HARI KRISHNA A
A2609065	HARI KRISHNAN B
A2609066	HARISH P
A2609067	HARISH VARDHAN S
A2609068	HARSHITH KUMAR M
A2609069	HEMAVARSHAN G
A2609070	JAI SUDHARSAN P
A2609071	JAYAPRAKASH A
A2609072	JEEVITH P
A2609073	JOGINDHAR S
A2609074	KAMESH P
A2609075	KARTHICK M
A2609076	KARTHIKEYAAN D A
A2609077	KARTHIKEYAN K
A2609078	KARTHIKEYAN M
A2609079	KAVIN S P
A2609080	KIRTHIC RAAGAV P R
A2609081	KIRTHIKVASAN P
A2609082	KISHORE P
A2609083	KISHORE S
A2609084	KRISHNA PRASATH S
A2609085	LAKSHMI BHAVITH S
A2609086	LINGESAN S
A2609087	LOHITH S
A2609088	LOKESHSRINIVASH P
A2609089	MADHAN M
A2609090	MANOJ A
`;

const year1_sectionB_students_raw = `
A2609091	MOHAMMED RIZWAN S
A2609092	MOHAMMED SALEEM S
A2609093	MOHAMMED SAMEER S
A2609094	MOULESWARAN V
A2609095	MUKESH S
A2609096	MYTHIREYAN M
A2609097	NANDHAKUMAR G
A2609098	NAVANEETHAN R
A2609099	NAVEEN M
A2609100	NITHEESH S
A2609101	PADMESH S
A2609102	PAVINRAJ B
A2609103	PERARASAN T
A2609104	POOVARASAN A
A2609105	PRAJITH S
A2609106	PRATHAMESH S
A2609107	PRATHISHKUMAR J
A2609108	RAGAVAN T
A2609109	RAGAVAN T
A2609110	RAMANIDHARAN A
A2609111	RAVINDAR RAJAVEL
A2609112	REHAN KHAN D
A2609113	RITHISHKAR U
A2609114	SABARI D
A2609115	SABARI M
A2609116	SANTHOSH V
A2609117	SARANESH G
A2609118	SASIKUMAR R
A2609119	SHRINIKETHAN B
A2609120	SRI RAKSHAN RAJ S P
A2609121	SRI SABARIVASAN M J
A2609122	SRIHARAN G A
A2609123	SRIRAM S
A2609124	SUHITH B
A2609125	SUKANT S
A2609126	SURENDAR R
A2609127	THARUN A
A2609128	THARUN B
A2609129	THEJASWIN K
A2609130	THIRUPPATHI E
A2609131	UDHAYANITHI S
A2609132	S K VETRIVELAVAN
A2609133	VIDHYARTH M
A2609134	VIJAYARAGAVAN K
A2609135	VIJAYPRAVIN S
A2609136	VISANTH S M
A2609137	VISHWADEEP R
`;

function parseStudents(raw, section) {
  const lines = raw.trim().split('\n');
  const res = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\t|\s{2,}/);
    if (parts.length >= 2) {
      const regNo = parts[0].trim();
      const name = parts.slice(1).join(' ').trim();
      res.push({ regNo, name, section });
    }
  }
  return res;
}

async function main() {
  await client.connect();
  console.log("==================================================================");
  console.log("=== STARTING ELECTRONICS AND COMMUNICATION ENGINEERING YEAR 1 SETUP ===");
  console.log("==================================================================");

  // 1. Verify Department
  const dept = await client.query("SELECT * FROM departments WHERE id = $1", [eceDeptId]);
  if (dept.rows.length === 0) {
    throw new Error(`Department with ID ${eceDeptId} not found!`);
  }
  console.log("Verified department:", dept.rows[0].department_name);

  // 2. Batch: 2024-2027 (Year 1)
  let batch2024Id;
  const b24 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2024", [eceDeptId]);
  if (b24.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2024-2027', 2024, 2027, true) RETURNING id
    `, [eceDeptId]);
    batch2024Id = ins.rows[0].id;
    console.log("Created batch 2024-2027 for ECE:", batch2024Id);
  } else {
    batch2024Id = b24.rows[0].id;
    console.log("Existing batch 2024-2027 for ECE:", batch2024Id);
  }

  // 3. Feedback Cycle: Year 1 Semester 1
  let cycleYear1Id;
  const c1 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 1 AND semester = 1", [eceDeptId]);
  if (c1.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electronics & Communication Engineering Year 1 Sem 1 Feedback', $1, 1, 1, null, true, NOW()) RETURNING id
    `, [eceDeptId]);
    cycleYear1Id = ins.rows[0].id;
    console.log("Created Year 1 feedback cycle for ECE:", cycleYear1Id);
  } else {
    cycleYear1Id = c1.rows[0].id;
    await client.query("UPDATE feedback_cycles SET enabled = true, start_date = NOW() WHERE id = $1", [cycleYear1Id]);
    console.log("Updated/Enabled Year 1 feedback cycle for ECE:", cycleYear1Id);
  }

  // 4. Faculty Records
  const facMap = new Map();
  for (const fac of facultyMembers) {
    const checkUser = await client.query("SELECT id FROM faculty WHERE username = $1", [fac.username]);
    let facId;
    if (checkUser.rows.length > 0) {
      facId = checkUser.rows[0].id;
      await client.query("UPDATE faculty SET faculty_name = $1, active = true WHERE id = $2", [fac.name, facId]);
      console.log(`Updated faculty: ${fac.name} (${fac.username})`);
    } else {
      const checkName = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND faculty_name = $2", [eceDeptId, fac.name]);
      if (checkName.rows.length > 0) {
        facId = checkName.rows[0].id;
        await client.query("UPDATE faculty SET username = $1, active = true WHERE id = $2", [fac.username, facId]);
        console.log(`Updated faculty: ${fac.name} (${fac.username})`);
      } else {
        const ins = await client.query(`
          INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
          VALUES ($1, $2, $3, NULL, true) RETURNING id
        `, [eceDeptId, fac.name, fac.username]);
        facId = ins.rows[0].id;
        console.log(`Inserted faculty: ${fac.name} (${fac.username})`);
      }
    }
    facMap.set(fac.name, facId);
  }

  // 5. Unique Subjects Setup for ECE Year 1 (Semester 1)
  const uniqueSubjects = [
    { code: '240-001101', name: 'Tamil Marabu' },
    { code: '240-001201', name: 'Engineering Mathematics' },
    { code: '240-001202', name: 'Engineering Physics' },
    { code: '240-001203', name: 'Engineering Chemistry' },
    { code: '240-001102', name: 'Communicative English – I' },
    { code: '240-001301', name: 'Basic Workshop Practices' },
    { code: '240-001302', name: 'Digital Workplace Skills' }
  ];

  const subMap = new Map();
  for (const s of uniqueSubjects) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 1",
      [eceDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 1, 1, true) RETURNING id
      `, [s.code, s.name, eceDeptId]);
      subId = ins.rows[0].id;
      console.log(`Created Year 1 subject: ${s.code} - ${s.name}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(`
        UPDATE subjects SET subject_name = $1, semester = 1, active = true WHERE id = $2
      `, [s.name, subId]);
      console.log(`Updated Year 1 subject: ${s.code} - ${s.name}`);
    }
    subMap.set(s.code, subId);
  }

  // 6. Faculty Subject Assignments (Section A & Section B)
  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 1", [eceDeptId]);
    console.log("\nCleared previous Year 1 assignments for ECE.");

    async function assignCourses(courses, section) {
      let count = 0;
      for (const c of courses) {
        const subId = subMap.get(c.code);
        if (!subId) throw new Error(`Subject ID not found for ${c.code}`);
        for (const facName of c.facs) {
          const facId = facMap.get(facName.trim());
          if (!facId) throw new Error(`Faculty ID not found for ${facName}`);
          await client.query(`
            INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
            VALUES ($1, $2, $3, 1, 1, $4, true)
          `, [eceDeptId, facId, subId, section]);
          count++;
          console.log(`Assigned Year 1 Sec ${section}: ${c.code} (${c.name}) -> ${facName}`);
        }
      }
      return count;
    }

    const countA = await assignCourses(year1_sectionA_courses, 'A');
    const countB = await assignCourses(year1_sectionB_courses, 'B');

    await client.query("COMMIT");
    console.log(`\nSuccessfully committed assignments: Sec A = ${countA}, Sec B = ${countB}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }

  // 7. Upsert Students
  const y1aStudents = parseStudents(year1_sectionA_students_raw, 'A');
  const y1bStudents = parseStudents(year1_sectionB_students_raw, 'B');

  console.log(`\nParsed students:`);
  console.log(`  Year 1 Section A: ${y1aStudents.length}`);
  console.log(`  Year 1 Section B: ${y1bStudents.length}`);
  console.log(`  Total: ${y1aStudents.length + y1bStudents.length}`);

  async function upsertStudents(students, section) {
    let count = 0;
    for (const s of students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, 1, 1, $5, true)
        ON CONFLICT (register_number)
        DO UPDATE SET
          student_name = EXCLUDED.student_name,
          department_id = EXCLUDED.department_id,
          batch_id = EXCLUDED.batch_id,
          year = 1,
          semester = 1,
          section = $5,
          active = true
      `, [s.regNo, s.name, eceDeptId, batch2024Id, section]);
      count++;
    }
    return count;
  }

  const insA = await upsertStudents(y1aStudents, 'A');
  const insB = await upsertStudents(y1bStudents, 'B');

  console.log(`Successfully upserted: Sec A = ${insA}, Sec B = ${insB}`);

  // 8. Verification Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR ECE YEAR 1 ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [eceDeptId]);
  console.log("Students in ECE by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [eceDeptId]);
  console.log("Subjects in ECE by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM faculty_subject_assignments
    WHERE department_id = $1 AND year = 1
    GROUP BY year, semester, section
    ORDER BY section
  `, [eceDeptId]);
  console.log("Year 1 Faculty assignments in ECE:", assignmentSummary.rows);

  console.log("==================================================================");
  console.log("=== ECE YEAR 1 SETUP COMPLETED ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN SETUP:", err);
  process.exit(1);
});

