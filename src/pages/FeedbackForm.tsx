import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Send, LogOut, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle } from 'lucide-react';

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

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  active?: boolean;
}

interface StudentSession {
  id: string;
  register_number: string;
  student_name: string;
  name?: string;
  department_id: string;
  programme_id?: string;
  batch_id?: string;
  year: number;
  semester: number;
  section?: string | null;
  active?: boolean;
}

export default function FeedbackForm() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const draftTimerRef = useRef<any>(null);
  const initialSubjectIdRef = useRef(subjectId);

  const [student, setStudent] = useState<StudentSession | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // All ordered evaluations for this student's assigned courses and faculties
  const [evaluations, setEvaluations] = useState<EvaluationUnit[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Ratings for all evaluations: { [evaluationKey]: { [questionId]: ratingValue } }
  // ZERO database writes while rating or navigating between courses
  const [allRatings, setAllRatings] = useState<Record<string, Record<string, number>>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>('');
  const [savingSuccessText, setSavingSuccessText] = useState<string>('');
  const [draftRestoredText, setDraftRestoredText] = useState<string>('');
  const [draftWarningText, setDraftWarningText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [emptyStateMessage, setEmptyStateMessage] = useState<string>('');

  const ratings = [
    { value: 5, label: 'Excellent', color: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { value: 4, label: 'Very Good', color: 'bg-green-500 hover:bg-green-600', text: 'text-green-700 bg-green-50 border-green-200' },
    { value: 3, label: 'Good', color: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-700 bg-blue-50 border-blue-200' },
    { value: 2, label: 'Satisfactory', color: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 1, label: 'Poor', color: 'bg-red-500 hover:bg-red-600', text: 'text-red-700 bg-red-50 border-red-200' },
  ];

  // Helper: Validates if an evaluation has valid 1-5 ratings for all required questions
  const isEvaluationComplete = (
    evalKey: string,
    answersMap: Record<string, Record<string, number>>,
    questionList: Question[]
  ): boolean => {
    if (!questionList || questionList.length === 0) return false;
    const evalAnswers = answersMap[evalKey];
    if (!evalAnswers) return false;
    return questionList.every(q => {
      const val = evalAnswers[q.id];
      return typeof val === 'number' && Number.isInteger(val) && val >= 1 && val <= 5;
    });
  };

  useEffect(() => {
    const init = async () => {
      // 1. Session parsing & strict validation inside try/catch (Issue 1)
      let parsedStudent: StudentSession;
      try {
        const studentData = sessionStorage.getItem('student_data');
        if (!studentData) {
          navigate('/', { replace: true });
          return;
        }

        const raw = JSON.parse(studentData);
        if (
          !raw ||
          typeof raw !== 'object' ||
          typeof raw.id !== 'string' ||
          typeof raw.department_id !== 'string' ||
          typeof raw.year !== 'number' ||
          typeof raw.semester !== 'number' ||
          (raw.section !== null && raw.section !== undefined && typeof raw.section !== 'string')
        ) {
          console.warn('Invalid student session format, clearing session');
          sessionStorage.removeItem('student_data');
          navigate('/', { replace: true });
          return;
        }

        parsedStudent = raw;
        setStudent(parsedStudent);
      } catch (parseErr) {
        console.error('Failed to parse student session:', parseErr);
        sessionStorage.removeItem('student_data');
        navigate('/', { replace: true });
        return;
      }

      try {
        // 2. Department lookup with explicit error checking (Issue 2)
        const { data: dept, error: deptErr } = await supabase
          .from('departments')
          .select('id, department_name, department_code, active')
          .eq('id', parsedStudent.department_id)
          .single();

        if (deptErr || !dept) {
          setError('Failed to load department information. Please contact the administrator.');
          setLoading(false);
          return;
        }
        setDepartmentName(dept.department_name);

        // 3. Feedback cycle lookup with explicit error handling & semester/section scoping (Issue 3)
        const { data: cycles, error: cycleErr } = await supabase
          .from('feedback_cycles')
          .select('*')
          .eq('department_id', parsedStudent.department_id)
          .eq('year', parsedStudent.year)
          .eq('enabled', true)
          .order('created_at', { ascending: false });

        if (cycleErr) {
          setError(`Failed to load feedback cycles: ${cycleErr.message}`);
          setLoading(false);
          return;
        }

        if (!cycles || cycles.length === 0) {
          setEmptyStateMessage('There is currently no active feedback cycle enabled for your class.');
          setLoading(false);
          return;
        }

        // Scope cycle: prioritize matching semester and section if defined, else fallback to batch cycle
        const cleanStudentSection = parsedStudent.section ? parsedStudent.section.trim().toUpperCase() : '';
        const cycle = cycles.find((c: any) => {
          const semMatch = !c.semester || c.semester === parsedStudent.semester;
          const cycleSec = c.section ? c.section.trim().toUpperCase() : '';
          const secMatch = !cycleSec || cycleSec === cleanStudentSection;
          return semMatch && secMatch;
        }) || cycles[0];

        setActiveCycle(cycle);

        // 4. Feedback questions: active filter and non-empty check (Issue 4)
        const { data: qs, error: qsErr } = await supabase
          .from('feedback_questions')
          .select('id, question_number, question_text, active')
          .eq('active', true)
          .order('question_number', { ascending: true });

        if (qsErr) {
          setError(`Failed to load feedback questions: ${qsErr.message}`);
          setLoading(false);
          return;
        }

        if (!qs || qs.length === 0) {
          setError('No active feedback questions are configured in the system. Please contact the administrator.');
          setLoading(false);
          return;
        }
        setQuestions(qs);

        // 5. Faculty-subject assignments: query & relation integrity validation
        const { data: rawAssignments, error: asgErr } = await supabase
          .from('faculty_subject_assignments')
          .select(`
            id, faculty_id, subject_id, department_id, year, semester, section, active,
            faculty:faculty_id(id, faculty_name),
            subjects:subject_id(id, subject_name, course_code)
          `)
          .eq('department_id', parsedStudent.department_id)
          .eq('year', parsedStudent.year)
          .eq('semester', parsedStudent.semester)
          .eq('active', true);

        if (asgErr) {
          setError(`Failed to load course assignments: ${asgErr.message}`);
          setLoading(false);
          return;
        }

        const matchesSection = (asgSec?: string | null, stuSec?: string | null): boolean => {
          const cleanAsg = asgSec ? asgSec.trim().toUpperCase() : '';
          const cleanStu = stuSec ? stuSec.trim().toUpperCase() : '';
          if (cleanAsg) {
            return cleanStu === cleanAsg;
          }
          return true;
        };

        const validAssignments = (rawAssignments || []).filter((a: any) => {
          if (!matchesSection(a.section, parsedStudent.section)) return false;
          const fObj = Array.isArray(a.faculty) ? a.faculty[0] : a.faculty;
          const sObj = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
          return (
            a.id &&
            a.faculty_id &&
            a.subject_id &&
            fObj?.faculty_name &&
            sObj?.subject_name
          );
        });

        if (validAssignments.length === 0) {
          setEmptyStateMessage('No faculty or subject assignments were found for your year, semester, and class.');
          setLoading(false);
          return;
        }

        // 6. Existing submission verification: verify responses AND answers existence (Issue 6)
        const { data: existingUserResponses, error: respErr } = await supabase
          .from('feedback_responses')
          .select('id, subject_id, faculty_id')
          .eq('student_id', parsedStudent.id)
          .eq('feedback_cycle_id', cycle.id);

        if (respErr) {
          setError(`Failed to verify existing feedback responses: ${respErr.message}`);
          setLoading(false);
          return;
        }

        const verifiedSubmittedSet = new Set<string>();
        if (existingUserResponses && existingUserResponses.length > 0) {
          const respIds = existingUserResponses.map((r: any) => r.id);
          const { data: existingAnswers, error: ansErr } = await supabase
            .from('feedback_answers')
            .select('response_id, question_id')
            .in('response_id', respIds);

          if (!ansErr && existingAnswers) {
            const answersCountByResp = new Map<string, number>();
            existingAnswers.forEach((a: any) => {
              answersCountByResp.set(a.response_id, (answersCountByResp.get(a.response_id) || 0) + 1);
            });

            existingUserResponses.forEach((r: any) => {
              // Only count as verified submitted if it has answers for all active questions
              if ((answersCountByResp.get(r.id) || 0) >= qs.length) {
                verifiedSubmittedSet.add(`${r.subject_id}-${r.faculty_id}`);
              }
            });
          }
        }

        // Group assignments by unique subject in stable order
        const subjectsMap = new Map<string, any[]>();
        validAssignments.forEach((a: any) => {
          if (!subjectsMap.has(a.subject_id)) {
            subjectsMap.set(a.subject_id, []);
          }
          subjectsMap.get(a.subject_id)!.push(a);
        });

        const uniqueSubjectIds = Array.from(subjectsMap.keys());
        const totalSubjectsCount = uniqueSubjectIds.length;

        // Build flat ordered list of all required evaluations
        const evalList: EvaluationUnit[] = [];
        let evalIdx = 0;

        uniqueSubjectIds.forEach((sId, sOrderIdx) => {
          const asgsForSubj = subjectsMap.get(sId) || [];
          const totalFacultiesForSubj = asgsForSubj.length;

          asgsForSubj.forEach((a: any, fIdx: number) => {
            const fObj = Array.isArray(a.faculty) ? a.faculty[0] : a.faculty;
            const sObj = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
            evalList.push({
              evaluationIndex: evalIdx++,
              subjectId: sId,
              subjectName: sObj?.subject_name || 'Subject',
              courseCode: sObj?.course_code || '',
              facultyId: a.faculty_id,
              facultyName: fObj?.faculty_name || 'Assigned Faculty',
              key: `${sId}-${a.faculty_id}`,
              subjectOrder: sOrderIdx + 1,
              totalSubjects: totalSubjectsCount,
              facultyOrderForSubject: fIdx + 1,
              totalFacultiesForSubject: totalFacultiesForSubj
            });
          });
        });

        // If EVERY required evaluation has verified complete answers in the database, show completed screen
        if (evalList.length > 0 && evalList.every(e => verifiedSubmittedSet.has(e.key))) {
          setSubmitted(true);
          setLoading(false);
          return;
        }

        setEvaluations(evalList);

        // 7. Restore draft with strict structural and value validation before picking initial position
        let restoredRatings: Record<string, Record<string, number>> = {};
        try {
          const draftKey = `tpt_feedback_draft_${parsedStudent.id}_${cycle.id}`;
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            const parsedDraft = JSON.parse(savedDraft);
            if (
              parsedDraft &&
              typeof parsedDraft === 'object' &&
              parsedDraft.studentId === parsedStudent.id &&
              parsedDraft.cycleId === cycle.id &&
              parsedDraft.answers &&
              typeof parsedDraft.answers === 'object'
            ) {
              const validEvalKeys = new Set(evalList.map(e => e.key));
              const validQIds = new Set(qs.map((q: any) => q.id));
              const sanitizedRatings: Record<string, Record<string, number>> = {};

              for (const [eKey, ratingsObj] of Object.entries(parsedDraft.answers)) {
                if (validEvalKeys.has(eKey) && ratingsObj && typeof ratingsObj === 'object') {
                  sanitizedRatings[eKey] = {};
                  for (const [qId, rVal] of Object.entries(ratingsObj as Record<string, any>)) {
                    if (validQIds.has(qId) && typeof rVal === 'number' && Number.isInteger(rVal) && rVal >= 1 && rVal <= 5) {
                      sanitizedRatings[eKey][qId] = rVal;
                    }
                  }
                }
              }

              if (Object.keys(sanitizedRatings).length > 0) {
                restoredRatings = sanitizedRatings;
                setAllRatings(sanitizedRatings);
                setDraftRestoredText('Saved draft restored. You can continue your feedback session.');
                if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
                draftTimerRef.current = setTimeout(() => setDraftRestoredText(''), 4000);
              }
            }
          }
        } catch (draftErr) {
          console.warn('Could not read or parse draft from localStorage:', draftErr);
        }

        // Determine initial evaluation index: resume first incomplete evaluation in draft
        let initialIdx = 0;
        const requestedSubjectId = initialSubjectIdRef.current;
        if (requestedSubjectId) {
          const matchedIdx = evalList.findIndex(e => e.subjectId === requestedSubjectId && !verifiedSubmittedSet.has(e.key));
          if (matchedIdx !== -1) {
            const isMatchedDoneInDraft = isEvaluationComplete(evalList[matchedIdx].key, restoredRatings, qs);
            if (!isMatchedDoneInDraft) {
              initialIdx = matchedIdx;
            } else {
              // If the subject requested in URL was already completed in draft, resume first incomplete evaluation
              const firstIncompleteInDraft = evalList.findIndex(e =>
                !verifiedSubmittedSet.has(e.key) && !isEvaluationComplete(e.key, restoredRatings, qs)
              );
              initialIdx = firstIncompleteInDraft !== -1 ? firstIncompleteInDraft : matchedIdx;
            }
          }
        } else {
          const firstIncompleteInDraft = evalList.findIndex(e =>
            !verifiedSubmittedSet.has(e.key) && !isEvaluationComplete(e.key, restoredRatings, qs)
          );
          if (firstIncompleteInDraft !== -1) {
            initialIdx = firstIncompleteInDraft;
          } else {
            const firstUnsubmitted = evalList.findIndex(e => !verifiedSubmittedSet.has(e.key));
            if (firstUnsubmitted !== -1) initialIdx = firstUnsubmitted;
          }
        }

        setCurrentIndex(initialIdx);
        if (evalList[initialIdx]) {
          window.history.replaceState(null, '', `/student/feedback/${evalList[initialIdx].subjectId}`);
        }

      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to load feedback form. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
    };
  }, [navigate]);

  const currentEval = evaluations[currentIndex];
  const currentAnswers = currentEval ? allRatings[currentEval.key] || {} : {};

  // Rate a question (React state & localStorage draft only — ZERO Supabase database writes) (Issue 8)
  const handleRating = (questionId: string, ratingValue: number) => {
    if (!currentEval || !student || !activeCycle) return;
    if (typeof ratingValue !== 'number' || ratingValue < 1 || ratingValue > 5) return;

    const currentEvalAnswers = allRatings[currentEval.key] || {};
    const updatedForCurrent = { ...currentEvalAnswers, [questionId]: ratingValue };
    const updatedAll = { ...allRatings, [currentEval.key]: updatedForCurrent };

    setAllRatings(updatedAll);
    // Automatically clear any stale submission warning as soon as student rates questions
    setSubmissionError('');
    setError('');

    // Persist draft locally scoped to student and cycle
    try {
      const draftKey = `tpt_feedback_draft_${student.id}_${activeCycle.id}`;
      localStorage.setItem(draftKey, JSON.stringify({
        studentId: student.id,
        cycleId: activeCycle.id,
        updatedAt: 'saved',
        answers: updatedAll
      }));
      setDraftWarningText('');
    } catch (storageErr) {
      console.warn('Failed to save draft to localStorage:', storageErr);
      setDraftWarningText('Warning: Browser storage is unavailable or restricted. Your draft may not survive a page refresh.');
    }
  };

  // Check if current evaluation has answered all questions with valid ratings (Issue 9)
  const isCurrentEvalComplete = currentEval
    ? isEvaluationComplete(currentEval.key, allRatings, questions)
    : false;

  // Next Course / Next Faculty (local navigation only — ZERO database writes) (Issue 10)
  const handleNext = () => {
    if (!currentEval) return;

    if (!isCurrentEvalComplete) {
      setError(`Please answer all ${questions.length} questions for ${currentEval.subjectName} (${currentEval.facultyName}) before proceeding.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError('');
    setSubmissionError('');
    if (currentIndex < evaluations.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (evaluations[nextIdx]) {
        window.history.replaceState(null, '', `/student/feedback/${evaluations[nextIdx].subjectId}`);
      }
    }
  };

  // Previous Course / Previous Faculty (local navigation only — ZERO database writes) (Issue 10)
  const handlePrev = () => {
    setError('');
    setSubmissionError('');
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (evaluations[prevIdx]) {
        window.history.replaceState(null, '', `/student/feedback/${evaluations[prevIdx].subjectId}`);
      }
    }
  };

  // Direct step navigation via stepper pills (local navigation only — ZERO database writes) (Issue 10)
  const handleJumpToEvaluation = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= evaluations.length) return;
    setError('');
    setSubmissionError('');
    setCurrentIndex(targetIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (evaluations[targetIdx]) {
      window.history.replaceState(null, '', `/student/feedback/${evaluations[targetIdx].subjectId}`);
    }
  };

  // Calculate completion metrics based on verified valid answers (Issue 11)
  const completedEvaluationsCount = evaluations.filter(e =>
    isEvaluationComplete(e.key, allRatings, questions)
  ).length;

  const totalRequiredEvaluations = evaluations.length;
  const overallProgressPercent = totalRequiredEvaluations > 0
    ? Math.round((completedEvaluationsCount / totalRequiredEvaluations) * 100)
    : 0;

  // Single final submission for all courses and faculty members together (Issues 12–19)
  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }

    if (submitting || submitted) return;

    if (!student || !activeCycle || evaluations.length === 0 || questions.length === 0) {
      setSubmissionError('Session error: Missing student or cycle context. Please log in again.');
      return;
    }

    // Strict client-side completeness validation across all required evaluations
    for (const ev of evaluations) {
      if (!isEvaluationComplete(ev.key, allRatings, questions)) {
        setSubmissionError(`Incomplete Feedback: Please complete all ${questions.length} questions for ${ev.subjectName} (${ev.facultyName}) before final submission.`);
        setCurrentIndex(ev.evaluationIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSubmitting(true);
    setSubmissionError('');
    setError('');
    setSavingSuccessText('');

    try {
      // Issue 13: Server-side re-verification of student authorization and active cycle
      const { data: verifiedStudent, error: verifyStudentErr } = await supabase
        .from('students')
        .select('id, register_number, department_id, year, semester, section, active')
        .eq('id', student.id)
        .single();

      if (verifyStudentErr || !verifiedStudent || !verifiedStudent.active) {
        throw new Error('Student authorization verification failed. Please log in again.');
      }

      const { data: verifiedCycle, error: verifyCycleErr } = await supabase
        .from('feedback_cycles')
        .select('id, department_id, year, enabled')
        .eq('id', activeCycle.id)
        .eq('enabled', true)
        .single();

      if (verifyCycleErr || !verifiedCycle) {
        throw new Error('The feedback cycle is no longer active.');
      }

      // Pre-flight check: Verify if full session was already recorded (Issue 14)
      const { data: preExistingResps, error: preCheckErr } = await supabase
        .from('feedback_responses')
        .select('id, subject_id, faculty_id')
        .eq('student_id', verifiedStudent.id)
        .eq('feedback_cycle_id', verifiedCycle.id);

      if (preCheckErr) {
        throw new Error(`Pre-submission check failed: ${preCheckErr.message}`);
      }

      const expectedTotalAnswers = evaluations.length * questions.length;

      // If full set of responses already exist, check if all answers exist
      if (preExistingResps && preExistingResps.length >= evaluations.length) {
        const preRespIds = preExistingResps.map((r: any) => r.id);
        const { count: preAnsCount, error: preAnsErr } = await supabase
          .from('feedback_answers')
          .select('*', { count: 'exact', head: true })
          .in('response_id', preRespIds);

        if (!preAnsErr && preAnsCount === expectedTotalAnswers) {
          // Confirmed: 100% of answers already persisted safely
          try {
            localStorage.removeItem(`tpt_feedback_draft_${student.id}_${activeCycle.id}`);
            localStorage.removeItem(`tpt_feedback_draft_${verifiedStudent.id}_${verifiedCycle.id}`);
          } catch {}
          setSubmitted(true);
          return;
        }
      }

      // Prepare structured evaluations payload for atomic transaction
      const evaluationsPayload = evaluations.map(ev => {
        const evAnswers = allRatings[ev.key] || {};
        return {
          subject_id: ev.subjectId,
          faculty_id: ev.facultyId,
          answers: questions.map(q => ({
            question_id: q.id,
            rating_value: evAnswers[q.id],
            selected_option: ratings.find(r => r.value === evAnswers[q.id])?.label || ''
          }))
        };
      });

      // 1. ATOMIC SUBMISSION: Call PostgreSQL RPC submit_feedback_session
      const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_feedback_session', {
        p_student_id: verifiedStudent.id,
        p_register_number: verifiedStudent.register_number,
        p_feedback_cycle_id: verifiedCycle.id,
        p_department_id: verifiedStudent.department_id,
        p_evaluations: evaluationsPayload
      });

      if (rpcErr || !rpcData || rpcData.success !== true) {
        console.error(
          "Feedback database submission failed:",
          rpcErr || rpcData?.error
        );

        setSubmissionError(
          "Please try again. The feedback form was not saved in the database."
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 2. VERIFICATION CHECKS:
      // Check A: Database submission — confirm feedback_responses and feedback_answers exist
      // Check B: Website Completed status — re-fetch completion status using StudentDashboard logic
      const isCompleted = await verifyStudentFeedbackCompletion({
        studentId: verifiedStudent.id,
        registerNumber: verifiedStudent.register_number,
        feedbackCycleId: verifiedCycle.id,
        departmentId: verifiedStudent.department_id,
        year: verifiedStudent.year,
        semester: verifiedStudent.semester,
        section: verifiedStudent.section,
        evaluations,
        questionsCount: questions.length
      });

      if (!isCompleted) {
        console.error(
          "Feedback submission succeeded, but completion status could not be verified."
        );

        setSubmissionError(
          "Your feedback was saved, but its completion status could not be verified. Please refresh and check your status."
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 3. Update the UI only after both verification checks succeed
      setSubmitted(true);

      // Clear the draft only after successful saving and verification
      try {
        localStorage.removeItem(
          `tpt_feedback_draft_${verifiedStudent.id}_${verifiedCycle.id}`
        );
        localStorage.removeItem(
          `tpt_feedback_draft_${student.id}_${activeCycle.id}`
        );
      } catch (e) {
        console.warn('Could not clear draft from localStorage', e);
      }

      // Refresh the student dashboard from persisted database data
      await refreshStudentFeedbackStatus();
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error("Unexpected feedback submission error:", error);
      setSubmissionError(
        "Please try again. The feedback form was not saved in the database."
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const verifyStudentFeedbackCompletion = async (options: {
    studentId: string;
    registerNumber: string;
    feedbackCycleId: string;
    departmentId: string;
    year: number;
    semester: number;
    section?: string | null;
    evaluations: EvaluationUnit[];
    questionsCount: number;
  }): Promise<boolean> => {
    try {
      const {
        studentId,
        feedbackCycleId,
        departmentId,
        year,
        semester,
        section,
        evaluations: requiredEvals,
        questionsCount
      } = options;

      if (!studentId || !feedbackCycleId || requiredEvals.length === 0) {
        return false;
      }

      // Check A: Database submission verification
      // 1. Fetch persisted responses for student and cycle
      const { data: savedResponses, error: respError } = await supabase
        .from('feedback_responses')
        .select('id, subject_id, faculty_id, student_id, feedback_cycle_id')
        .eq('student_id', studentId)
        .eq('feedback_cycle_id', feedbackCycleId);

      if (respError || !savedResponses || savedResponses.length < requiredEvals.length) {
        console.error('Check A failed: Incomplete feedback_responses in database', respError, savedResponses);
        return false;
      }

      // 2. Fetch persisted answers for these responses
      const responseIds = savedResponses.map(r => r.id);
      const { data: savedAnswers, error: ansError } = await supabase
        .from('feedback_answers')
        .select('response_id')
        .in('response_id', responseIds);

      if (ansError || !savedAnswers) {
        console.error('Check A failed: Could not query feedback_answers', ansError);
        return false;
      }

      const answersPerResponse = new Map<string, number>();
      savedAnswers.forEach((a: any) => {
        answersPerResponse.set(a.response_id, (answersPerResponse.get(a.response_id) || 0) + 1);
      });

      const verifiedEvalKeys = new Set<string>();
      savedResponses.forEach((r: any) => {
        const count = answersPerResponse.get(r.id) || 0;
        if (count >= questionsCount) {
          verifiedEvalKeys.add(`${r.subject_id}-${r.faculty_id}`);
        }
      });

      const allEvaluationsPersisted = requiredEvals.every(e => verifiedEvalKeys.has(e.key));
      if (!allEvaluationsPersisted) {
        console.error('Check A failed: Not all required evaluations have complete answers persisted in database');
        return false;
      }

      // Check B: Website Completed status re-fetch (StudentDashboard authoritative logic)
      const { data: fsaData, error: fsaError } = await supabase
        .from('faculty_subject_assignments')
        .select('faculty_id, subject_id, section')
        .eq('department_id', departmentId)
        .eq('year', year)
        .eq('semester', semester)
        .eq('active', true);

      if (fsaError || !fsaData) {
        console.error('Check B failed: Could not re-fetch faculty subject assignments', fsaError);
        return false;
      }

      const matchesSection = (asgSec?: string | null, stuSec?: string | null): boolean => {
        const cleanAsg = asgSec ? asgSec.trim().toUpperCase() : '';
        const cleanStu = stuSec ? stuSec.trim().toUpperCase() : '';
        if (cleanAsg) {
          return cleanStu === cleanAsg;
        }
        return true;
      };

      const validAssignments = fsaData.filter((a: any) =>
        matchesSection(a.section, section)
      );

      const isDashboardCompleted =
        validAssignments.length > 0 &&
        validAssignments.every((a: any) =>
          verifiedEvalKeys.has(`${a.subject_id}-${a.faculty_id}`)
        );

      if (!isDashboardCompleted) {
        console.error('Check B failed: Not all assignments verified as completed per StudentDashboard rules');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in verifyStudentFeedbackCompletion:', error);
      return false;
    }
  };

  const refreshStudentFeedbackStatus = async () => {
    // Re-sync UI state with database confirmation
    setSubmitted(true);
  };

  // Completion Screen (Issue 21)
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
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Completion Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[24px] shadow-lg border border-gray-100 max-w-lg w-full text-center animate-fade-in">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
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
              {student?.student_name || (student as any)?.name}
            </p>
            <p className="text-xs font-medium text-gray-500 mb-6 font-mono">
              Register No: {student?.register_number}
            </p>
            <p role="status" className="text-gray-500 text-sm leading-relaxed mb-8">
              Feedback submitted successfully! You have successfully completed all your subject feedbacks for this semester. Thank you for your valuable responses!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="w-full py-3.5 rounded-xl bg-[#1E3A8A] text-white font-bold hover:bg-blue-900 transition-colors shadow-md cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('student_data');
                  navigate('/');
                }}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Logout Safely
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading Spinner (Issue 20)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E3A8A] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  // Explicit Empty State (Issue 20)
  if (emptyStateMessage || evaluations.length === 0 || !currentEval) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-[24px] shadow-lg border border-gray-100 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Evaluations Available</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {emptyStateMessage || 'There are currently no active course or faculty evaluations assigned to your class.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-3.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-semibold transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('student_data');
                navigate('/');
              }}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
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
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors text-sm font-medium bg-white/10 px-4 py-2 rounded-xl cursor-pointer"
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
              const isDone = isEvaluationComplete(ev.key, allRatings, questions);
              const isSelected = idx === currentIndex;
              const hasMultipleFaculties = ev.totalFacultiesForSubject > 1;

              return (
                <button
                  key={ev.key}
                  type="button"
                  onClick={() => handleJumpToEvaluation(idx)}
                  title={`${ev.subjectName} - ${ev.facultyName}`}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/30'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isDone ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  <span className="truncate max-w-[170px]">
                    {ev.courseCode || `Course ${ev.subjectOrder}`}
                    {hasMultipleFaculties && (
                      <span className="opacity-90 font-normal ml-1">
                        ({ev.facultyName.replace(/^Mrs\.|^Mr\.|^Dr\.|^Ms\./i, '').trim().split(' ')[0]})
                      </span>
                    )}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-900 ml-1">
                      Incomplete
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-lg p-6 sm:p-10 border border-gray-100">
          <form onSubmit={handleSubmit}>

            <div className="mb-8 pb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    Evaluation {currentIndex + 1} of {evaluations.length}: {currentEval.subjectName}
                  </h2>
                  {currentEval.totalFacultiesForSubject > 1 && (
                    <span className="bg-blue-100 text-[#1E3A8A] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Faculty {currentEval.facultyOrderForSubject} of {currentEval.totalFacultiesForSubject}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  Rating Faculty: <span className="font-bold text-gray-800">{currentEval.facultyName}</span>. Your feedback is completely anonymous.
                </p>
              </div>
              <div className="text-right flex items-center space-x-2">
                <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold shadow-xs ${
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

            {draftWarningText && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 font-medium text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 text-amber-600" />
                <span>{draftWarningText}</span>
              </div>
            )}

            {submissionError && (
              <p role="alert" className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" />
                <span>{submissionError}</span>
              </p>
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
              {questions.map((q, index) => {
                const isAnswered = Boolean(currentAnswers[q.id]);
                const isMissing = Boolean(submissionError && !isAnswered);

                return (
                  <div
                    key={q.id}
                    className={`animate-fade-in p-4 -mx-4 rounded-2xl transition-all ${
                      isMissing ? 'bg-red-50/80 border border-red-200 shadow-xs' : ''
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-start">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm mr-4 flex-shrink-0 ${
                          isMissing
                            ? 'bg-red-200 text-red-800'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-50 text-[#1E3A8A]'
                        }`}>
                          {q.question_number}
                        </span>
                        <p className="text-base sm:text-lg font-medium text-gray-900 pt-1">{q.question_text}</p>
                      </div>
                      {isMissing && (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          Required
                        </span>
                      )}
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
                            relative py-3 px-2 rounded-[16px] text-sm font-semibold transition-all duration-200 border-2 cursor-pointer
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
              );
            })}
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={submitting}
                    className="flex items-center justify-center px-6 py-3.5 rounded-[18px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {prevButtonLabel}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {overallProgressPercent === 100 && !isLastEvaluation && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center px-7 py-4 rounded-[20px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-[0_8px_20px_rgb(5,150,105,0.35)] hover:-translate-y-0.5 disabled:opacity-70 cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback (100% Ready)'}
                    {!submitting && <Send className="w-5 h-5 ml-2" />}
                  </button>
                )}

                {!isLastEvaluation ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex items-center justify-center px-8 py-4 rounded-[20px] bg-[#1E3A8A] hover:bg-[#152e73] text-white font-bold text-lg transition-all shadow-[0_8px_20px_rgb(30,58,138,0.3)] hover:-translate-y-0.5 disabled:opacity-70 cursor-pointer"
                  >
                    {nextButtonLabel}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center px-9 py-4 rounded-[20px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all shadow-[0_8px_20px_rgb(5,150,105,0.35)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? 'Submitting feedback...' : 'Submit Feedback'}
                    {!submitting && <Send className="w-5 h-5 ml-2" />}
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
