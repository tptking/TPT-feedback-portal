import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

const coId = '66666666-6666-6666-6666-666666666666';

// Corrected Year 2 allocations:
// 1 240-073402 Digital Logic Design: Ms. R. Sangeetha
// 2 240-073403 Data Structures Using C: Ms. R. RajaRajeswari
// 3 240-073404 Digital Logic Design Lab: Ms. R. Sangeetha, Ms. V. Saranya
// 4 240-073405 C Programming: Ms. R. RajaRajeswari, Ms. V. Saranya
// 5 240-073406 Web Designing: Ms. M. Nandha
// 6 240-073407 Operating Systems: Ms. V. Saranya
const correctedAllocations = [
  { code: '240-073402', name: 'Digital Logic Design', facs: ['Sangeetha'] },
  { code: '240-073403', name: 'Data Structures Using C', facs: ['RajaRajeswari'] },
  { code: '240-073404', name: 'Digital Logic Design Lab', facs: ['Sangeetha', 'Saranya'] },
  { code: '240-073405', name: 'C Programming', facs: ['RajaRajeswari', 'Saranya'] },
  { code: '240-073406', name: 'Web Designing', facs: ['Nandha'] },
  { code: '240-073407', name: 'Operating Systems', facs: ['Saranya'] }
];

async function main() {
  await client.connect();
  console.log("=== UPDATING COMPUTER ENGINEERING YEAR 2 ALLOCATIONS ===");

  const facRows = await client.query("SELECT id, faculty_name FROM faculty WHERE department_id = $1", [coId]);
  function findFacId(keyword) {
    const found = facRows.rows.find(f => f.faculty_name.toLowerCase().includes(keyword.toLowerCase()));
    if (!found) throw new Error(`Faculty matching '${keyword}' not found in CO department`);
    return found;
  }

  const subRows = await client.query("SELECT id, course_code, subject_name FROM subjects WHERE department_id = $1 AND year = 2", [coId]);
  const subMap = new Map();
  for (const s of subRows.rows) {
    subMap.set(s.course_code, s.id);
  }

  await client.query("BEGIN");
  try {
    // Delete existing Year 2 assignments
    await client.query("DELETE FROM faculty_subject_assignments WHERE department_id = $1 AND year = 2", [coId]);
    console.log("Cleared existing Year 2 assignments.");

    let count = 0;
    for (const alloc of correctedAllocations) {
      const subId = subMap.get(alloc.code);
      if (!subId) throw new Error(`Subject ${alloc.code} not found in Year 2`);

      for (const fKey of alloc.facs) {
        const fac = findFacId(fKey);
        await client.query(`
          INSERT INTO faculty_subject_assignments (department_id, faculty_id, subject_id, year, semester, section, active)
          VALUES ($1, $2, $3, 2, 3, 'A', true)
        `, [coId, fac.id, subId]);
        count++;
        console.log(`Assigned: ${alloc.code} (${alloc.name}) -> ${fac.faculty_name}`);
      }
    }
    console.log(`Successfully created ${count} corrected course assignments.`);

    await client.query("COMMIT");
    console.log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("TRANSACTION ROLLED BACK DUE TO ERROR:", err);
    throw err;
  }

  // Verification
  console.log("\n=== VERIFYING NEW YEAR 2 COURSE ALLOCATIONS ===");
  const verifyRes = await client.query(`
    SELECT fsa.id, s.course_code, s.subject_name, f.faculty_name, fsa.year, fsa.semester, fsa.section, fsa.active
    FROM faculty_subject_assignments fsa
    JOIN subjects s ON fsa.subject_id = s.id
    JOIN faculty f ON fsa.faculty_id = f.id
    WHERE fsa.department_id = $1 AND fsa.year = 2
    ORDER BY s.course_code, f.faculty_name
  `, [coId]);
  console.table(verifyRes.rows);

  // Verify Year 3 untouched
  const y3Count = await client.query(`
    SELECT count(*) as y3_assignments_count
    FROM faculty_subject_assignments
    WHERE department_id = $1 AND year = 3
  `, [coId]);
  console.log("Year 3 assignments count (untouched):", y3Count.rows[0].y3_assignments_count);

  await client.end();
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
