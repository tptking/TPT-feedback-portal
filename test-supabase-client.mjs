import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://welaaaqfbgqxhpjjbmzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTI2ODgsImV4cCI6MjEwNjc4ODY4OH0.AC12UcCKErlPNO5i3LKH5BrLB3YlDELqPPnFJ_AJ8aI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase query as anon client...');

  const csitDeptId = '77777777-7777-7777-7777-777777777777';

  // 1. Fetch cycles
  const { data: cycles, error: cycleErr } = await supabase
    .from('feedback_cycles')
    .select('*')
    .eq('department_id', csitDeptId)
    .order('created_at', { ascending: false });

  console.log('Cycles count:', cycles?.length, 'Error:', cycleErr);

  // 2. Fetch responses using the EXACT code from FacultyDashboard.tsx
  const cycleIds = cycles.map((c) => c.id);
  let allResps = [];
  let rStart = 0;
  const rLimit = 1000;

  while (true) {
    const { data: respsChunk, error: respErr } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('department_id', csitDeptId)
      .in('feedback_cycle_id', cycleIds)
      .range(rStart, rStart + rLimit - 1);

    if (respErr) {
      console.error('Error fetching responses chunk:', respErr);
      break;
    }

    if (respsChunk && respsChunk.length > 0) {
      console.log(`Fetched chunk: rStart=${rStart}, returned=${respsChunk.length}`);
      allResps = [...allResps, ...respsChunk];
      if (respsChunk.length < rLimit) break;
      rStart += rLimit;
    } else {
      break;
    }
  }

  console.log('Total responses fetched by frontend loop:', allResps.length);

  // Check unique response IDs
  const uniqueIds = new Set(allResps.map(r => r.id));
  console.log('Unique response IDs:', uniqueIds.size);

  // Fetch students
  const { data: stus } = await supabase
    .from('students')
    .select('*')
    .eq('department_id', csitDeptId);

  // Fetch assignments
  const { data: asgs } = await supabase
    .from('faculty_subject_assignments')
    .select(`
      id, faculty_id, subject_id, active, year, semester, section,
      faculty:faculty_id (faculty_name),
      subjects:subject_id (subject_name, course_code)
    `)
    .eq('department_id', csitDeptId);

  for (const year of [2, 3]) {
    const activeCycle = cycles.find(c => c.year === year);
    const filteredStudents = stus.filter(s => s.year === year);
    const studentIds = new Set(filteredStudents.map(s => s.id));
    const filteredResponses = allResps.filter(r => studentIds.has(r.student_id) && activeCycle && r.feedback_cycle_id === activeCycle.id);
    const filteredAssignments = asgs.filter(a => a.year === year);

    let fullyCompletedCount = 0;
    filteredStudents.forEach(s => {
      const studentAssignments = filteredAssignments.filter(a => a.semester === s.semester && a.section === s.section);
      const requiredCount = studentAssignments.length;
      const sResponses = filteredResponses.filter(r => r.student_id === s.id);
      const completedSet = new Set(sResponses.map(r => `${r.subject_id}-${r.faculty_id}`));
      if (requiredCount > 0 && completedSet.size >= requiredCount) {
        fullyCompletedCount++;
      }
    });

    console.log(`Year ${year}: Students = ${filteredStudents.length}, Completed = ${fullyCompletedCount}, Pending = ${filteredStudents.length - fullyCompletedCount}`);
  }
}

test();
