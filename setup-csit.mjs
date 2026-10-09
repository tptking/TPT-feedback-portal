import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const facultiesList = [
  "A. Prabhakaran",
  "G. Subasri",
  "B. Boobeshwari",
  "S. Gowri Shankari"
];

const subjects = [
  { code: '240-163402', name: 'Computer Architecture (CA)', facs: ['A. Prabhakaran'] },
  { code: '240-163403', name: 'Basics of Digital Electronics (BDE)', facs: ['G. Subasri', 'B. Boobeshwari'] },
  { code: '240-163404', name: 'E-Publishing Practical (EPP)', facs: ['B. Boobeshwari'] },
  { code: '240-073405', name: 'C Programming (CP)', facs: ['A. Prabhakaran', 'S. Gowri Shankari'] },
  { code: '240-073406', name: 'Web Designing (WD)', facs: ['A. Prabhakaran', 'S. Gowri Shankari', 'G. Subasri'] },
  { code: '240-073407', name: 'Operating System (OS)', facs: ['G. Subasri', 'B. Boobeshwari'] }
];

async function run() {
  try {
    await client.connect();
    
    // 1. Get or Create CSIT Department
    let deptId;
    const deptRes = await client.query(`SELECT id FROM departments WHERE department_code = 'CSIT'`);
    if (deptRes.rows.length === 0) {
      const insDept = await client.query(`
        INSERT INTO departments (department_name, department_code) VALUES ('CSIT', 'CSIT') RETURNING id
      `);
      deptId = insDept.rows[0].id;
      console.log("Created department CSIT with ID:", deptId);
    } else {
      deptId = deptRes.rows[0].id;
      console.log("Found department CSIT with ID:", deptId);
    }
    
    // 2. Insert Faculties
    for (const facName of facultiesList) {
      const exist = await client.query(`SELECT id FROM faculty WHERE faculty_name = $1 AND department_id = $2`, [facName, deptId]);
      if (exist.rows.length === 0) {
        const username = facName.toLowerCase().replace(/[^a-z]/g, '');
        await client.query(`INSERT INTO faculty (department_id, faculty_name, username) VALUES ($1, $2, $3)`, [deptId, facName, username]);
        console.log("Created faculty:", facName);
      }
    }

    const facRes = await client.query(`SELECT id, faculty_name FROM faculty WHERE department_id = $1`, [deptId]);
    const faculties = facRes.rows;

    function findFacultyId(namePart) {
      const found = faculties.find(f => f.faculty_name === namePart);
      return found?.id;
    }

    // 3. Insert Subjects & Assignments
    for (const sub of subjects) {
      let subId;
      const existSub = await client.query(`SELECT id FROM subjects WHERE course_code = $1 AND department_id = $2`, [sub.code, deptId]);
      if (existSub.rows.length > 0) {
        subId = existSub.rows[0].id;
      } else {
        const ins = await client.query(`
          INSERT INTO subjects (department_id, subject_name, course_code, year, semester)
          VALUES ($1, $2, $3, 2, 3) RETURNING id
        `, [deptId, sub.name, sub.code]);
        subId = ins.rows[0].id;
        console.log("Created subject:", sub.name);
      }

      for (const facName of sub.facs) {
        const facId = findFacultyId(facName);
        if (facId) {
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
        } else {
          console.error("Could not find ID for faculty:", facName);
        }
      }
    }

    // 4. Create an active feedback cycle for CSIT 2nd Year
    const cycleCheck = await client.query(`
      SELECT id FROM feedback_cycles WHERE department_id = $1 AND year = 2 AND enabled = true
    `, [deptId]);

    if (cycleCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO feedback_cycles (cycle_name, department_id, year, semester, start_date, enabled)
        VALUES ('CSIT Year 2 Sem 3 Feedback', $1, 2, 3, CURRENT_DATE, true)
      `, [deptId]);
      console.log("Created active feedback cycle for CSIT 2nd Year");
    }
    
    console.log("Setup complete for CSIT Second Year!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
