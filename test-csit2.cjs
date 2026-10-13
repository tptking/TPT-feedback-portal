const pg = require('pg');
const c = new pg.Client({connectionString:'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'});

async function run() {
  await c.connect();
  const deptId = '77777777-7777-7777-7777-777777777777';

  const resStudents = await c.query("SELECT id, year, semester, section FROM students WHERE department_id = $1 AND year = 3", [deptId]);
  const students = resStudents.rows;
  
  const resAsg = await c.query("SELECT * FROM faculty_subject_assignments WHERE department_id = $1 AND year = 3", [deptId]);
  const assignments = resAsg.rows;
  
  const resResp = await c.query(`
    SELECT r.student_id, r.subject_id, r.faculty_id, r.feedback_cycle_id 
    FROM feedback_responses r 
    JOIN feedback_cycles cy ON r.feedback_cycle_id = cy.id 
    WHERE cy.department_id = $1
  `, [deptId]);
  const responses = resResp.rows;

  const y3CycleId = '19f566c3-9ecf-4245-99bb-5557c0268594'; // Year 3 cycle ID

  let uiCompleted = 0;
  let scriptCompleted = 0;

  for (const s of students) {
    const required = assignments.filter(a => a.semester === s.semester && a.section === s.section).length;
    
    // UI logic (strict cycle match)
    const uiResponses = responses.filter(r => r.student_id === s.id && r.feedback_cycle_id === y3CycleId);
    const uiCompletedCount = new Set(uiResponses.map(r => r.subject_id + '-' + r.faculty_id)).size;
    
    // Script logic (no cycle match)
    const scriptResponses = responses.filter(r => r.student_id === s.id);
    const scriptCompletedCount = new Set(scriptResponses.map(r => r.subject_id + '-' + r.faculty_id)).size;

    if (required > 0 && uiCompletedCount >= required) uiCompleted++;
    if (required > 0 && scriptCompletedCount >= required) scriptCompleted++;

    if (scriptCompletedCount >= required && uiCompletedCount < required) {
       console.log(`MISMATCH: Student ${s.id} completed ${scriptCompletedCount} total, but only ${uiCompletedCount} in cycle ${y3CycleId}`);
       console.log("Their cycles:", [...new Set(scriptResponses.map(r => r.feedback_cycle_id))]);
    }
  }

  console.log(`UI Completed: ${uiCompleted}, Script Completed: ${scriptCompleted}`);
  await c.end();
}
run();
