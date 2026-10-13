import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Send, LogOut, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface EvaluationUnit {
  evaluationIndex: number;
  subjectId: string;
  subjectName: string;
  courseCode: string;
  facultyId: string;
  facultyName: string;
  key: string; // `${subjectId}-${facultyId}`
  subjectOrder: number; // 1-based index among unique subjects
  totalSubjects: number;
  facultyOrderForSubject: number; // 1-based index among faculties for this subject
  totalFacultiesForSubject: number;
}

export default function FeedbackForm() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<any>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // All ordered evaluations for this student's assigned courses and faculties
  const [evaluations, setEvaluations] = useState<EvaluationUnit[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Ratings for all evaluations: { [evaluationKey]: { [questionId]: ratingValue } }
  const [allRatings, setAllRatings] = useState<Record<string, Record<string | number, number>>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savingSuccessText, setSavingSuccessText] = useState<string>('');
  const [draftRestoredText, setDraftRestoredText] = useState<string>('');
  const [error, setError] = useState('');

  const ratings = [
    { value: 5, label: 'Excellent', color: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { value: 4, label: 'Very Good', color: 'bg-green-500 hover:bg-green-600', text: 'text-green-700 bg-green-50 border-green-200' },
    { value: 3, label: 'Good', color: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-700 bg-blue-50 border-blue-200' },
    { value: 2, label: 'Satisfactory', color: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 1, label: 'Poor', color: 'bg-red-500 hover:bg-red-600', text: 'text-red-700 bg-red-50 border-red-200' },
  ];

  useEffect(() => {
    const init = async () => {
      const studentData = sessionStorage.getItem('student_data');
      if (!studentData) {
        navigate('/');
        return;
      }
      const parsedStudent = JSON.parse(studentData);
      setStudent(parsedStudent);

      try {
        // Fetch Department Name
        const { data: dept } = await supabase
          .from('departments')
          .select('department_name')
          .eq('id', parsedStudent.department_id)
          .single();
        if (dept) setDepartmentName(dept.department_name);

        // 1. Fetch active cycle for student's department and year
        const { data: cycles, error: cycleErr } = await supabase
          .from('feedback_cycles')
          .select('*')
          .eq('department_id', parsedStudent.department_id)
          .eq('year', parsedStudent.year)
          .eq('enabled', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (cycleErr) throw cycleErr;
        const cycle = cycles && cycles.length > 0 ? cycles[0] : null;
        setActiveCycle(cycle);

        if (!cycle) {
          navigate('/student/dashboard', { replace: true });
          return;
        }

        // 2. Fetch feedback questions
        const { data: qs, error: qsErr } = await supabase
          .from('feedback_questions')
          .select('*')
          .order('question_number', { ascending: true });

        if (qsErr) throw qsErr;
        setQuestions(qs || []);

        // 3. Fetch all active course and faculty assignments for this student
        const { data: assignments, error: asgErr } = await supabase
          .from('faculty_subject_assignments')
          .select(`
            id, faculty_id, subject_id,
            faculty:faculty_id(faculty_name),
            subjects:subject_id(subject_name, course_code)
          `)
          .eq('department_id', parsedStudent.department_id)
          .eq('year', parsedStudent.year)
          .eq('semester', parsedStudent.semester)
          .eq('section', parsedStudent.section)
          .eq('active', true);

        if (asgErr) throw asgErr;

        // 4. Check if student has already submitted in this cycle
        const { data: existingUserResponses, error: respErr } = await supabase
          .from('feedback_responses')
          .select('subject_id, faculty_id')
          .eq('student_id', parsedStudent.id)
          .eq('feedback_cycle_id', cycle.id);

        if (respErr) throw respErr;

        const submittedSet = new Set(
          (existingUserResponses || []).map((r: any) => `${r.subject_id}-${r.faculty_id}`)
        );

        // Group assignments by unique subject in stable order
        const subjectsMap = new Map<string, any[]>();
        (assignments || []).forEach((a: any) => {
          if (!subjectsMap.has(a.subject_id)) {
            subjectsMap.set(a.subject_id, []);
          }
          subjectsMap.get(a.subject_id)!.push(a);
        });

        const uniqueSubjectIds = Array.from(subjectsMap.keys());
        const totalSubjectsCount = uniqueSubjectIds.length;

        // If all assignments already have submissions in database, show completed screen directly
        const totalRequiredAssignments = assignments?.length || 0;
        if (totalRequiredAssignments > 0 && submittedSet.size >= totalRequiredAssignments) {
          setSubmitted(true);
          setLoading(false);
          return;
        }

        // Build flat ordered list of all required evaluations
        const evalList: EvaluationUnit[] = [];
        let evalIdx = 0;

        uniqueSubjectIds.forEach((sId, sOrderIdx) => {
          const asgsForSubj = subjectsMap.get(sId) || [];
          const totalFacultiesForSubj = asgsForSubj.length;

          asgsForSubj.forEach((a: any, fIdx: number) => {
            evalList.push({
              evaluationIndex: evalIdx++,
              subjectId: sId,
              subjectName: a.subjects?.subject_name || 'Subject',
              courseCode: a.subjects?.course_code || '',
              facultyId: a.faculty_id,
              facultyName: a.faculty?.faculty_name || 'Assigned Faculty',
              key: `${sId}-${a.faculty_id}`,
              subjectOrder: sOrderIdx + 1,
              totalSubjects: totalSubjectsCount,
              facultyOrderForSubject: fIdx + 1,
              totalFacultiesForSubject: totalFacultiesForSubj
            });
          });
        });

        setEvaluations(evalList);

        // Determine initial evaluation index (match subjectId from URL if provided, else 0)
        let initialIdx = 0;
        if (subjectId) {
          const matchedIdx = evalList.findIndex(e => e.subjectId === subjectId);
          if (matchedIdx !== -1) {
            initialIdx = matchedIdx;
          }
        }
        setCurrentIndex(initialIdx);

        // 5. Restore saved draft from localStorage (scoped to student and cycle)
        try {
          const draftKey = `tpt_feedback_draft_${parsedStudent.id}_${cycle.id}`;
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            const parsedDraft = JSON.parse(savedDraft);
            if (
              parsedDraft &&
              parsedDraft.studentId === parsedStudent.id &&
              parsedDraft.cycleId === cycle.id &&
              parsedDraft.answers &&
              typeof parsedDraft.answers === 'object'
            ) {
              setAllRatings(parsedDraft.answers);
              setDraftRestoredText('Saved draft restored. You can continue your feedback session.');
              setTimeout(() => setDraftRestoredText(''), 4000);
            }
          }
        } catch (e) {
          console.warn('Could not read draft from localStorage', e);
        }

      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to load feedback form. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [subjectId, navigate]);

  const currentEval = evaluations[currentIndex];
  const currentAnswers = currentEval ? allRatings[currentEval.key] || {} : {};

  // Rate a question (React state & draft only — ZERO database writes)
  const handleRating = (questionId: number, ratingValue: number) => {
    if (!currentEval || !student || !activeCycle) return;

    const updatedForCurrent = { ...currentAnswers, [questionId]: ratingValue };
    const updatedAll = { ...allRatings, [currentEval.key]: updatedForCurrent };

    setAllRatings(updatedAll);

    // Persist draft locally scoped to student and cycle
    try {
      const draftKey = `tpt_feedback_draft_${student.id}_${activeCycle.id}`;
      localStorage.setItem(draftKey, JSON.stringify({
        studentId: student.id,
        cycleId: activeCycle.id,
        updatedAt: new Date().toISOString(),
        answers: updatedAll
      }));
    } catch (e) {
      console.warn('Could not save draft to localStorage', e);
    }
  };

  // Check if current evaluation has answered all 10 questions
  const isCurrentEvalComplete =
    questions.length > 0 &&
    Object.keys(currentAnswers).length >= questions.length;

  // Next Course / Next Faculty (local navigation only — ZERO database writes)
  const handleNext = () => {
    if (!currentEval) return;

    const answeredCount = Object.keys(currentAnswers).length;
    if (answeredCount < questions.length) {
      setError(`Please answer all ${questions.length} questions for ${currentEval.subjectName} (${currentEval.facultyName}) before proceeding.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError('');
    if (currentIndex < evaluations.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous Course / Previous Faculty (local navigation only — ZERO database writes)
  const handlePrev = () => {
    setError('');
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Direct step navigation
  const handleJumpToEvaluation = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= evaluations.length) return;
    setError('');
    setCurrentIndex(targetIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate completion metrics
  const completedEvaluationsCount = evaluations.filter(e => {
    const ans = allRatings[e.key] || {};
    return questions.length > 0 && Object.keys(ans).length >= questions.length;
  }).length;

  const totalRequiredEvaluations = evaluations.length;
  const overallProgressPercent = totalRequiredEvaluations > 0
    ? Math.round((completedEvaluationsCount / totalRequiredEvaluations) * 100)
    : 0;

  // Single final submission for all courses and faculty members together
  const handleSubmitAll = async () => {
    // 1. Thorough client-side validation across all required evaluations
    for (const ev of evaluations) {
      const evAnswers = allRatings[ev.key] || {};
      const answeredCount = Object.keys(evAnswers).length;

      if (answeredCount < questions.length) {
        setError(`Incomplete Feedback: Please complete all ${questions.length} questions for ${ev.subjectName} (${ev.facultyName}) before final submission.`);
        setCurrentIndex(ev.evaluationIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSubmitting(true);
    setError('');
    setSavingSuccessText('');

    try {
      // Prepare response records for all evaluations
      const responseRecords = evaluations.map(ev => ({
        student_id: student.id,
        faculty_id: ev.facultyId,
        subject_id: ev.subjectId,
        department_id: student.department_id,
        feedback_cycle_id: activeCycle.id,
        status: 'COMPLETED'
      }));

      // Checkpoint 1: Insert into feedback_responses
      const { data: insertedResponses, error: responseError } = await supabase
        .from('feedback_responses')
        .insert(responseRecords)
        .select('id, faculty_id, subject_id');

      if (responseError) {
        if (responseError.code === '23505') {
          console.warn('Feedback responses already recorded in database:', responseError);
          try {
            localStorage.removeItem(`tpt_feedback_draft_${student.id}_${activeCycle.id}`);
          } catch (e) {
            console.warn('Could not clear draft from localStorage', e);
          }
          setSubmitted(true);
          setSubmitting(false);
          return;
        }

        console.error('Supabase insert failed:', responseError);
        alert('Feedback could not be saved. Please try again.');
        setError(responseError.message || 'Feedback could not be saved. Please try again.');
        setSubmitting(false);
        return;
      }

      if (!insertedResponses || insertedResponses.length === 0) {
        console.error('Supabase insert failed: No response records returned');
        alert('Feedback could not be saved. Please try again.');
        setError('Feedback could not be saved. Please try again.');
        setSubmitting(false);
        return;
      }

      // Map response IDs to evaluation keys `${subject_id}-${faculty_id}`
      const respMap = new Map<string, string>();
      insertedResponses.forEach((ir: any) => {
        respMap.set(`${ir.subject_id}-${ir.faculty_id}`, ir.id);
      });

      // Prepare answer records for all questions across all evaluations
      const allAnswerRecords: any[] = [];
      for (const ev of evaluations) {
        const respId = respMap.get(ev.key);
        if (!respId) {
          console.error(`Missing response ID for ${ev.subjectName}`);
          continue;
        }
        const evAnswers = allRatings[ev.key] || {};
        for (const q of questions) {
          const ratingVal = evAnswers[q.id];
          const optionLabel = ratings.find(r => r.value === ratingVal)?.label || '';
          allAnswerRecords.push({
            response_id: respId,
            question_id: q.id,
            rating_value: ratingVal,
            selected_option: optionLabel
          });
        }
      }

      // Checkpoint 2: Insert into feedback_answers
      const { data: insertedAnswers, error: answersError } = await supabase
        .from('feedback_answers')
        .insert(allAnswerRecords)
        .select('id');

      if (answersError || !insertedAnswers) {
        console.error('Supabase insert failed:', answersError);
        alert('Feedback could not be saved. Please try again.');
        setError(answersError?.message || 'Feedback answers could not be saved. Please try again.');
        setSubmitting(false);
        return;
      }

      // Clear draft locally on confirmed success
      try {
        const draftKey = `tpt_feedback_draft_${student.id}_${activeCycle.id}`;
        localStorage.removeItem(draftKey);
      } catch (e) {
        console.warn('Could not clear draft from localStorage', e);
      }

      // Show Completed only after confirmed database success
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Supabase insert failed:', err);
      alert('Feedback could not be saved. Please try again.');
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
                  <p className="text-blue-200 text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                    {departmentName || 'Student Feedback Portal'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem('student_data');
                  navigate('/');
                }}
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
          <div className="bg-white p-10 rounded-[24px] shadow-lg border border-gray-100 max-w-lg w-full text-center animate-fade-in">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">All Feedback Completed!</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              You have successfully completed all your subject feedbacks for this semester. Thank you for your valuable responses!
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem('student_data');
                navigate('/');
              }}
              className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-md"
            >
              Logout Safely
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !currentEval) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  // Navigation labels
  const isLastEvaluation = currentIndex === evaluations.length - 1;
  const nextEval = !isLastEvaluation ? evaluations[currentIndex + 1] : null;
  const prevEval = currentIndex > 0 ? evaluations[currentIndex - 1] : null;

  const nextButtonLabel = nextEval
    ? nextEval.subjectId === currentEval.subjectId
      ? 'Next Faculty'
      : 'Next Course'
    : 'Submit All Feedback';

  const prevButtonLabel = prevEval
    ? prevEval.subjectId === currentEval.subjectId
      ? 'Previous Faculty'
      : 'Previous Course'
    : 'Previous';

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      {/* Header */}
      <div className="bg-[#1E3A8A] text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                sessionStorage.removeItem('student_data');
                navigate('/');
              }}
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors text-sm font-medium bg-white/10 px-4 py-2 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Save & Logout
            </button>
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Session Progress</span>
              <p className="text-sm font-bold text-white">{completedEvaluationsCount} of {totalRequiredEvaluations} Evaluations Complete</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{currentEval.subjectName}</h1>
          <p className="text-blue-200 text-base sm:text-lg">
            Faculty: <span className="text-white font-medium">{currentEval.facultyName}</span>
            {currentEval.totalFacultiesForSubject > 1 && (
              <span className="ml-3 bg-white/20 text-xs px-2.5 py-1 rounded-full text-white font-semibold">
                Faculty {currentEval.facultyOrderForSubject} of {currentEval.totalFacultiesForSubject}
              </span>
            )}
          </p>
          <p className="text-blue-200 text-sm sm:text-base mt-1">
            Course Code: <span className="text-white font-medium">{currentEval.courseCode}</span>
          </p>

          {/* Badges and Overall Session Progress */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center bg-white/20 px-3.5 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
              Course {currentEval.subjectOrder} of {currentEval.totalSubjects}
            </div>
            <div className="inline-flex items-center bg-white/20 px-3.5 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-sm">
              {overallProgressPercent}% Total Completed
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">

        {/* Course Stepper Pills */}
        <div className="mb-4 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex items-center space-x-2 min-w-max">
            {evaluations.map((ev, idx) => {
              const evAnswers = allRatings[ev.key] || {};
              const isDone = questions.length > 0 && Object.keys(evAnswers).length >= questions.length;
              const isSelected = idx === currentIndex;

              return (
                <button
                  key={ev.key}
                  onClick={() => handleJumpToEvaluation(idx)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/30'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isDone ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                  <span className="truncate max-w-[120px]">{ev.courseCode || `Course ${ev.subjectOrder}`}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-lg p-6 sm:p-10 border border-gray-100">

          <div className="mb-8 pb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Evaluation {currentIndex + 1} of {evaluations.length}: {currentEval.subjectName}
              </h2>
              <p className="text-gray-500 text-sm">
                Rating Faculty: <span className="font-semibold text-gray-700">{currentEval.facultyName}</span>. Your feedback is completely anonymous.
              </p>
            </div>
            <div className="text-right flex items-center space-x-2">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                isCurrentEvalComplete
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {Object.keys(currentAnswers).length} / {questions.length} Answered
              </span>
            </div>
          </div>

          {draftRestoredText && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 font-medium text-sm flex items-center">
              <RotateCcw className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" />
              <span>{draftRestoredText}</span>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {savingSuccessText && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-medium text-sm flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-emerald-600" />
              <span>{savingSuccessText}</span>
            </div>
          )}

          {/* 10 Questions Form */}
          <div className="space-y-10">
            {questions.map((q, index) => (
              <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                <div className="flex items-start mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#1E3A8A] font-bold text-sm mr-4 flex-shrink-0">
                    {q.question_number}
                  </span>
                  <p className="text-base sm:text-lg font-medium text-gray-900 pt-1">{q.question_text}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pl-0 sm:pl-12 mt-3 sm:mt-0">
                  {ratings.map((rating) => {
                    const isSelected = currentAnswers[q.id] === rating.value;
                    return (
                      <button
                        key={rating.value}
                        type="button"
                        onClick={() => handleRating(q.id, rating.value)}
                        className={`
                          relative py-3 px-2 rounded-[16px] text-sm font-semibold transition-all duration-200 border-2
                          ${isSelected
                            ? rating.text + ' border-transparent ring-2 ring-offset-2 ring-blue-500 scale-105 shadow-sm'
                            : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}
                        `}
                      >
                        {rating.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={submitting}
                  className="flex items-center justify-center px-6 py-3.5 rounded-[18px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {prevButtonLabel}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!isLastEvaluation ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="flex items-center justify-center px-8 py-4 rounded-[20px] bg-[#1E3A8A] hover:bg-[#152e73] text-white font-bold text-lg transition-all shadow-[0_8px_20px_rgb(30,58,138,0.3)] hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {nextButtonLabel}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  disabled={submitting}
                  className="flex items-center justify-center px-9 py-4 rounded-[20px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all shadow-[0_8px_20px_rgb(5,150,105,0.35)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting All Feedback...' : 'Submit Feedback'}
                  {!submitting && <Send className="w-5 h-5 ml-2" />}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
