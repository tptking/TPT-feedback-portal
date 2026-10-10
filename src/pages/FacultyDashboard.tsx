import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, BarChart3, Users, Settings, FileSpreadsheet, FileText, CheckCircle2, XCircle, Edit, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'results' | 'status' | 'control'>('results');
  const [loading, setLoading] = useState(true);
  
  const [faculty, setFaculty] = useState<any>(null);
  const [department, setDepartment] = useState<any>(null);
  const [allCycles, setAllCycles] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const [students, setStudents] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(3);

  const activeCycle = allCycles.find(c => c.year === selectedYear);

  const [editModal, setEditModal] = useState<any>(null);

  useEffect(() => {
    initDashboard();
    const interval = setInterval(() => {
      initDashboard();
    }, 10000);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, []);

  const initDashboard = async () => {
    try {
      // 1. Authenticate Faculty
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        navigate('/');
        return;
      }

      const { data: fac } = await supabase
        .from('faculty')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (!fac) {
        navigate('/');
        return;
      }
      setFaculty(fac);

      // 2. Fetch Department
      const { data: dept } = await supabase
        .from('departments')
        .select('*')
        .eq('id', fac.department_id)
        .single();
      setDepartment(dept);

      // 3. Fetch All Cycles for the Department
      const { data: cycles } = await supabase
        .from('feedback_cycles')
        .select('*')
        .eq('department_id', fac.department_id)
        .order('created_at', { ascending: false });
      setAllCycles(cycles || []);

      if (cycles && cycles.length > 0) {
        // Fetch Students in Department
        const { data: stus } = await supabase
          .from('students')
          .select('*')
          .eq('department_id', fac.department_id);
        setStudents(stus || []);

        // Fetch Questions
        const { data: qs } = await supabase
          .from('feedback_questions')
          .select('*')
          .order('question_number', { ascending: true });
        setQuestions(qs || []);

        // Fetch Assignments (Courses) for Department
        const { data: asgs } = await supabase
          .from('faculty_subject_assignments')
          .select(`
            id, faculty_id, subject_id, active, year, semester, section,
            faculty:faculty_id (faculty_name),
            subjects:subject_id (subject_name, course_code)
          `)
          .eq('department_id', fac.department_id);
        setAssignments(asgs || []);

        // Fetch Responses for all Cycles
        const cycleIds = cycles.map((c: any) => c.id);
        const { data: resps } = await supabase
          .from('feedback_responses')
          .select('*')
          .eq('department_id', fac.department_id)
          .in('feedback_cycle_id', cycleIds);
        setResponses(resps || []);

        // Fetch Answers for those responses
        if (resps && resps.length > 0) {
          const respIds = resps.map((r: any) => r.id);
          const allAnswers = [];
          
          // Fetch answers in chunks to avoid the 1000-row limit in Supabase
          const CHUNK_SIZE = 50;
          for (let i = 0; i < respIds.length; i += CHUNK_SIZE) {
            const chunk = respIds.slice(i, i + CHUNK_SIZE);
            const { data: ansChunk } = await supabase
              .from('feedback_answers')
              .select('*')
              .in('response_id', chunk);
            
            if (ansChunk) {
              allAnswers.push(...ansChunk);
            }
          }
          setAnswers(allAnswers);
        } else {
          setAnswers([]);
        }
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleCycle = async () => {
    if (!activeCycle) return;
    const newStatus = !activeCycle.enabled;
    await supabase
      .from('feedback_cycles')
      .update({ enabled: newStatus })
      .eq('id', activeCycle.id);
    setAllCycles(prev => prev.map(c => c.id === activeCycle.id ? { ...c, enabled: newStatus } : c));
  };

  const saveAssignmentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;

    try {
      // Update Subject
      await supabase
        .from('subjects')
        .update({ subject_name: editModal.subject_name, course_code: editModal.course_code })
        .eq('id', editModal.subject_id);

      setEditModal(null);
      await initDashboard(); // Refresh data
    } catch (err) {
      console.error('Error saving edits', err);
    }
  };

  // ----- EXPORT UTILS -----

  const exportToWord = (htmlId: string, filename: string) => {
    const el = document.getElementById(htmlId);
    if (!el) return;
    const html = el.outerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 12px 16px; text-align: center; } th:nth-child(2), td:nth-child(2) { text-align: left; }</style></head><body>";
    const footer = "</body></html>";
    const content = header + html + footer;
    
    // @ts-ignore
    if (window.htmlDocx && window.saveAs) {
      // @ts-ignore
      const converted = window.htmlDocx.asBlob(content);
      // @ts-ignore
      window.saveAs(converted, `${filename.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
    } else {
      // Fallback for non-mac browsers
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(content);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = filename.replace(/[^a-zA-Z0-9]/g, '_') + '.doc';
      fileDownload.click();
      document.body.removeChild(fileDownload);
    }
  };

  const exportFacultyToExcel = (fac: any, subjectName: string) => {
    const data: any[] = [
      { A: 'Subject:', B: subjectName },
      { A: 'Faculty:', B: fac.faculty?.faculty_name },
      {},
      { 
        A: 'Qns. No', B: 'Questions', C: 'Excellent (5)', D: 'Very Good (4)', 
        E: 'Good (3)', F: 'Satisfactory (2)', G: 'Poor (1)', 
        H: 'Marks Secured', I: 'Feedback (%)' 
      }
    ];

    fac.qStats.forEach((q: any, i: number) => {
      data.push({
        A: i + 1,
        B: q.question,
        C: q.c5,
        D: q.c4,
        E: q.c3,
        F: q.c2,
        G: q.c1,
        H: q.obtained,
        I: q.percentage
      });
    });

    const totalC5 = fac.qStats.reduce((acc: number, q: any) => acc + q.c5, 0);
    const totalC4 = fac.qStats.reduce((acc: number, q: any) => acc + q.c4, 0);
    const totalC3 = fac.qStats.reduce((acc: number, q: any) => acc + q.c3, 0);
    const totalC2 = fac.qStats.reduce((acc: number, q: any) => acc + q.c2, 0);
    const totalC1 = fac.qStats.reduce((acc: number, q: any) => acc + q.c1, 0);
    const totalObtained = fac.qStats.reduce((acc: number, q: any) => acc + q.obtained, 0);
    const totalMax = fac.qStats.reduce((acc: number, q: any) => acc + q.max, 0);
    const totalPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : "0.00";

    data.push({
      A: '', B: 'Total', C: totalC5, D: totalC4, E: totalC3, F: totalC2, G: totalC1, H: totalObtained, I: totalPercentage
    });
    
    data.push({
      A: '', B: 'Over All Percentage:', C: totalPercentage, D: '', E: '', F: '', G: '', H: '', I: ''
    });

    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });

    ws['!cols'] = [
      { wch: 8 },  // Qns No
      { wch: 50 }, // Questions
      { wch: 15 }, // Excellent
      { wch: 15 }, // Very Good
      { wch: 12 }, // Good
      { wch: 16 }, // Satisfactory
      { wch: 10 }, // Poor
      { wch: 15 }, // Marks Secured
      { wch: 15 }  // Feedback (%)
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback");
    XLSX.writeFile(wb, `Feedback_${fac.faculty?.faculty_name?.replace(/\\s+/g, '_') || 'Faculty'}.xlsx`);
  };

  // ----- CALCULATIONS -----
  const getFilteredData = () => {
    const filteredStudents = students.filter(s => s.year === selectedYear);
    const studentIds = new Set(filteredStudents.map(s => s.id));
    const filteredResponses = responses.filter(r => studentIds.has(r.student_id) && activeCycle && r.feedback_cycle_id === activeCycle.id);
    const filteredAssignments = assignments.filter(a => a.year === selectedYear);
    return { filteredStudents, filteredResponses, filteredAssignments };
  };

  const calculateResult = () => {
    if (!activeCycle) return null;

    const { filteredStudents, filteredResponses, filteredAssignments } = getFilteredData();

    // Filter assignments that have responses
    let totalQuestions = questions.length;
    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;
    
    // Group assignments by subject_id
    const subjectsMap = new Map();
    filteredAssignments.forEach(a => {
      if (!subjectsMap.has(a.subject_id)) {
        subjectsMap.set(a.subject_id, {
          subject: a.subjects,
          faculties: []
        });
      }
      subjectsMap.get(a.subject_id).faculties.push(a);
    });

    const groupedCourseStats = Array.from(subjectsMap.values()).map(subjGrp => {
      const facultiesStats = subjGrp.faculties.map((a: any) => {
        const courseResponses = filteredResponses.filter(r => r.subject_id === a.subject_id && r.faculty_id === a.faculty_id);
        const courseResCount = courseResponses.length;
        
        const qStats = questions.map(q => {
          const qAnswers = answers.filter(ans => 
            ans.question_id === q.id && 
            courseResponses.some(r => r.id === ans.response_id)
          );

          let count5 = 0, count4 = 0, count3 = 0, count2 = 0, count1 = 0;
          qAnswers.forEach(ans => {
            if (ans.rating_value === 5) count5++;
            if (ans.rating_value === 4) count4++;
            if (ans.rating_value === 3) count3++;
            if (ans.rating_value === 2) count2++;
            if (ans.rating_value === 1) count1++;
          });

          const obtained = (5 * count5) + (4 * count4) + (3 * count3) + (2 * count2) + (1 * count1);
          const max = courseResCount * 5;
          const percentage = max > 0 ? ((obtained / max) * 100).toFixed(2) : "0.00";

          totalObtainedMarks += obtained;
          totalMaxMarks += max;

          return {
            question: q.question_text,
            responses: courseResCount,
            c5: count5, c4: count4, c3: count3, c2: count2, c1: count1,
            obtained, max, percentage
          };
        });

        return {
          ...a,
          totalResponses: courseResCount,
          qStats
        };
      });

      return {
        subject: subjGrp.subject,
        faculties: facultiesStats
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2) : "0.00";
    
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

    const completedStudents = fullyCompletedCount;
    const totalDeptStudents = filteredStudents.length;

    return { groupedCourseStats, overallPercentage, completedStudents, totalDeptStudents, totalQuestions };
  };

  const getStudentStatusData = () => {
    if (!activeCycle) return { completed: [], pending: [] };
    
    const { filteredStudents, filteredResponses, filteredAssignments } = getFilteredData();
    
    const completed: any[] = [];
    const pending: any[] = [];

    filteredStudents.forEach(s => {
      const studentAssignments = filteredAssignments.filter(a => a.semester === s.semester && a.section === s.section);
      const requiredCount = studentAssignments.length;
      const sResponses = filteredResponses.filter(r => r.student_id === s.id);
      const completedSet = new Set(sResponses.map(r => `${r.subject_id}-${r.faculty_id}`));
      const completedCount = completedSet.size;

      if (requiredCount > 0 && completedCount >= requiredCount) {
        const latest = sResponses.reduce((a, b) => new Date(a.submitted_at) > new Date(b.submitted_at) ? a : b, sResponses[0]);
        completed.push({
          Register_Number: s.register_number,
          Student_Name: s.student_name,
          Status: 'Completed',
          Submitted: latest ? new Date(latest.submitted_at).toLocaleString() : 'N/A'
        });
      } else {
        pending.push({
          Register_Number: s.register_number,
          Student_Name: s.student_name,
          Status: requiredCount === 0 ? 'No Subjects' : `Pending (${completedCount}/${requiredCount})`,
          Submitted: '-'
        });
      }
    });

    return { completed, pending };
  };

  if (loading || !faculty) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center font-sans">
         <div className="w-20 h-20 mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
         </div>
         <h1 className="text-2xl font-bold text-gray-900 mb-2">Desktop Access Only</h1>
         <p className="text-gray-500 max-w-md">The Faculty Dashboard contains complex data tables that require a larger screen. Please access this portal from a desktop or laptop computer.</p>
      </div>
    );
  }

  const resultData = calculateResult();
  const statusData = getStudentStatusData();

  const exportStatusWord = () => {
    const maxRows = Math.max(statusData.completed.length, statusData.pending.length);
    
    let rowsHtml = '';
    for (let i = 0; i < maxRows; i++) {
      const comp = statusData.completed[i] || { Register_Number: '', Student_Name: '' };
      const pend = statusData.pending[i] || { Register_Number: '', Student_Name: '' };
      rowsHtml += `
        <tr>
          <td>${comp.Register_Number}</td>
          <td>${comp.Student_Name}</td>
          <td>${pend.Register_Number}</td>
          <td>${pend.Student_Name}</td>
        </tr>
      `;
    }

    const html = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th colspan="2" style="border: 1px solid black; padding: 8px;">Completed students</th>
            <th colspan="2" style="border: 1px solid black; padding: 8px;">Pending students</th>
          </tr>
          <tr>
            <th style="border: 1px solid black; padding: 8px;">Register number</th>
            <th style="border: 1px solid black; padding: 8px;">Name</th>
            <th style="border: 1px solid black; padding: 8px;">Register number</th>
            <th style="border: 1px solid black; padding: 8px;">Name</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Student Status</title><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 12px 16px; text-align: center; } th:nth-child(2), td:nth-child(2), th:nth-child(4), td:nth-child(4) { text-align: left; }</style></head><body>";
    const footer = "</body></html>";
    const content = header + html + footer;
    const filename = 'Student_Status';
    
    // @ts-ignore
    if (window.htmlDocx && window.saveAs) {
      // @ts-ignore
      const converted = window.htmlDocx.asBlob(content);
      // @ts-ignore
      window.saveAs(converted, `${filename}.docx`);
    } else {
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(content);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = filename + '.doc';
      fileDownload.click();
      document.body.removeChild(fileDownload);
    }
  };

  const exportStatusExcel = () => {
    const data: any[] = [];
    const maxRows = Math.max(statusData.completed.length, statusData.pending.length);
    data.push({ A: 'Completed students', B: '', C: 'Pending students', D: '' });
    data.push({ A: 'Register number', B: 'Name', C: 'Register number', D: 'Name' });
    
    for (let i = 0; i < maxRows; i++) {
      const comp = statusData.completed[i] || { Register_Number: '', Student_Name: '' };
      const pend = statusData.pending[i] || { Register_Number: '', Student_Name: '' };
      data.push({
        A: comp.Register_Number,
        B: comp.Student_Name,
        C: pend.Register_Number,
        D: pend.Student_Name
      });
    }

    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: {r:0, c:0}, e: {r:0, c:1} });
    ws['!merges'].push({ s: {r:0, c:2}, e: {r:0, c:3} });
    
    ws['!cols'] = [{wch: 20}, {wch: 30}, {wch: 20}, {wch: 30}];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Status");
    XLSX.writeFile(wb, "Student_Status.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#1E3A8A] text-white flex flex-col shadow-xl">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-full p-1">
              <img src="https://www.tpt.edu.in/assets/images/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="font-bold text-xl tracking-wide">TPT Admin</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('results')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'results' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10'}`}
            >
              <BarChart3 className="w-5 h-5" /> <span>Feedback Results</span>
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'status' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10'}`}
            >
              <Users className="w-5 h-5" /> <span>Student Status</span>
            </button>
            <button
              onClick={() => setActiveTab('control')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'control' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10'}`}
            >
              <Settings className="w-5 h-5" /> <span>Feedback Control</span>
            </button>
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-blue-200 hover:text-white font-medium text-sm"
          >
            <LogOut className="w-5 h-5" /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 z-10 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{department?.department_name}</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Logged in as {faculty?.faculty_name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold text-gray-700">Select Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#1E3A8A] focus:border-[#1E3A8A] p-2.5 outline-none font-medium shadow-sm cursor-pointer"
            >
              <option value={2}>Second Year (II)</option>
              <option value={3}>Third Year (III)</option>
            </select>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          
          {/* TAB 1: RESULTS */}
          {activeTab === 'results' && resultData && (
            <div className="animate-fade-in max-w-6xl mx-auto">
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Overall Feedback Results</h2>
                <div className="flex space-x-3">
                  <button onClick={() => { setLoading(true); initDashboard(); }} className="flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200">
                    <RefreshCw className="w-4 h-4 mr-2 text-gray-500" /> Refresh Data
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Overall Feedback</p>
                  <p className="text-3xl font-black text-[#1E3A8A]">{resultData.overallPercentage}%</p>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Students</p>
                  <p className="text-3xl font-black text-gray-900">{resultData.totalDeptStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Completed</p>
                  <p className="text-3xl font-black text-emerald-600">{resultData.completedStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Pending</p>
                  <p className="text-3xl font-black text-amber-500">{resultData.totalDeptStudents - resultData.completedStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Questions</p>
                  <p className="text-3xl font-black text-gray-900">{resultData.totalQuestions}</p>
                </div>
              </div>

              <div id="export-results">
                <div style={{ display: 'none' }} className="print-header">
                  <h2>{department?.department_name} - Feedback Report</h2>
                  <p>Overall Percentage: {resultData.overallPercentage}% | Completed: {resultData.completedStudents}/{resultData.totalDeptStudents}</p>
                  <p>Formula: Obtained Marks = (5×N5)+(4×N4)+(3×N3)+(2×N2)+(1×N1). Percentage = (Obtained / (Total×5)) × 100</p>
                </div>

                {resultData.groupedCourseStats.map((courseGrp, idx) => (
                  <div key={idx} className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gray-50 p-6 border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{courseGrp.subject?.subject_name}</h3>
                      <p className="text-sm font-medium text-gray-500">Code: {courseGrp.subject?.course_code}</p>
                    </div>
                    
                    {courseGrp.faculties.map((fac: any, fIdx: number) => (
                      <div key={fIdx} className="border-b border-gray-100 last:border-0">
                        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <p className="text-sm font-medium text-gray-600">Faculty: <span className="text-gray-900 font-bold text-base">{fac.faculty?.faculty_name}</span></p>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200 shadow-sm">
                              {fac.totalResponses} Responses
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button onClick={() => exportToWord(`export-table-${fac.faculty?.id}-${courseGrp.subject?.id}`, `Feedback_${fac.faculty?.faculty_name}`)} className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors border border-blue-100">
                              <FileText className="w-3.5 h-3.5 mr-1.5" /> Word
                            </button>
                            <button onClick={() => exportFacultyToExcel(fac, courseGrp.subject?.subject_name)} className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">
                              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
                            </button>
                            <div className="bg-[#1E3A8A] text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm ml-2">
                              {fac.totalResponses > 0 
                                ? ((fac.qStats.reduce((acc: number, q: any) => acc + q.obtained, 0) / fac.qStats.reduce((acc: number, q: any) => acc + q.max, 0)) * 100).toFixed(2) + '%'
                                : '0.00%'}
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto p-4" id={`export-table-${fac.faculty?.id}-${courseGrp.subject?.id}`}>
                          <div style={{ display: 'none' }} className="print-header mb-4">
                            <h2>{courseGrp.subject?.subject_name} ({courseGrp.subject?.course_code})</h2>
                            <h3>Faculty: {fac.faculty?.faculty_name}</h3>
                          </div>
                          <table className="w-full text-sm text-center border-collapse border border-gray-200">
                            <thead className="bg-gray-100 text-gray-700 font-bold text-xs">
                              <tr>
                                <th className="border border-gray-300 px-2 py-3">Qns. No</th>
                                <th className="border border-gray-300 px-4 py-3 text-left w-1/3">Questions</th>
                                <th className="border border-gray-300 px-2 py-3">Excellent (5)</th>
                                <th className="border border-gray-300 px-2 py-3">Very Good (4)</th>
                                <th className="border border-gray-300 px-2 py-3">Good (3)</th>
                                <th className="border border-gray-300 px-2 py-3">Satisfactory (2)</th>
                                <th className="border border-gray-300 px-2 py-3">Poor (1)</th>
                                <th className="border border-gray-300 px-2 py-3">Marks Secured</th>
                                <th className="border border-gray-300 px-2 py-3">Feedback (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fac.qStats.map((q: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-2 py-3 font-medium">{i + 1}</td>
                                  <td className="border border-gray-300 px-4 py-3 text-left text-gray-900 font-medium">{q.question}</td>
                                  <td className="border border-gray-300 px-2 py-3">{q.c5}</td>
                                  <td className="border border-gray-300 px-2 py-3">{q.c4}</td>
                                  <td className="border border-gray-300 px-2 py-3">{q.c3}</td>
                                  <td className="border border-gray-300 px-2 py-3">{q.c2}</td>
                                  <td className="border border-gray-300 px-2 py-3">{q.c1}</td>
                                  <td className="border border-gray-300 px-2 py-3 font-bold">{q.obtained}</td>
                                  <td className="border border-gray-300 px-2 py-3">{q.percentage}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50 font-bold">
                                <td colSpan={2} className="border border-gray-300 px-4 py-3 text-right">Total</td>
                                <td className="border border-gray-300 px-2 py-3">{fac.qStats.reduce((acc: number, q: any) => acc + q.c5, 0)}</td>
                                <td className="border border-gray-300 px-2 py-3">{fac.qStats.reduce((acc: number, q: any) => acc + q.c4, 0)}</td>
                                <td className="border border-gray-300 px-2 py-3">{fac.qStats.reduce((acc: number, q: any) => acc + q.c3, 0)}</td>
                                <td className="border border-gray-300 px-2 py-3">{fac.qStats.reduce((acc: number, q: any) => acc + q.c2, 0)}</td>
                                <td className="border border-gray-300 px-2 py-3">{fac.qStats.reduce((acc: number, q: any) => acc + q.c1, 0)}</td>
                                <td className="border border-gray-300 px-2 py-3">{fac.qStats.reduce((acc: number, q: any) => acc + q.obtained, 0)}</td>
                                <td className="border border-gray-300 px-2 py-3">
                                  {fac.totalResponses > 0 ? ((fac.qStats.reduce((acc: number, q: any) => acc + q.obtained, 0) / fac.qStats.reduce((acc: number, q: any) => acc + q.max, 0)) * 100).toFixed(2) : "0.00"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="p-4 text-center border-t border-gray-200 bg-gray-50 font-bold text-lg text-gray-800 mt-4 rounded-xl border">
                            Over All Percentage: {fac.totalResponses > 0 ? ((fac.qStats.reduce((acc: number, q: any) => acc + q.obtained, 0) / fac.qStats.reduce((acc: number, q: any) => acc + q.max, 0)) * 100).toFixed(2) : "0.00"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT STATUS */}
          {activeTab === 'status' && (
            <div className="animate-fade-in max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Student Response Status</h2>
                <div className="flex space-x-3">
                  <button onClick={() => { setLoading(true); initDashboard(); }} className="flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200">
                    <RefreshCw className="w-4 h-4 mr-2 text-gray-500" /> Refresh
                  </button>
                  <button onClick={exportStatusWord} className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="w-4 h-4 mr-2" /> Export Word
                  </button>
                  <button onClick={exportStatusExcel} className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors">
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
                  </button>
                </div>
              </div>

              <div id="export-status">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Completed Table */}
                  <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4">
                      <h3 className="font-bold text-emerald-800 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Completed Students ({statusData.completed.length})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3">Reg. No</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Submitted At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {statusData.completed.map((s, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-6 py-3 font-semibold text-gray-900">{s.Register_Number}</td>
                              <td className="px-6 py-3 font-medium text-gray-700">{s.Student_Name}</td>
                              <td className="px-6 py-3 text-gray-500 text-xs">{s.Submitted}</td>
                            </tr>
                          ))}
                          {statusData.completed.length === 0 && (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No completed students</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pending Table */}
                  <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
                      <h3 className="font-bold text-amber-800 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" /> Pending Students ({statusData.pending.length})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3">Reg. No</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {statusData.pending.map((s, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-6 py-3 font-semibold text-gray-900">{s.Register_Number}</td>
                              <td className="px-6 py-3 font-medium text-gray-700">{s.Student_Name}</td>
                              <td className="px-6 py-3 text-center">
                                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold uppercase">{s.Status}</span>
                              </td>
                            </tr>
                          ))}
                          {statusData.pending.length === 0 && (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">All students completed</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEEDBACK CONTROL */}
          {activeTab === 'control' && (
            <div className="animate-fade-in max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Feedback Control Center</h2>
                <p className="text-gray-500 mt-1">Manage global feedback availability and course configurations.</p>
              </div>

              {/* Master Toggle */}
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Global Feedback Status</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">Current Status:</span>
                    {activeCycle?.enabled ? (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> ENABLED
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center">
                        <XCircle className="w-4 h-4 mr-1" /> DISABLED
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleCycle}
                  className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 ${
                    activeCycle?.enabled ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {activeCycle?.enabled ? 'Disable Feedback System' : 'Enable Feedback System'}
                </button>
              </div>

              {/* Edit Assignments List */}
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Course Configuration</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Course Name</th>
                        <th className="px-6 py-4">Course Code</th>
                        <th className="px-6 py-4">Course Teachers</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.from(
                        getFilteredData().filteredAssignments.reduce((acc, a) => {
                          if (!acc.has(a.subject_id)) {
                            acc.set(a.subject_id, {
                              subject_id: a.subject_id,
                              subject_name: a.subjects?.subject_name,
                              course_code: a.subjects?.course_code,
                              faculties: []
                            });
                          }
                          acc.get(a.subject_id).faculties.push(a.faculty?.faculty_name);
                          return acc;
                        }, new Map()).values()
                      ).map((c: any, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{c.subject_name}</td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{c.course_code}</td>
                          <td className="px-6 py-4 text-gray-600 font-medium">
                            {c.faculties.map((f: any, idx: number) => (
                              <div key={idx}>Teacher {idx + 1}: <span className="font-bold">{f}</span></div>
                            ))}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setEditModal({
                                subject_id: c.subject_id,
                                subject_name: c.subject_name,
                                course_code: c.course_code
                              })}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-gray-900">Edit Configuration</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={saveAssignmentEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Course Name</label>
                <input 
                  type="text" 
                  value={editModal.subject_name} 
                  onChange={e => setEditModal({...editModal, subject_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Course Code</label>
                <input 
                  type="text" 
                  value={editModal.course_code} 
                  onChange={e => setEditModal({...editModal, course_code: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  required
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 px-4 bg-[#1E3A8A] text-white font-bold rounded-xl hover:bg-[#152e73] shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
