import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const rawStudents = `
A2516010	ABINAV M
A2516011	AJAY KUMAR S
A2516012	ANAND V
A2516013	ANUSHKA M
A2516014	ARSHIYA S
A2516015	ASHARAF ALI K
A2516016	ASHIKA M
A2516017	ASWIN JAYANTH R
A2516018	CHAKRAVARTHI N
A2516019	CHRISTOPHER J R
A2516020	DESHIKA SHREE J G
A2516021	DHANUSH K
A2516022	DHANUSHREE VT
A2516023	DHARANEESHWARAN E
A2516024	DHARANISH N
A2516025	DHARNISH M S
A2516026	DHARSHINI A
A2516027	DINESH M
A2516028	DURAIVALAVAN K
A2516029	GIRINATH B
A2516030	GOKULSARATHI S
A2516031	GOPIKA V N
A2516032	GOWSHIK G R
A2516033	HARI VIGNESH M
A2516034	HARINI K
A2516036	JANARTH K
A2516037	JEEVA GODVIN G
A2516038	KARTHIKA K
A2516039	MAHILNIVASINI R S
A2516040	MOHAMMED ARHAB S
A2516041	MOHAMMED RASOOL R
A2516042	MOHAMMED SHAHEEN I
A2516043	MUTHUKUMAR M
A2516044	NAVEEN S
A2516045	NISANTH R
A2516046	NITHISHKUMAR M
A2516047	NITHYASHRI M A
A2516048	NIVASH K
A2516049	NIVETHA R
A2516050	RAMAN M
A2516051	RAVEESH S
A2516052	RIHAN KHAN F
A2516053	RITHIK M
A2516056	SANJAYAN M
A2516057	SARAN G
A2516058	SARAVANAN S
A2516059	SASMITHA N
A2516060	SHAGUL HAMEED A
A2516061	SHANMATHI S
A2516062	SREERAM KOLARI S
A2516063	SRI SARVESH R
A2516064	THANUSHVA V
A2516065	VIDHYA P
A2516066	VIGNESHWAR M J
A2516067	VIKRAM S
A2516068	VISHNU VASAN K
A2516069	YOGESHWARAN P
C2616001	MATHAN P
C2616002	MOUNA J
C2616003	RAGHAVARDHINI J
C2616004	SANDHIYA S
C2616005	SUGESHAMOORTHY S
C2616006	SURYA B
C2616007	SUSILA R
D2616008	GOPIKA C
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
    console.log("Found CSIT Dept:", deptId);

    // 2. Find a Batch for CSIT (just use the first one, or insert one if not exists)
    let batchId;
    const batchRes = await client.query("SELECT id FROM batches WHERE department_id = $1 LIMIT 1", [deptId]);
    if (batchRes.rows.length > 0) {
      batchId = batchRes.rows[0].id;
    } else {
      const insBatch = await client.query("INSERT INTO batches (department_id, batch_name, start_year, end_year) VALUES ($1, '2023-2026', 2023, 2026) RETURNING id", [deptId]);
      batchId = insBatch.rows[0].id;
    }
    console.log("Using Batch:", batchId);

    // 3. Insert Students
    const studentLines = rawStudents.trim().split('\n');
    let count = 0;
    
    for (const line of studentLines) {
      if (!line.trim()) continue;
      
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      
      const regNo = parts[0].trim();
      const name = parts[1].trim();

      try {
        await client.query("INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section) VALUES ($1, $2, $3, $4, 2, 3, 'A') ON CONFLICT (register_number) DO NOTHING", [regNo, name, deptId, batchId]);
        count++;
      } catch (err) {
        console.error("Error inserting student:", regNo, err.message);
      }
    }
    
    console.log("Successfully processed " + count + " students for CSIT 2nd Year!");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
