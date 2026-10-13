import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();

  const csitDeptId = '77777777-7777-7777-7777-777777777777';
  const cycles = (await client.query(`SELECT * FROM feedback_cycles WHERE department_id = $1`, [csitDeptId])).rows;
  const students = (await client.query(`SELECT * FROM students WHERE department_id = $1`, [csitDeptId])).rows;
  const assignments = (await client.query(`SELECT * FROM faculty_subject_assignments WHERE department_id = $1`, [csitDeptId])).rows;
  const responses = (await client.query(`SELECT * FROM feedback_responses WHERE department_id = $1`, [csitDeptId])).rows;

  for (const year of [2, 3]) {
    const activeCycle = cycles.find(c => c.year === year);
    const filteredStudents = students.filter(s => s.year === year);
    const studentIds = new Set(filteredStudents.map(s => s.id));
    const filteredResponses = responses.filter(r => studentIds.has(r.student_id) && activeCycle && r.feedback_cycle_id === activeCycle.id);
    const filteredAssignments = assignments.filter(a => a.year === year);

    let fullyCompletedCount = 0;
    const completedList = [];
    const pendingList = [];

    filteredStudents.forEach(s => {
      const studentAssignments = filteredAssignments.filter(a => a.semester === s.semester && a.section === s.section);
      const requiredCount = studentAssignments.length;
      const sResponses = filteredResponses.filter(r => r.student_id === s.id);
      const completedSet = new Set(sResponses.map(r => `${r.subject_id}-${r.faculty_id}`));
      if (requiredCount > 0 && completedSet.size >= requiredCount) {
        fullyCompletedCount++;
        completedList.push(s.student_name);
      } else {
        pendingList.push({ name: s.student_name, reg: s.register_number, completed: completedSet.size, required: requiredCount });
      }
    });

    console.log(`Year ${year}: Total = ${filteredStudents.length}, Completed = ${fullyCompletedCount}, Pending = ${pendingList.length}`);
    if (pendingList.length > 0) {
      console.log(`Year ${year} Pending:`, pendingList);
    }
  }

  // Also CIVIL
  const ceDeptId = '11111111-1111-1111-1111-111111111111';
  const ceCycles = (await client.query(`SELECT * FROM feedback_cycles WHERE department_id = $1`, [ceDeptId])).rows;
  const ceStudents = (await client.query(`SELECT * FROM students WHERE department_id = $1`, [ceDeptId])).rows;
  const ceAssignments = (await client.query(`SELECT * FROM faculty_subject_assignments WHERE department_id = $1`, [ceDeptId])).rows;
  const ceResponses = (await client.query(`SELECT * FROM feedback_responses WHERE department_id = $1`, [ceDeptId])).rows;

  console.log('\n--- CIVIL ENGINEERING ---');
  for (const year of [2, 3]) {
    const activeCycle = ceCycles.find(c => c.year === year);
    const filteredStudents = ceStudents.filter(s => s.year === year);
    const studentIds = new Set(filteredStudents.map(s => s.id));
    const filteredResponses = ceResponses.filter(r => studentIds.has(r.student_id) && activeCycle && r.feedback_cycle_id === activeCycle.id);
    const filteredAssignments = ceAssignments.filter(a => a.year === year);

    let fullyCompletedCount = 0;
    filteredStudents.forEach(s => {
      const studentAssignments = ceAssignments.filter(a => a.year === year && a.semester === s.semester && a.section === s.section);
      const requiredCount = studentAssignments.length;
      const sResponses = filteredResponses.filter(r => r.student_id === s.id);
      const completedSet = new Set(sResponses.map(r => `${r.subject_id}-${r.faculty_id}`));
      if (requiredCount > 0 && completedSet.size >= requiredCount) {
        fullyCompletedCount++;
      }
    });

    console.log(`Year ${year}: Total = ${filteredStudents.length}, Completed = ${fullyCompletedCount}, Pending = ${filteredStudents.length - fullyCompletedCount}`);
  }

  await client.end();
}

run();
