import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, BookOpen, CheckCircle, Clock } from 'lucide-react';

interface Assignment {
  subject_id: string;
  subject_name: string;
  course_code: string;
  faculties: { faculty_id: string; faculty_name: string; isSubmitted: boolean; }[];
  isSubmitted: boolean;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [departmentName, setDepartmentName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentData = sessionStorage.getItem('student_data');
    if (!studentData) {
      navigate('/');
      return;
    }
    
    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent);
    fetchDashboardData(parsedStudent);
  }, [navigate]);

  const fetchDashboardData = async (studentInfo: any) => {
    try {
      // 1. Fetch Department Name
      const { data: dept } = await supabase
        .from('departments')
        .select('department_name')
        .eq('id', studentInfo.department_id)
        .single();
      
      if (dept) setDepartmentName(dept.department_name);

      // 2. Fetch Active Feedback Cycle
      const { data: cycle } = await supabase
        .from('feedback_cycles')
        .select('*')
        .eq('enabled', true)
        .single();
      
      setActiveCycle(cycle);

      // 3. Fetch Faculty Subject Assignments for this student's exact criteria
      const { data: fsaData, error: fsaError } = await supabase
        .from('faculty_subject_assignments')
        .select(`
          faculty_id,
          subject_id,
          faculty:faculty_id (faculty_name),
          subjects:subject_id (subject_name, course_code)
        `)
        .eq('department_id', studentInfo.department_id)
        .eq('year', studentInfo.year)
        .eq('semester', studentInfo.semester)
        .eq('section', studentInfo.section)
        .eq('active', true);

      if (fsaError) throw fsaError;

      if (fsaData && cycle) {
        // 4. For each assignment, check if the student has already submitted feedback
        const subjectsMap = new Map();
        await Promise.all(
          fsaData.map(async (assignment: any) => {
            const { count } = await supabase
              .from('feedback_responses')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', studentInfo.id)
              .eq('faculty_id', assignment.faculty_id)
              .eq('subject_id', assignment.subject_id)
              .eq('feedback_cycle_id', cycle.id);

            const isSub = (count && count > 0) ? true : false;
            
            if (!subjectsMap.has(assignment.subject_id)) {
              subjectsMap.set(assignment.subject_id, {
                subject_id: assignment.subject_id,
                subject_name: assignment.subjects.subject_name,
                course_code: assignment.subjects.course_code,
                faculties: []
              });
            }
            subjectsMap.get(assignment.subject_id).faculties.push({
              faculty_id: assignment.faculty_id,
              faculty_name: assignment.faculty.faculty_name,
              isSubmitted: isSub
            });
          })
        );
        
        const groupedAssignments = Array.from(subjectsMap.values()).map((subj: any) => {
          const isFullySubmitted = subj.faculties.every((f: any) => f.isSubmitted);
          return {
            ...subj,
            isSubmitted: isFullySubmitted
          };
        });

        setAssignments(groupedAssignments);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('student_data');
    navigate('/');
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  const completedCount = assignments.filter(a => a.isSubmitted).length;
  const totalCount = assignments.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Navbar */}
      <nav className="bg-[#1E3A8A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full p-1">
                <img src="https://www.tpt.edu.in/assets/images/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <span className="font-bold text-xl tracking-wide">TPT Feedback</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Student Profile Card */}
        <div className="bg-[#1E3A8A] rounded-[24px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold mb-1">{student.student_name}</h1>
              <p className="text-blue-200 font-medium tracking-wide">{student.register_number}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-8 w-full md:w-auto">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Department</p>
                <p className="font-medium">{departmentName}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Year / Sem</p>
                <p className="font-medium">Yr {student.year} • Sem {student.semester}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Progress Summary */}
        {totalCount > 0 && (
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Feedback Progress</h3>
                <p className="text-xl font-bold text-gray-900">{completedCount} of {totalCount} Completed</p>
              </div>
              <span className="text-xl font-bold text-[#1E3A8A]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-[#1E3A8A] h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Subjects Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-[#1E3A8A]" />
            Your Subjects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment, index) => (
              <div 
                key={assignment.subject_id}
                className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="mb-4 flex-1">
                  <div className="text-xs font-bold text-[#1E3A8A] bg-blue-50 w-fit px-3 py-1 rounded-full mb-3">
                    {assignment.course_code}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3">
                    📘 {assignment.subject_name}
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Faculty</p>
                    {assignment.faculties?.map((f, i) => (
                      <div key={i} className="text-gray-900 font-medium text-sm mb-1 last:mb-0 flex items-center justify-between">
                        <span>{f.faculty_name}</span>
                        {f.isSubmitted && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-semibold text-gray-500 mr-2">Status:</span>
                    {assignment.isSubmitted ? (
                      <span className="flex items-center text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-md">
                        <CheckCircle className="w-4 h-4 mr-1" /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 font-bold text-sm bg-amber-50 px-2 py-1 rounded-md">
                        ● Pending
                      </span>
                    )}
                  </div>

                  {assignment.isSubmitted ? (
                    <button
                      disabled
                      className="flex items-center justify-center w-full py-3.5 px-4 rounded-[16px] bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
                    >
                      FEEDBACK SUBMITTED
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/student/feedback/${assignment.subject_id}`)}
                      className="flex items-center justify-center w-full py-3.5 px-4 rounded-[16px] bg-[#1E3A8A] hover:bg-[#152e73] text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-md shadow-blue-900/20"
                    >
                      GIVE FEEDBACK →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {(!activeCycle || assignments.length === 0) && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-[24px] border border-dashed border-gray-300">
                <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium text-lg">No subjects available for feedback</p>
                {!activeCycle && <p className="text-gray-400 text-sm mt-2">There is currently no active feedback cycle.</p>}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
