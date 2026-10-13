import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, BookOpen, CheckCircle } from 'lucide-react';

interface Assignment {
  subject_id: string;
  subject_name: string;
  course_code: string;
  faculties: { faculty_id: string; faculty_name: string; isSubmitted: boolean; }[];
  isSubmitted: boolean;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student] = useState<any>(() => {
    const studentData = sessionStorage.getItem('student_data');
    if (!studentData) return null;
    try {
      return JSON.parse(studentData);
    } catch {
      return null;
    }
  });

  const [departmentName, setDepartmentName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (studentInfo: any) => {
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
        .eq('department_id', studentInfo.department_id)
        .eq('year', studentInfo.year)
        .eq('enabled', true)
        .single();
      
      setActiveCycle(cycle);

      // 3. Fetch Faculty Subject Assignments for this student's exact criteria
      const { data: fsaData, error: fsaError } = await supabase
        .from('faculty_subject_assignments')
        .select(`
          faculty_id,
          subject_id,
          section,
          faculty:faculty_id (faculty_name),
          subjects:subject_id (subject_name, course_code)
        `)
        .eq('department_id', studentInfo.department_id)
        .eq('year', studentInfo.year)
        .eq('semester', studentInfo.semester)
        .eq('active', true);

      if (fsaError) throw fsaError;

      const matchesSection = (asgSec?: string | null, stuSec?: string | null): boolean => {
        const cleanAsg = asgSec ? asgSec.trim().toUpperCase() : '';
        const cleanStu = stuSec ? stuSec.trim().toUpperCase() : '';
        if (cleanAsg) {
          return cleanStu === cleanAsg;
        }
        return true;
      };

      const validAssignments = (fsaData || []).filter((a: any) =>
        matchesSection(a.section, studentInfo.section)
      );

      if (validAssignments.length > 0 && cycle) {
        // 4. Check which assignments the student has already submitted
        const { data: userResponses, error: responsesError } = await supabase
          .from('feedback_responses')
          .select('id, subject_id, faculty_id')
          .eq('student_id', studentInfo.id)
          .eq('feedback_cycle_id', cycle.id);
          
        if (responsesError) {
          console.error("Could not load feedback status:", responsesError);
          // Show an unknown/error state rather than falsely showing Completed.
          setAssignments([]);
          return;
        }

        const submittedSet = new Set<string>();
        if (userResponses && userResponses.length > 0) {
          const respIds = userResponses.map((r: any) => r.id);
          const { data: answersData, error: ansError } = await supabase
            .from('feedback_answers')
            .select('response_id')
            .in('response_id', respIds);

          if (!ansError && answersData) {
            const ansCounts = new Map<string, number>();
            answersData.forEach((a: any) => {
              ansCounts.set(a.response_id, (ansCounts.get(a.response_id) || 0) + 1);
            });
            userResponses.forEach((r: any) => {
              if ((ansCounts.get(r.id) || 0) >= 10) {
                submittedSet.add(`${r.subject_id}-${r.faculty_id}`);
              }
            });
          }
        }

        // Validate completion using all required assignments and their persisted responses
        const isFeedbackSaved = validAssignments.length > 0 && validAssignments.every((a: any) =>
          submittedSet.has(`${a.subject_id}-${a.faculty_id}`)
        );

        const status = isFeedbackSaved
          ? "Completed"
          : "Pending";

        const subjectsMap = new Map();
        validAssignments.forEach((assignment: any) => {
          const isSub = submittedSet.has(`${assignment.subject_id}-${assignment.faculty_id}`);
          const fObj = Array.isArray(assignment.faculty) ? assignment.faculty[0] : assignment.faculty;
          const sObj = Array.isArray(assignment.subjects) ? assignment.subjects[0] : assignment.subjects;
          
          if (!subjectsMap.has(assignment.subject_id)) {
            subjectsMap.set(assignment.subject_id, {
              subject_id: assignment.subject_id,
              subject_name: sObj?.subject_name || 'Subject',
              course_code: sObj?.course_code || '',
              faculties: []
            });
          }
          subjectsMap.get(assignment.subject_id).faculties.push({
            faculty_id: assignment.faculty_id,
            faculty_name: fObj?.faculty_name || 'Assigned Faculty',
            isSubmitted: isSub
          });
        });
        
        const groupedAssignments = Array.from(subjectsMap.values()).map((subj: any) => {
          const isFullySubmitted = subj.faculties.every((f: any) => f.isSubmitted);
          return {
            ...subj,
            isSubmitted: isFullySubmitted
          };
        });

        if (status === "Pending") {
          // Find first uncompleted subject and route immediately
          const firstUncompleted = groupedAssignments.find((a: any) => !a.isSubmitted);
          if (firstUncompleted) {
            navigate(`/student/feedback/${firstUncompleted.subject_id}`, { replace: true });
            return; // Stop rendering this component
          }
        }

        setAssignments(groupedAssignments);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => {
      fetchDashboardData(student);
    }, 0);
    return () => clearTimeout(timer);
  }, [student, navigate, fetchDashboardData]);

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



  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#1E3A8A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full p-1 shadow-sm">
                <img src="https://www.tpt.edu.in/assets/images/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="font-bold text-lg sm:text-xl tracking-wide truncate">TPT Feedback</h1>
                <p className="text-blue-200 text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">{departmentName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Completion Screen */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[24px] shadow-lg border border-gray-100 max-w-lg w-full text-center">
          {!activeCycle || assignments.length === 0 ? (
            <>
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Feedback</h2>
              <p className="text-gray-500 mb-8">There is currently no active feedback cycle for your class.</p>
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shadow-sm">
                  Status: Completed
                </span>
                {departmentName && (
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-[#1E3A8A] shadow-sm">
                    Department: {departmentName}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback form has been completed successfully!</h2>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {student?.student_name || student?.name}
              </p>
              <p className="text-xs font-medium text-gray-500 mb-6 font-mono">
                Register No: {student?.register_number}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                You have successfully completed all your subject feedbacks for this semester. Thank you for your valuable responses!
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
              >
                Logout Safely
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
