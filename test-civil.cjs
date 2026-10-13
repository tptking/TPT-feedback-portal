const pg = require('pg');
const c = new pg.Client({connectionString:'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'});

async function run() {
  await c.connect();
  const deptId = '11111111-1111-1111-1111-111111111111';

  // get students
  const resStudents = await c.query("SELECT id, year, semester, section FROM students WHERE department_id = $1", [deptId]);
  
  // get assignments
  const resAsg = await c.query("SELECT * FROM faculty_subject_assignments WHERE department_id = $1", [deptId]);
  
  // get responses
  const resResp = await c.query(`
    SELECT r.student_id, r.subject_id, r.faculty_id 
    FROM feedback_responses r 
    JOIN feedback_cycles cy ON r.feedback_cycle_id = cy.id 
    WHERE cy.department_id = $1
  `, [deptId]);

  const students = resStudents.rows;
  const assignments = resAsg.rows;
  const responses = resResp.rows;

  let y2Total = 0, y2Completed = 0, y2Pending = 0;
  let y3Total = 0, y3Completed = 0, y3Pending = 0;

  for (const s of students) {
    const required = assignments.filter(a => a.semester === s.semester && a.section === s.section).length;
    const sResponses = responses.filter(r => r.student_id === s.id);
    const completedIds = new Set(sResponses.map(r => r.subject_id + '-' + r.faculty_id));
    const completedCount = completedIds.size;
    
    if (s.year === 2) {
      y2Total++;
      if (required > 0 && completedCount >= required) y2Completed++;
      else y2Pending++;
    } else if (s.year === 3) {
      y3Total++;
      if (required > 0 && completedCount >= required) y3Completed++;
      else y3Pending++;
    }
  }

  console.log(`Year 2: Total=${y2Total}, Completed=${y2Completed}, Pending=${y2Pending}`);
  console.log(`Year 3: Total=${y3Total}, Completed=${y3Completed}, Pending=${y3Pending}`);
  await c.end();
}
run();
