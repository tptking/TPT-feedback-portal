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

// ==================== YEAR 2 COURSES ====================
const year2_sectionA_courses = [
  { code: '240-093402', name: 'Electronic Devices and Circuits', facs: ['R. Ramya'] },
  { code: '240-093403', name: 'Digital Electronics', facs: ['S. S. Ramya'] },
  { code: '240-093404', name: 'Electronic Devices and Circuits Practical', facs: ['R. Ramya'] },
  { code: '240-093405', name: 'Digital Electronics Practical', facs: ['S. Suganthi'] },
  { code: '240-093306', name: 'Linear Integrated Circuits', facs: ['S. S. Ramya', 'K. T. Vairavasundari'] },
  { code: '240-093307', name: 'Electrical Circuits and Machines', facs: ['K. T. Vairavasundari', 'S. S. Ramya'] }
];

const year2_sectionB_courses = [
  { code: '240-093402', name: 'Electronic Devices and Circuits', facs: ['K. T. Vairavasundari'] },
  { code: '240-093403', name: 'Digital Electronics', facs: ['S. Suganthi'] },
  { code: '240-093404', name: 'Electronic Devices and Circuits Practical', facs: ['R. Ramya'] },
  { code: '240-093405', name: 'Digital Electronics Practical', facs: ['S. Suganthi'] },
  { code: '240-093306', name: 'Linear Integrated Circuits', facs: ['S. S. Ramya', 'K. T. Vairavasundari'] },
  { code: '240-093307', name: 'Electrical Circuits and Machines', facs: ['K. T. Vairavasundari', 'S. S. Ramya'] }
];

// ==================== YEAR 3 COURSES ====================
const year3_sectionA_courses = [
  { code: '240-095412', name: 'Advanced Communication Systems (ACS)', facs: ['S. Dhivya'] },
  { code: '240-095413', name: 'Mobile Communication (MC)', facs: ['D. Priya'] },
  { code: '240-095501C', name: 'Digital Communication (DC)', facs: ['S. Dhivya'] },
  { code: '240-095414', name: 'Embedded Systems (ES)', facs: ['R. Suganya'] },
  { code: '240-095502C', name: 'Computer Hardware Servicing (CHS)', facs: ['T. Silva Rose'] },
  { code: '240-095108', name: 'Innovation and Startup', facs: ['S. Mahendran'] }
];

const year3_sectionB_courses = [
  { code: '240-095412', name: 'Advanced Communication Systems (ACS)', facs: ['S. Venkadesaperumal'] },
  { code: '240-095413', name: 'Mobile Communication (MC)', facs: ['D. Priya'] },
  { code: '240-095501C', name: 'Digital Communication (DC)', facs: ['S. Venkadesaperumal'] },
  { code: '240-095414', name: 'Embedded Systems (ES)', facs: ['J. Saranya'] },
  { code: '240-095502C', name: 'Computer Hardware Servicing (CHS)', facs: ['S. Mahendran'] },
  { code: '240-095108', name: 'Innovation and Startup', facs: ['S. Mahendran'] }
];

// ==================== FACULTY MEMBERS ====================
const facultyMembers = [
  { name: 'R. Ramya', username: 'rramya' },
  { name: 'S. S. Ramya', username: 'ssramya' },
  { name: 'S. Suganthi', username: 'ssuganthi' },
  { name: 'K. T. Vairavasundari', username: 'ktvairavasundari' },
  { name: 'S. Dhivya', username: 'sdhivya' },
  { name: 'D. Priya', username: 'dpriya' },
  { name: 'R. Suganya', username: 'rsuganya' },
  { name: 'T. Silva Rose', username: 'tsilvarose' },
  { name: 'S. Mahendran', username: 'smahendran' },
  { name: 'S. Venkadesaperumal', username: 'svenkadesaperumal' },
  { name: 'J. Saranya', username: 'jsaranya' }
];

// ==================== RAW STUDENTS DATA ====================
const year2_sectionA_students_raw = `
A2409117	SEEMA PARVEEN S
A2509028	AADHISAYI V
A2509029	ABARAZCTHA J N
A2509030	ABISHEK V
A2509031	AHMED ZAYD KHAN A
A2509033	ARNESH K
A2509034	ARUNALD ROICH A
A2509035	BADHRINATHAN K
A2509036	BARATH R K
A2509037	BHARAT KRISHNA B
A2509038	BHARATH B
A2509039	DEEPAK V
A2509040	DEEPAKSIVAA S B
A2509041	DEEPAN C
A2509043	DHARAN R
A2509044	DHARANI THARAN S
A2509045	DHARNISH M S
A2509048	DHASHYA S
A2509049	DHILIPKUMAR B
A2509050	DILIP S
A2509051	DINESHKUMAR G
A2509052	DINESHWARAN S
A2509054	GANAPATHYRAM C
A2509055	GOKUL S
A2509056	GOKUL KUMAR R S
A2509057	GOKULAKRISHNAN C
A2509058	GUGAN S
A2509059	GUNASEELAN R
A2509060	GURUCHARAN S
A2509061	GURUPRASATH R M
A2509063	HARI PRASANTH S
A2509064	HARIKUMARAN P
A2509066	JAGATHEESHWARAN N
A2509068	KAILASH N S
A2509069	KANISHKAR C
A2509073	KAVINTHRA G
A2509074	KESAVAN S
A2509075	KIRANRAJ S
A2509076	KISHORE S P
A2509077	KRISHNARAJ P
A2509078	LOHIDAASH R
A2509079	MANIBHARATHI S
A2509080	MANORITHIK V M
A2509081	MICKY ROY P
A2509083	MOHAMMAD IBRAHIM D
A2509084	MOHAMMED YASIN K
A2509086	MONISH M
A2509087	MOULISHVASAN M
A2509102	RISHIKESH R
C2609003	DHARSHAN P M
C2609002	DEVADHARSHAN D
C2609005	ELAIYARASU G
C2609008	HARSHINIE S J
C2609009	MANOJ B
C2609011	NARESH AALVA S
C2609012	NATARAJ R
C2609014	NITHISH K
C2609015	OMESHWAR P H
C2609018	RAJASEKAR C
C2609020	SRIDHAR G
C2609021	T.K. THANISHKA
C2609023	VISWANATH M
D2609026	LINGESHWARAN V
D2609028	NAVEEN S
`;

const year2_sectionB_students_raw = `
A2509046	DHARRANESH P
A2509065	HARISH A
A2509072	KAVINKUMAR G
A2509088	MUKUNDHAN P
A2509089	MUZAFFAR A
A2509091	NAVEEN S
A2509092	NAVEENKUMAR B
A2509093	NIRANJANKUMAR J D
A2509094	NITHEESH R
A2509095	NITHISH R B
A2509096	PRAGATHESE B
A2509099	RAJKUMAR M
A2509100	RAM V
A2509101	RESHMA BEGAM N
A2509103	RITHICK S M
A2509105	ROGITHKRISHNA U
A2509106	ROKITH RAJ N
A2509107	ROSHAN V
A2509108	SABARIRAJAN M
A2509109	SAKTHIVEL S
A2509111	SANJAY M
A2509114	SANTHOSH S
A2509115	SARAN ASVANTH P
A2509118	SARVESH P
A2509119	SHAKTHI RANJAN PRASATH S M
A2509120	SHREEVASAN G
A2509121	SHRINATH S B
A2509122	SOUNDARRAJAN V
A2509123	SUDHARSAN P
A2509124	SUGAPRIYAN S
A2509125	SUGASH K
A2509126	SUJAN M S
A2509127	SUJITHRAJDHEENA D
A2509128	SUMITH A
A2509129	SURYA V
A2509130	SURYAPRASHANNA G T
A2509131	SYED FARDHEEN S K
A2509132	TAMILSELVAN R
A2509133	THANISHKA B
A2509134	THARUN KARTHIK Y
A2509135	THARUN RAJ A
A2509137	THUKILAN S
A2509138	VENKATASUBRAMANIAM V P
A2509139	VIJAYADHARAN G
A2509140	VIMAL S
A2509141	VINOTHSHARMA S J
A2509142	VISHAL G
A2509143	VISHANTH G R
A2509144	VISHNU KANTH S
A2509145	YOKESH M K
A2509082	MITHRA N
C2609001	AVINESH R
C2609004	DINESH R S
C2609006	GOKULAVARSHINI S
C2609007	HARISH T S
C2609010	MANOJ S
C2609013	NATHEEM V
C2609016	PRAJJAN S A
C2609017	RAAKESH T
C2609019	SIVASHANKARAN A
C2609022	VASHANTH S
C2609024	YASHWANTH S
C2609025	DHARUN KUMAR S
C2609027	MATHANKUMAR R
E2609029	MANIKANDAN R
E2609030	RAVI M
E2609031	SANJIVE R
`;

const year3_sectionA_students_raw = `
A2109081	SUJITH KUMAR C
A2409024	ABISHEK M
A2409025	AJAYGOWTHAM N
A2409026	AKASH D
A2409027	AKASH S
A2409030	ANISH E
A2409031	ANISH M
A2409032	ANUPRIYADHARSHINI R
A2409033	ATHAVAN VIJAY A P
A2409035	BATHRINATH R
A2409036	BHARANIDHARAN V
A2409037	BHARATH S
A2409038	BOSE M
A2409039	DEVAPRASATH B
A2409040	DHARANEESHWAR S
A2409043	DINESHKUMAR G
A2409044	DIVAGAR G
A2409047	ENISHA P
A2409050	GANESHAN S
A2409051	GAUTHAM S
A2409052	GOWRI SANKAR G
A2409055	GOWTHAM V
A2409056	GURUSAKTHI R
A2409057	HARI PRASATH D
A2409059	HARISH KUMAR K
A2409060	HARSHA VARDHAN J
A2409061	HARSHAD V
A2409062	INIYAUDHAYAN C S
A2409063	JAISURYA S
A2409064	JANARTHANRAJ S M
A2409065	JANASHETH E K
A2409066	JANITH R
A2409067	JEEVA R
A2409068	JEEVATH J
A2409069	JESWANTH S
A2409070	KAMLESH S
A2409072	KAWIN DURAI A
A2409073	KISHORE K
A2409074	KISHORE P
A2409075	KUMARAN S
A2409076	LOGANATHAN S
A2409078	LOKESH P
A2409079	MADHAN S
A2409095	PAVITHRAN P
A2409099	PRAGADEESHWARAR J
A2409102	PRAVEENKUMAR M
A2409110	SANTHIYA S
A2409129	SWATHI C
A2409130	SWAYAMPRAKASH S R
A2409131	SYEDNADEEM S
A2409135	THIRUNIES P
A2409143	YOKESHWARAN S
C2509001	SURYA VISWANATHAN V
C2509002	BHUVANENTHIRAN M
C2509003	DHANUSHRANJAN R
C2509004	DIVAHAR S P
C2509005	GANGASREE V
C2509006	GURU SARAVANAN K
C2509007	HARISH K
C2509008	HARISH R
C2509010	MEGANATHAN J S
C2509013	NISHANTHU M
C2509017	SANDHIYA S
D2509024	YOKESH G
E2509027	MOHAMMED YUSUF S
`;

const year3_sectionB_students_raw = `
A2309077	MANOJKUMAR K
A2409045	DIVYAPRAKASH S D
A2409080	MADHUSRI M S
A2409081	MANIKANDAN S
A2409083	MOHAMEDIMRAN A
A2409084	MOHAMMED HASSAIN M
A2409086	MOHAN S
A2409087	MUGILAN A
A2409088	MUHAMMED RISWAN N
A2409089	MUKIL G
A2409090	MUKSID KANI P
A2409091	NAGASUDHARSAN N
A2409093	NIMALAN A
A2409094	NITHIN M
A2409097	PRADEEP S
A2409098	PRADEEP RAJ M
A2409100	PRASANNA PRAGADESH S B
A2409101	PRATHEVRAJ M K
A2409103	PREM D
A2409104	RATISH K J
A2409105	SABARISH S
A2409106	SABITHA M
A2409107	SANJAI M
A2409108	SANJAY M
A2409109	SANJAY R
A2409111	SANTHOSH S
A2409112	SARISH M
A2409113	SARVESH N
A2409115	SATHYA PRIYA K
A2409116	SAURAVJITH R
A2409118	SELVAMUTHUKUMARAN S
A2409119	SIVA R
A2409120	SIVAGURU K
A2409121	SOFIA S
A2409122	SRINITHYAN S
A2409123	SRIRANJAN V
A2409124	SUBASHINI R
A2409125	SURENDER S M
A2409126	SURYAMATHI B
A2409127	SURYAPRAKASH R
A2409128	SUTHEER M
A2409132	TAMILSELVAN R
A2409134	THIRUMURUGAN K
A2409136	UMESH P
A2409137	VIDHUL P S
A2409138	VIGNESH S
A2409139	VIGNESH S K
A2409140	VIMAL M
A2409141	VISWA P
A2409142	YOGGESH R
C2509009	KAVIN KUMAR K
C2509011	MOHAMMED ANAS S
C2509012	MURUGA PERUMAL G
C2509014	PADMANABHAN S
C2509015	PRAKASH V
C2509016	PRANOJKUMAR V P
C2509018	SRIHARAN K
C2509019	TAMILARASAN T
C2509020	TAMILSELVAN S
C2509021	VISHNU G
D2509022	THIRUNAVUKARASU S
D2509023	YOGASHRI M K
E2509025	KAVIN M
E2509026	MARIYAPPAN K
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
  console.log("=== STARTING ELECTRONICS AND COMMUNICATION ENGINEERING SETUP ===");
  console.log("==================================================================");

  // 1. Verify Department Record
  let dept = await client.query("SELECT * FROM departments WHERE id = $1", [eceDeptId]);
  if (dept.rows.length === 0) {
    await client.query(`
      INSERT INTO departments (id, department_name, department_code, active)
      VALUES ($1, 'Electronics and Communication Engineering', 'ECE', true)
    `, [eceDeptId]);
    console.log("Created department: Electronics and Communication Engineering with ID:", eceDeptId);
  } else {
    await client.query(`
      UPDATE departments SET department_name = 'Electronics and Communication Engineering', department_code = 'ECE', active = true
      WHERE id = $1
    `, [eceDeptId]);
    console.log("Verified department: Electronics and Communication Engineering (ECE)");
  }

  // 2. Department Admin Auth Accounts & Faculty Admin Records
  const { data: usersData } = await supabase.auth.admin.listUsers();

  // ecedept@tpt.edu.in
  let eceDeptAuth = usersData?.users?.find(u => u.email === 'ecedept@tpt.edu.in');
  if (!eceDeptAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'ecedept@tpt.edu.in',
      password: 'Ece@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating ecedept auth:", error.message);
    else eceDeptAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(eceDeptAuth.id, { password: 'Ece@2026' });
  }

  // ece@tpt.edu.in
  let eceAuth = usersData?.users?.find(u => u.email === 'ece@tpt.edu.in');
  if (!eceAuth) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: 'ece@tpt.edu.in',
      password: 'Ece@2026',
      email_confirm: true
    });
    if (error) console.error("Error creating ece auth:", error.message);
    else eceAuth = created.user;
  } else {
    await supabase.auth.admin.updateUserById(eceAuth.id, { password: 'Ece@2026' });
  }

  // Link faculty admin records
  const adminDeptFac = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'ecedept'", [eceDeptId]);
  if (adminDeptFac.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Electronics & Communication Admin', 'ecedept', $2, true)
    `, [eceDeptId, eceDeptAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, faculty_name = 'Electronics & Communication Admin', active = true WHERE id = $2
    `, [eceDeptAuth?.id || null, adminDeptFac.rows[0].id]);
  }

  const adminFac = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = 'ece'", [eceDeptId]);
  if (adminFac.rows.length === 0) {
    await client.query(`
      INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
      VALUES ($1, 'Electronics & Communication Engineering Admin', 'ece', $2, true)
    `, [eceDeptId, eceAuth?.id || null]);
  } else {
    await client.query(`
      UPDATE faculty SET auth_user_id = $1, faculty_name = 'Electronics & Communication Engineering Admin', active = true WHERE id = $2
    `, [eceAuth?.id || null, adminFac.rows[0].id]);
  }
  console.log("Department admin accounts verified: ecedept / ece (password: Ece@2026)");

  // 3. Batches
  // Year 2 Batch: 2023-2026
  let batch2023Id;
  const b23 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2023", [eceDeptId]);
  if (b23.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2023-2026', 2023, 2026, true) RETURNING id
    `, [eceDeptId]);
    batch2023Id = ins.rows[0].id;
    console.log("Created batch 2023-2026 for ECE:", batch2023Id);
  } else {
    batch2023Id = b23.rows[0].id;
    console.log("Existing batch 2023-2026 for ECE:", batch2023Id);
  }

  // Year 3 Batch: 2022-2025
  let batch2022Id;
  const b22 = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [eceDeptId]);
  if (b22.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO batches (department_id, batch_name, start_year, end_year, active)
      VALUES ($1, '2022-2025', 2022, 2025, true) RETURNING id
    `, [eceDeptId]);
    batch2022Id = ins.rows[0].id;
    console.log("Created batch 2022-2025 for ECE:", batch2022Id);
  } else {
    batch2022Id = b22.rows[0].id;
    console.log("Existing batch 2022-2025 for ECE:", batch2022Id);
  }

  // 4. Feedback Cycles
  // Year 2 Cycle
  let cycleYear2Id;
  const c2 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND semester = 3", [eceDeptId]);
  if (c2.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electronics & Communication Engineering Year 2 Sem 3 Feedback', $1, 2, 3, null, true, NOW()) RETURNING id
    `, [eceDeptId]);
    cycleYear2Id = ins.rows[0].id;
    console.log("Created Year 2 feedback cycle for ECE:", cycleYear2Id);
  } else {
    cycleYear2Id = c2.rows[0].id;
    await client.query("UPDATE feedback_cycles SET enabled = true, start_date = NOW() WHERE id = $1", [cycleYear2Id]);
    console.log("Updated/Enabled Year 2 feedback cycle for ECE:", cycleYear2Id);
  }

  // Year 3 Cycle
  let cycleYear3Id;
  const c3 = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND semester = 5", [eceDeptId]);
  if (c3.rows.length === 0) {
    const ins = await client.query(`
      INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, section, enabled, start_date)
      VALUES ('Electronics & Communication Engineering Year 3 Sem 5 Feedback', $1, 3, 5, null, true, NOW()) RETURNING id
    `, [eceDeptId]);
    cycleYear3Id = ins.rows[0].id;
    console.log("Created Year 3 feedback cycle for ECE:", cycleYear3Id);
  } else {
    cycleYear3Id = c3.rows[0].id;
    await client.query("UPDATE feedback_cycles SET enabled = true, start_date = NOW() WHERE id = $1", [cycleYear3Id]);
    console.log("Updated/Enabled Year 3 feedback cycle for ECE:", cycleYear3Id);
  }

  // 5. Faculty Records
  const facMap = new Map();
  for (const fac of facultyMembers) {
    const check = await client.query("SELECT id FROM faculty WHERE department_id = $1 AND username = $2", [eceDeptId, fac.username]);
    let facId;
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO faculty (department_id, faculty_name, username, auth_user_id, active)
        VALUES ($1, $2, $3, NULL, true) RETURNING id
      `, [eceDeptId, fac.name, fac.username]);
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

  // Unique Year 2 Subjects (Semester 3)
  const uniqueYear2Subjects = [
    { code: '240-093402', name: 'Electronic Devices and Circuits' },
    { code: '240-093403', name: 'Digital Electronics' },
    { code: '240-093404', name: 'Electronic Devices and Circuits Practical' },
    { code: '240-093405', name: 'Digital Electronics Practical' },
    { code: '240-093306', name: 'Linear Integrated Circuits' },
    { code: '240-093307', name: 'Electrical Circuits and Machines' }
  ];

  for (const s of uniqueYear2Subjects) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 2",
      [eceDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 2, 3, true) RETURNING id
      `, [s.code, s.name, eceDeptId]);
      subId = ins.rows[0].id;
      console.log(`Created Year 2 subject: ${s.code} - ${s.name}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(`
        UPDATE subjects SET subject_name = $1, semester = 3, active = true WHERE id = $2
      `, [s.name, subId]);
      console.log(`Updated Year 2 subject: ${s.code} - ${s.name}`);
    }
    subMap.set(`2_${s.code}`, subId);
  }

  // Unique Year 3 Subjects (Semester 5)
  const uniqueYear3Subjects = [
    { code: '240-095412', name: 'Advanced Communication Systems (ACS)' },
    { code: '240-095413', name: 'Mobile Communication (MC)' },
    { code: '240-095501C', name: 'Digital Communication (DC)' },
    { code: '240-095414', name: 'Embedded Systems (ES)' },
    { code: '240-095502C', name: 'Computer Hardware Servicing (CHS)' },
    { code: '240-095108', name: 'Innovation and Startup' }
  ];

  for (const s of uniqueYear3Subjects) {
    const sCheck = await client.query(
      "SELECT id FROM subjects WHERE department_id = $1 AND course_code = $2 AND year = 3",
      [eceDeptId, s.code]
    );
    let subId;
    if (sCheck.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO subjects (course_code, subject_name, department_id, year, semester, active)
        VALUES ($1, $2, $3, 3, 5, true) RETURNING id
      `, [s.code, s.name, eceDeptId]);
      subId = ins.rows[0].id;
      console.log(`Created Year 3 subject: ${s.code} - ${s.name}`);
    } else {
      subId = sCheck.rows[0].id;
      await client.query(`
        UPDATE subjects SET subject_name = $1, semester = 5, active = true WHERE id = $2
      `, [s.name, subId]);
      console.log(`Updated Year 3 subject: ${s.code} - ${s.name}`);
    }
    subMap.set(`3_${s.code}`, subId);
  }

  // 7. Faculty Subject Assignments
  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1", [eceDeptId]);
    console.log("\nCleared previous assignments for ECE.");

    // Helper to insert assignments
    async function assignCourses(courses, year, semester, section) {
      let count = 0;
      for (const c of courses) {
        const subId = subMap.get(`${year}_${c.code}`);
        if (!subId) throw new Error(`Subject ID not found for ${c.code}`);
        for (const facName of c.facs) {
          const facId = facMap.get(facName.trim());
          if (!facId) throw new Error(`Faculty ID not found for ${facName}`);
          await client.query(`
            INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
          `, [eceDeptId, facId, subId, year, semester, section]);
          count++;
          console.log(`Assigned Year ${year} Sec ${section}: ${c.code} (${c.name}) -> ${facName}`);
        }
      }
      return count;
    }

    const y2aCount = await assignCourses(year2_sectionA_courses, 2, 3, 'A');
    const y2bCount = await assignCourses(year2_sectionB_courses, 2, 3, 'B');
    const y3aCount = await assignCourses(year3_sectionA_courses, 3, 5, 'A');
    const y3bCount = await assignCourses(year3_sectionB_courses, 3, 5, 'B');

    await client.query("COMMIT");
    console.log(`\nSuccessfully committed assignments: Y2A=${y2aCount}, Y2B=${y2bCount}, Y3A=${y3aCount}, Y3B=${y3bCount}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }

  // 8. Students Upsert
  const y2aStudents = parseStudents(year2_sectionA_students_raw, 'A');
  const y2bStudents = parseStudents(year2_sectionB_students_raw, 'B');
  const y3aStudents = parseStudents(year3_sectionA_students_raw, 'A');
  const y3bStudents = parseStudents(year3_sectionB_students_raw, 'B');

  console.log(`\nParsed students:`);
  console.log(`  Year 2 Section A: ${y2aStudents.length}`);
  console.log(`  Year 2 Section B: ${y2bStudents.length}`);
  console.log(`  Year 3 Section A: ${y3aStudents.length}`);
  console.log(`  Year 3 Section B: ${y3bStudents.length}`);
  console.log(`  Total: ${y2aStudents.length + y2bStudents.length + y3aStudents.length + y3bStudents.length}`);

  async function upsertStudents(students, year, semester, section, batchId) {
    let count = 0;
    for (const s of students) {
      await client.query(`
        INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        ON CONFLICT (register_number)
        DO UPDATE SET
          student_name = EXCLUDED.student_name,
          department_id = EXCLUDED.department_id,
          batch_id = EXCLUDED.batch_id,
          year = EXCLUDED.year,
          semester = EXCLUDED.semester,
          section = EXCLUDED.section,
          active = true
      `, [s.regNo, s.name, eceDeptId, batchId, year, semester, section]);
      count++;
    }
    return count;
  }

  const insY2A = await upsertStudents(y2aStudents, 2, 3, 'A', batch2023Id);
  const insY2B = await upsertStudents(y2bStudents, 2, 3, 'B', batch2023Id);
  const insY3A = await upsertStudents(y3aStudents, 3, 5, 'A', batch2022Id);
  const insY3B = await upsertStudents(y3bStudents, 3, 5, 'B', batch2022Id);

  console.log(`\nSuccessfully upserted students:`);
  console.log(`  Year 2 Section A: ${insY2A}`);
  console.log(`  Year 2 Section B: ${insY2B}`);
  console.log(`  Year 3 Section A: ${insY3A}`);
  console.log(`  Year 3 Section B: ${insY3B}`);

  // 9. Validation Report
  console.log("\n==================================================================");
  console.log("=== FINAL VERIFICATION SUMMARY FOR ECE ===");
  console.log("==================================================================");

  const studentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM students
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [eceDeptId]);
  console.log("Students by year & section:", studentSummary.rows);

  const subjectSummary = await client.query(`
    SELECT year, semester, count(*) as count
    FROM subjects
    WHERE department_id = $1
    GROUP BY year, semester
    ORDER BY year
  `, [eceDeptId]);
  console.log("Subjects by year & semester:", subjectSummary.rows);

  const assignmentSummary = await client.query(`
    SELECT year, semester, section, count(*) as count
    FROM faculty_subject_assignments
    WHERE department_id = $1
    GROUP BY year, semester, section
    ORDER BY year, section
  `, [eceDeptId]);
  console.log("Faculty assignments by year & section:", assignmentSummary.rows);

  const facultySummary = await client.query(`
    SELECT count(*) as count FROM faculty WHERE department_id = $1 AND username NOT IN ('ece', 'ecedept')
  `, [eceDeptId]);
  console.log("Active teachers:", facultySummary.rows[0].count);

  console.log("==================================================================");
  console.log("=== ECE SETUP SUCCESSFULLY COMPLETED ===");
  console.log("==================================================================");

  await client.end();
}

main().catch(err => {
  console.error("FATAL ERROR IN ECE SETUP:", err);
  process.exit(1);
});

