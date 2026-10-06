import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const correctSubjects = [
  { code: '240-075414', name: 'Cloud Computing', facs: ['Nandha'] },
  { code: '240-075501', name: 'Artificial Intelligence and Machine Learning', facs: ['Saranya'] },
  { code: '240-075415', name: 'Internet of Things and Digital Twins', facs: ['RajaRajeswari', 'Sangeetha'] },
  { code: '240-075416', name: 'Computer Hardware and Networking', facs: ['Sangeetha', 'Sree Murugan'] },
  { code: '240-075502', name: 'Component Based Technology', facs: ['Sangeetha', 'RajaRajeswari', 'Saranya'] },
  { code: '240-075108', name: 'Innovation and Startup', facs: ['Saranya', 'RajaRajeswari', 'Sangeetha'] }
];

async function run() {
  try {
    await client.connect();
    
    const deptRes = await client.query(`SELECT id FROM departments WHERE department_name ILIKE '%Computer Engineering%'`);
    if (deptRes.rows.length === 0) throw new Error('Department not found');
    const deptId = deptRes.rows[0].id;

    // First delete all existing assignments for third year subjects in this department
    const subRes = await client.query(`SELECT id, subject_name FROM subjects WHERE year = 3 AND department_id = $1`, [deptId]);
    const subIds = subRes.rows.map(s => s.id);
    
    if (subIds.length > 0) {
      await client.query(`DELETE FROM faculty_subject_assignments WHERE subject_id = ANY($1)`, [subIds]);
      console.log('Deleted old assignments for third year.');
    }

    // Ensure all faculties exist
    let facRes = await client.query(`SELECT id, faculty_name FROM faculty WHERE department_id = $1`, [deptId]);
    let faculties = facRes.rows;

    // Check if Sree Murugan exists, if not, create
    if (!faculties.find(f => f.faculty_name.toLowerCase().includes('sree murugan'))) {
      const insFac = await client.query(`
        INSERT INTO faculty (faculty_name, department_id, email, password_hash)
        VALUES ($1, $2, $3, $4) RETURNING id, faculty_name
      `, ['Ms. U.K. Sree Murugan', deptId, 'sreemurugan@example.com', 'hash']);
      faculties.push(insFac.rows[0]);
    }

    function findFacultyId(namePart) {
      const found = faculties.find(f => f.faculty_name.toLowerCase().includes(namePart.toLowerCase()));
      if (!found) console.warn("Faculty not found for:", namePart);
      return found?.id;
    }

    // Re-insert new assignments
    for (const sub of correctSubjects) {
      let subId;
      const dbSub = subRes.rows.find(s => s.subject_name === sub.name);
      
      if (!dbSub) {
        // Create subject if not exists
        const insSub = await client.query(`
          INSERT INTO subjects (department_id, subject_name, course_code, year, semester)
          VALUES ($1, $2, $3, 3, 5) RETURNING id
        `, [deptId, sub.name, sub.code]);
        subId = insSub.rows[0].id;
      } else {
        subId = dbSub.id;
      }
      
      for (const facName of sub.facs) {
        const facId = findFacultyId(facName);
        if (facId) {
          await client.query(`
            INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, year, semester, section, active)
            VALUES ($1, $2, $3, 3, 5, 'A', true)
          `, [facId, subId, deptId]);
          console.log(`Assigned ${facName} to ${sub.name}`);
        }
      }
    }
    
    console.log("Successfully updated faculty assignments for third year!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
