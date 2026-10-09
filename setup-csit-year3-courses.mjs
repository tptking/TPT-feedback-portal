import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const facultiesList = [
  "B. Boobeshwari",
  "S. Gowri Shankari",
  "G. Subasri",
  "U. K. Sree Murugan",
  "A. Prabhakaran"
];

const subjects = [
  { code: '240-165414', name: 'System Administration (SA)', facs: ['B. Boobeshwari'] },
  { code: '240-075501A', name: 'Artificial Intelligence and Machine Learning (AI & ML)', facs: ['S. Gowri Shankari'] },
  { code: '240-165415', name: 'Python Programming Practical (PPP)', facs: ['G. Subasri', 'S. Gowri Shankari'] },
  { code: '240-075416', name: 'Computer Hardware and Networking (CHN)', facs: ['U. K. Sree Murugan'] },
  { code: '240-165502A', name: 'Cloud Computing and Applications (CLA)', facs: ['S. Gowri Shankari', 'B. Boobeshwari'] },
  { code: '240-075108', name: 'Innovation & Startup (IST)', facs: ['A. Prabhakaran', 'S. Gowri Shankari'] }
];

async function run() {
  try {
    await client.connect();
    
    // 1. Get CSIT Department
    let deptId;
    const deptRes = await client.query("SELECT id FROM departments WHERE department_code = 'CSIT'");
    if (deptRes.rows.length === 0) {
      console.error("CSIT Department not found!");
      return;
    }
    deptId = deptRes.rows[0].id;
    
    // 2. Insert Faculties
    for (const facName of facultiesList) {
      const exist = await client.query("SELECT id FROM faculty WHERE faculty_name = $1 AND department_id = $2", [facName, deptId]);
      if (exist.rows.length === 0) {
        const username = facName.toLowerCase().replace(/[^a-z]/g, '');
        await client.query("INSERT INTO faculty (department_id, faculty_name, username) VALUES ($1, $2, $3)", [deptId, facName, username]);
        console.log("Created faculty:", facName);
      }
    }

    const facRes = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1", [deptId]);
    const faculties = facRes.rows;

    function findFacultyId(namePart) {
      const found = faculties.find(f => f.faculty_name === namePart);
      return found?.id;
    }

    // 3. Insert Subjects & Assignments for Year 3, Sem 5
    for (const sub of subjects) {
      let subId;
      const existSub = await client.query("SELECT id FROM subjects WHERE course_code = $1 AND department_id = $2", [sub.code, deptId]);
      if (existSub.rows.length > 0) {
        subId = existSub.rows[0].id;
      } else {
        const ins = await client.query(`
          INSERT INTO subjects (department_id, subject_name, course_code, year, semester)
          VALUES ($1, $2, $3, 3, 5) RETURNING id
        `, [deptId, sub.name, sub.code]);
        subId = ins.rows[0].id;
        console.log("Created subject:", sub.name);
      }

      for (const facName of sub.facs) {
        const facId = findFacultyId(facName);
        if (facId) {
          const existAssign = await client.query(`
            SELECT id FROM faculty_subject_assignments 
            WHERE faculty_id = $1 AND subject_id = $2 AND year = 3
          `, [facId, subId]);
          
          if (existAssign.rows.length === 0) {
            await client.query(`
              INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, year, semester, section, active)
              VALUES ($1, $2, $3, 3, 5, 'A', true)
            `, [facId, subId, deptId]);
            console.log(`Assigned ${facName} to ${sub.name}`);
          }
        } else {
          console.error("Could not find ID for faculty:", facName);
        }
      }
    }

    // 4. Create an active feedback cycle for CSIT 3rd Year
    const cycleCheck = await client.query(`
      SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 3 AND enabled = true
    `, [deptId]);

    if (cycleCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, start_date, enabled)
        VALUES ('CSIT Year 3 Sem 5 Feedback', $1, 3, 5, CURRENT_DATE, true)
      `, [deptId]);
      console.log("Created active feedback cycle for CSIT 3rd Year");
    }
    
    console.log("Setup complete for CSIT Third Year!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
