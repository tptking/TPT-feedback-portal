import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const studentsList = [
  "A2507008\tAshiq J", "A2507010\tAswanth S", "A2507011\tBalaji P", "A2507012\tBawashvinayak R",
  "A2507013\tBharanisree R", "A2507014\tDeepan M", "A2507015\tDharun S", "A2507016\tDisunkanth M R",
  "A2507017\tFazil B", "A2507018\tFazileth Rizaa A", "A2507019\tGowtham R", "A2507021\tHarish D",
  "A2507022\tJalanthar A", "A2507023\tJeevika G", "A2507024\tJishnu M", "A2507025\tKaarthik L S",
  "A2507026\tKarthikeyan N G", "A2507027\tKavin Sabapathi A", "A2507028\tKhesav Jeyar Damodaran",
  "A2507029\tKiran P", "A2507030\tLogesh B T", "A2507031\tMadhana Shri R", "A2507032\tMogana Bharathi K",
  "A2507033\tMohammed Hafeez M", "A2507034\tMohana Siva Prasad R", "A2507035\tMouli S", "A2507036\tNethra R",
  "A2507037\tNithish S", "A2507038\tNivaskumaran V", "A2507039\tParameswaran M", "A2507040\tPoorvika S",
  "A2507041\tPranav Kumar L", "A2507042\tPugaleshwari P P", "A2507043\tRajpandian B", "A2507044\tRanjith I",
  "A2507045\tRijay Rithick S", "A2507046\tRohit S J", "A2507047\tSabarees S P", "A2507049\tSachin Prasath S",
  "A2507050\tSakthi V", "A2507051\tSanjai Karthik J P", "A2507052\tSanjay D", "A2507053\tSarathy G",
  "A2507054\tSaravanan K", "A2507055\tShamprasanth V I", "A2507056\tSharni S", "A2507057\tShnjeev K N",
  "A2507058\tSidesh A", "A2507059\tSivaprakash N S", "A2507060\tSivaprakash S", "A2507061\tSrinivaas A",
  "A2507062\tTarun K M", "A2507063\tTharun U", "A2507064\tTrijaal Adhitya P", "A2507065\tVarshan S D",
  "A2507066\tVignesh Kumar S", "A2507067\tYaashidha I", "C2607001\tAshokkumar S", "C2607002\tGowthaman K",
  "C2607003\tJanarthanababu S", "C2607004\tKanika R", "C2607005\tKaran Kumar", "C2607006\tNithishkumaran V",
  "C2607007\tSriobuliraja S", "C2607008\tThangadurai J"
];

const subjects = [
  { code: '240-073402', name: 'Digital Logic Design', facs: ['Sangeetha'] },
  { code: '240-073403', name: 'Data Structures Using C', facs: ['RajaRajeswari'] },
  { code: '240-073404', name: 'Digital Logic Design Lab', facs: ['Sangeetha'] },
  { code: '240-073405', name: 'C Programming', facs: ['Sangeetha', 'Saranya'] },
  { code: '240-073406', name: 'Web Designing', facs: ['RajaRajeswari', 'Saranya'] },
  { code: '240-073407', name: 'Operating Systems', facs: ['Nandha'] }
];

async function run() {
  try {
    await client.connect();
    
    // Get Department
    const deptRes = await client.query(`SELECT id FROM departments WHERE department_name ILIKE '%Computer Engineering%'`);
    if (deptRes.rows.length === 0) throw new Error('Department not found');
    const deptId = deptRes.rows[0].id;
    
    // Get Batch (just use any existing batch or year=2 implies a batch)
    const batchRes = await client.query(`SELECT id FROM batches WHERE department_id = $1 LIMIT 1`, [deptId]);
    const batchId = batchRes.rows[0]?.id || null;

    console.log("Department ID:", deptId, "Batch:", batchId);

    // Insert Students
    let insertedStudents = 0;
    for (const stuStr of studentsList) {
      // Split by literal tab or multiple spaces
      const parts = stuStr.split(/\t|\s{2,}/);
      if (parts.length < 2) continue;
      const reg = parts[0].trim();
      const name = parts.slice(1).join(' ').trim();
      
      try {
        await client.query(`
          INSERT INTO students (register_number, student_name, department_id, batch_id, year, semester, section)
          VALUES ($1, $2, $3, $4, 2, 3, 'A')
          ON CONFLICT (register_number) DO NOTHING
        `, [reg, name, deptId, batchId]);
        insertedStudents++;
      } catch (err) {
        console.error("Error inserting student:", reg, err.message);
      }
    }
    console.log(`Processed students. (${insertedStudents} added/checked)`);

    // Fetch faculties
    const facRes = await client.query(`SELECT id, faculty_name FROM faculty WHERE department_id = $1`, [deptId]);
    const faculties = facRes.rows;

    function findFacultyId(namePart) {
      const found = faculties.find(f => f.faculty_name.toLowerCase().includes(namePart.toLowerCase()));
      if (!found) console.warn("Faculty not found for:", namePart);
      return found?.id;
    }

    // Insert Subjects & Assignments
    for (const sub of subjects) {
      // Create subject
      let subId;
      const existSub = await client.query(`SELECT id FROM subjects WHERE course_code = $1`, [sub.code]);
      if (existSub.rows.length > 0) {
        subId = existSub.rows[0].id;
      } else {
        const ins = await client.query(`
          INSERT INTO subjects (department_id, subject_name, course_code, year, semester)
          VALUES ($1, $2, $3, 2, 3) RETURNING id
        `, [deptId, sub.name, sub.code]);
        subId = ins.rows[0].id;
      }

      for (const facName of sub.facs) {
        const facId = findFacultyId(facName);
        if (facId) {
          // Check assignment
          const existAssign = await client.query(`
            SELECT id FROM faculty_subject_assignments 
            WHERE faculty_id = $1 AND subject_id = $2 AND year = 2
          `, [facId, subId]);
          
          if (existAssign.rows.length === 0) {
            await client.query(`
              INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, year, semester, section, active)
              VALUES ($1, $2, $3, 2, 3, 'A', true)
            `, [facId, subId, deptId]);
            console.log(`Assigned ${facName} to ${sub.name}`);
          }
        }
      }
    }
    
    console.log("Done inserting second year data!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
