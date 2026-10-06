import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const updatedSubjects = [
  { name: 'Operating Systems', facs: ['Saranya'] },
  { name: 'Web Designing', facs: ['Nandha'] },
  { name: 'C Programming', facs: ['RajaRajeswari', 'Saranya'] },
  { name: 'Digital Logic Design Lab', facs: ['Sangeetha', 'Saranya'] },
  { name: 'Data Structures Using C', facs: ['RajaRajeswari'] },
  { name: 'Digital Logic Design', facs: ['Sangeetha'] }
];

async function run() {
  try {
    await client.connect();
    
    const deptRes = await client.query(`SELECT id FROM departments WHERE department_name ILIKE '%Computer Engineering%'`);
    if (deptRes.rows.length === 0) throw new Error('Department not found');
    const deptId = deptRes.rows[0].id;

    // Fetch faculties
    const facRes = await client.query(`SELECT id, faculty_name FROM faculty WHERE department_id = $1`, [deptId]);
    const faculties = facRes.rows;

    function findFacultyId(namePart) {
      const found = faculties.find(f => f.faculty_name.toLowerCase().includes(namePart.toLowerCase()));
      if (!found) console.warn("Faculty not found for:", namePart);
      return found?.id;
    }

    // First delete all assignments for second year subjects
    const subRes = await client.query(`SELECT id, subject_name FROM subjects WHERE year = 2 AND department_id = $1`, [deptId]);
    const subIds = subRes.rows.map(s => s.id);
    
    if (subIds.length > 0) {
      await client.query(`DELETE FROM faculty_subject_assignments WHERE subject_id = ANY($1)`, [subIds]);
      console.log('Deleted old assignments for second year.');
    }

    // Re-insert new assignments
    for (const sub of updatedSubjects) {
      const dbSub = subRes.rows.find(s => s.subject_name === sub.name);
      if (!dbSub) {
        console.warn('Subject not found:', sub.name);
        continue;
      }
      
      for (const facName of sub.facs) {
        const facId = findFacultyId(facName);
        if (facId) {
          await client.query(`
            INSERT INTO faculty_subject_assignments (faculty_id, subject_id, department_id, year, semester, section, active)
            VALUES ($1, $2, $3, 2, 3, 'A', true)
          `, [facId, dbSub.id, deptId]);
          console.log(`Assigned ${facName} to ${sub.name}`);
        }
      }
    }
    
    console.log("Successfully updated faculty assignments for second year!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
