import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const subjects = [
  { code: '240-013402', name: 'Mechanics of Materials (MOM)', facs: ['M. Ponni'] },
  { code: '240-013403', name: 'Construction Materials (CM)', facs: ['Dr. R. Lavanya'] },
  { code: '240-013404', name: 'Surveying Practice (SP)', facs: ['Dr. R. Lavanya', 'N. Gokulkannan'] },
  { code: '240-013405', name: 'Building Planning and Drawing (BPD)', facs: ['S. Ambiga', 'R. Renuka'] },
  { code: '240-013406', name: 'Hydraulics (HYD)', facs: ['Dr. R. Lavanya', 'G. Vairamani'] },
  { code: '240-013407', name: 'Material Testing Lab (MTL)', facs: ['M. Ponni', 'S. Ambiga', 'R. Renuka'] }
];

async function run() {
  await client.connect();
  const deptId = '11111111-1111-1111-1111-111111111111'; // CE
  
  // Create missing faculty records
  const facSet = new Set();
  subjects.forEach(s => s.facs.forEach(f => facSet.add(f)));
  const faculties = Array.from(facSet);

  for (const facName of faculties) {
    const username = facName.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${username}@tpt.edu.in`;

    const exist = await client.query("SELECT id FROM faculty WHERE faculty_name = $1 AND department_id = $2", [facName, deptId]);
    if (exist.rows.length === 0) {
      await client.query(
        "INSERT INTO faculty (department_id, faculty_name, username, auth_user_id) VALUES ($1, $2, $3, (SELECT id FROM auth.users WHERE email = $4))",
        [deptId, facName, username, email]
      );
      console.log("Created faculty:", facName);
    }
  }

  // Create assignments
  const facRes = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1", [deptId]);
  const facDb = facRes.rows;
  function findFacultyId(name) {
    return facDb.find(f => f.faculty_name === name)?.id;
  }

  for (const sub of subjects) {
    const existSub = await client.query("SELECT id FROM subjects WHERE course_code = $1 AND department_id = $2", [sub.code, deptId]);
    if (existSub.rows.length > 0) {
      const subId = existSub.rows[0].id;
      
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
  }

  console.log("Finished assignments");
  await client.end();
}

run();
