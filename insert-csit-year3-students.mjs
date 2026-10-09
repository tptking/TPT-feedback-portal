import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const rawStudents = `
A2416001	ABU BAKER N
A2416002	AKILAN V
A2416003	AKSHITHA M O
A2416004	ARAVIND A
A2416005	DANIYA SRI P
A2416006	DEVESH REDDY B
A2416007	DHANESH M V
A2416008	DHANUSH A D
A2416009	DHINESH S
A2416010	DIWAKAR K
A2416011	GOWTHARASU A
A2416012	HARI KRISHNAN S
A2416013	HARIKRISHNAN V
A2416014	HARIKRISHNAN V S
A2416015	HARISH K
A2416016	HARSHITHA S
A2416017	HEMANATH K S
A2416018	INIYA K
A2416019	INIYAN S M
A2416020	JAGADEESHWARAN M
A2416021	JANANI T
A2416022	JANASAIARAM E
A2416023	JOSHNAVI V
A2416024	MANESH J
A2416025	MELWIN ANTO A
A2416026	MHALLI VIGNESH S S
A2416027	MOHAMED IBRAHIM M
A2416028	MOHAMMED SHAHUL S
A2416029	MOHANRAJ M
A2416030	MONISHA S
A2416031	MOUNITHAVARSHINI V
A2416032	MUHILAN R
A2416034	NAVEEN A
A2416035	NIVAAS B K
A2416036	NIVETHA K
A2416037	OBHU AKSHAYA O
A2416038	PAVIN KUMAR S
A2416039	PRAGADESHWARAN S
A2416040	PRIYADHARSHINI G
A2416042	RATHISH KUMAR K
A2416043	RITHISHPRYIAN A
A2416044	SANGAVI K
A2416045	SANJAY E
A2416046	SANJAY R
A2416047	SANJAY KUMAR R B
A2416048	SANJAY VISHNU S
A2416050	SANTHOSH M
A2416051	SHAMEER A SHREE R K
A2416052	SHARVESHWARAN R
A2416053	SIJEE S B
A2416055	SUJJAN V
A2416056	THARUN C G
A2416057	TILIKA S
A2416058	VENKATA PRASANNA V
A2416059	VIJAYADHARANI S
A2416060	YOGESWARAN M A
C2516001	ARAVIND B S
C2516002	JOSWA M
C2516003	MANIMARAN V
C2516004	MOHAMMED JAHEER HUSSAIN I
C2516005	NAVANEETH K R
C2516006	NIKILESH M
C2516007	NITHISHKUMAR K
C2516008	RAKSHITHA A
C2516009	VETRIVEL T
`;

async function run() {
  try {
    await client.connect();

    // 1. Get CSIT Department
    const deptRes = await client.query("SELECT id FROM departments WHERE department_code = 'CSIT'");
    if (deptRes.rows.length === 0) {
      console.error("CSIT department not found!");
      return;
    }
    const deptId = deptRes.rows[0].id;

    // 2. Find/Create a Batch for CSIT Year 3 (e.g. 2022-2025 or 2024 passout)
    // Third year currently studying means they joined in 2022
    let batchId;
    const batchRes = await client.query("SELECT id FROM batches WHERE department_id = $1 AND start_year = 2022", [deptId]);
    if (batchRes.rows.length > 0) {
      batchId = batchRes.rows[0].id;
    } else {
      const insBatch = await client.query("INSERT INTO batches (department_id, batch_name, start_year, end_year) VALUES ($1, '2022-2025', 2022, 2025) RETURNING id", [deptId]);
      batchId = insBatch.rows[0].id;
    }

    // 3. Insert Students for Year 3, Semester 5
    const studentLines = rawStudents.trim().split('\n');
    let count = 0;
    
    for (const line of studentLines) {
      if (!line.trim()) continue;
      
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      
      const regNo = parts[0].trim();
      const name = parts[1].trim();

      try {
        await client.query("INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section) VALUES ($1, $2, $3, $4, 3, 5, 'A') ON CONFLICT (register_number) DO NOTHING", [regNo, name, deptId, batchId]);
        count++;
      } catch (err) {
        console.error("Error inserting student:", regNo, err.message);
      }
    }
    
    console.log("Successfully processed " + count + " students for CSIT 3rd Year!");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
