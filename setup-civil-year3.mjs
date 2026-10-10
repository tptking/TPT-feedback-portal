import pg from 'pg';
const { Client } = pg;

const rawStudents = `
A2401011	ABISHEK A
A2401012	ADHITHAN V
A2401013	AKIL KRISHNAN S
A2401015	ANIMITHA A
A2401016	ANOSHKAR K
A2401017	ARAVINTH V
A2401018	ARUN PRASAD S S
A2401020	BOOBESH V
A2401021	CHANDRU M
A2401022	DEENADHAYALAN S
A2401023	DEEPAKKUMAR B
A2401024	DEEPAN D
A2401025	DEEPIKA A
A2401026	DHANESH THARUN S
A2401027	DHARANIDHARAN S
A2401028	DHARANITHARAN V
A2401029	DHARSHINI V
A2401030	DHAVAMANI M
A2401031	DINESH S
A2401032	ELLORA S
A2401033	EZHIL ARASU VA
A2401034	GAJENDRAN K M
A2401035	GOKUL S
A2401036	GOWTHAM S
A2401037	GURUPRASANTH R
A2401039	HARINI S
A2401040	HARIPRAKASH M
A2401041	HARISH D K
A2401042	HRITHICK PP
A2401043	INDRA KUMAR D
A2401044	JAYACHANDRAN T S
A2401045	JEEVITHA K
A2401046	KANISHKA V
A2401047	KARTHIK T
A2401048	KATHIRVEL L
A2401050	KRISH V
A2401052	LOGITHRAJ T S
A2401053	MANOJ V
A2401054	MANOJ V
A2401055	MOHITH S
A2401056	MUKESH S
A2401057	NANDHAVELAN V
A2401058	RISHI B
A2401059	ROHITH KUMAR R
A2401060	SABARIGIRI S
A2401061	SABARIKEERTHIVASAN M P
A2401062	SACHIN R
A2401063	SANJEEVI KUMAR S
A2401064	SANTHOSH M
A2401065	SELVA GANAPATHI K
A2401066	SRINIVASAN S
A2401067	THANGAMANI S
A2401068	VASANTHA S
A2401069	VICITHRA A
A2401070	VISHANTH V
A2301074	SRIRAM R
C2501001	DURKASREER R
C2501002	KAVIBHARATHI N
C2501003	SHOBA M
C2501004	THOLKAPIYAN P
D2501005	VISHWA S
E2501006	AGILESH A
E2501007	BHUVANESHWARI P
E2501008	GOKULRAJ M
E2501009	MOHANPRATHAP P
A2301015	AATHAVAN M
A2301049	NARESHKUMAR G
`;

const subjects = [
  { code: '240-015413', name: 'Design of RCC Structures (DRC)', facs: ['G. Vairamani'] },
  { code: '240-015501', name: 'Elective-1 (Mechanical, Electrical and Plumbing Services) (MEP)', facs: ['N. Gokulkannan', 'R. Renuka'] },
  { code: '240-015414', name: 'Computer Applications in Civil Engineering (CACP)', facs: ['G. Vairamani', 'N. Gokulkannan'] },
  { code: '240-015415', name: 'Construction Management and Safety Practice (CMSP)', facs: ['N. Gokulkannan', 'S. Ambiga', 'R. Renuka'] },
  { code: '240-015416', name: 'Environmental Engineering (EE)', facs: ['S. Ambiga', 'R. Renuka'] },
  { code: '240-015108', name: 'Innovation and Startup (I&S)', facs: ['M. Ponni', 'S. Ambiga', 'R. Renuka'] }
];

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    // Civil Engineering Department ID is CE which is '11111111-1111-1111-1111-111111111111'
    const deptId = '11111111-1111-1111-1111-111111111111';
    
    // 1. Insert Batch (2022 start for Year 3)
    let batchId;
    const batchRes = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [deptId]);
    if (batchRes.rows.length === 0) {
      const ins = await client.query("INSERT INTO batches (department_id, batch_name, start_year, end_year) VALUES ($1, '2022-2025', 2022, 2025) RETURNING id", [deptId]);
      batchId = ins.rows[0].id;
    } else {
      batchId = batchRes.rows[0].id;
    }

    // 2. Insert Students
    const studentLines = rawStudents.trim().split('\n');
    let studentCount = 0;
    for (const line of studentLines) {
      if (!line.trim()) continue;
      const [regNo, ...nameParts] = line.split('\t');
      const name = nameParts.join(' ').trim();
      if (!regNo) continue;
      
      try {
        await client.query(
          "INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section) VALUES ($1, $2, $3, $4, 3, 5, 'A') ON CONFLICT (register_number) DO NOTHING",
          [regNo.trim(), name, deptId, batchId]
        );
        studentCount++;
      } catch(err) {
        console.error("Error with student:", regNo, err.message);
      }
    }
    console.log("Successfully processed", studentCount, "students");

    // 3. Faculty existence check (faculty should already exist from year 2 setup)
    const facRes = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1", [deptId]);
    const facDb = facRes.rows;
    function findFacultyId(name) {
      return facDb.find(f => f.faculty_name === name)?.id;
    }

    // 4. Insert Subjects & Assignments
    for (const sub of subjects) {
      let subId;
      const existSub = await client.query("SELECT id FROM subjects WHERE course_code = $1 AND department_id = $2", [sub.code, deptId]);
      if (existSub.rows.length > 0) {
        subId = existSub.rows[0].id;
      } else {
        const ins = await client.query(
          "INSERT INTO subjects (department_id, subject_name, course_code, year, semester) VALUES ($1, $2, $3, 3, 5) RETURNING id",
          [deptId, sub.name, sub.code]
        );
        subId = ins.rows[0].id;
        console.log("Created subject:", sub.name);
      }

      for (const facName of sub.facs) {
        const facId = findFacultyId(facName);
        if (facId) {
          const existAssign = await client.query(
            "SELECT id FROM faculty_subject_assignments WHERE faculty_id = $1 AND subject_id = $2 AND year = 3",
            [facId, subId]
          );
          if (existAssign.rows.length === 0) {
            await client.query(
              "INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, year, semester, section, active) VALUES ($1, $2, $3, 3, 5, 'A', true)",
              [facId, subId, deptId]
            );
            console.log(`Assigned ${facName} to ${sub.name}`);
          }
        } else {
          console.error("FACULTY NOT FOUND:", facName);
        }
      }
    }

    // 5. Create Active Feedback Cycle for Year 3
    const cycleCheck = await client.query("SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND enabled = true", [deptId]);
    if (cycleCheck.rows.length === 0) {
      await client.query(
        "INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, start_date, enabled) VALUES ('CIVIL Year 3 Sem 5 Feedback', $1, 3, 5, CURRENT_DATE, true)",
        [deptId]
      );
      console.log("Created active feedback cycle for CIVIL 3rd Year");
    }

    console.log("Setup complete for CIVIL Third Year!");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
