import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle2, LogOut } from 'lucide-react';

export default function FeedbackForm() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const [pendingFaculties, setPendingFaculties] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
        // Fetch Subject
        const { data: sub } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', subjectId)
          .single();
        setSubject(sub);

        // Fetch active cycle
        const { data: cycle } = await supabase
          .from('feedback_cycles')
          .select('*')
          .eq('department_id', parsedStudent.department_id)
          .eq('year', parsedStudent.year)
          .eq('enabled', true)
          .single();
        setActiveCycle(cycle);

        // Fetch Questions
        const { data: qs } = await supabase
          .from('feedback_questions')
          .select('*')
          .order('question_number', { ascending: true });
        setQuestions(qs || []);

        // Fetch faculties for this subject and student
        const { data: fsa } = await supabase
          .from('faculty_subject_assignments')
          .select('faculty_id, faculty:faculty_id(faculty_name)')
          .eq('subject_id', subjectId)
          .eq('department_id', parsedStudent.department_id)
          .eq('year', parsedStudent.year)
          .eq('semester', parsedStudent.semester)
          .eq('section', parsedStudent.section)
          .eq('active', true);

        if (fsa && cycle) {
          const { data: userResponses } = await supabase
            .from('feedback_responses')
            .select('faculty_id')
            .eq('student_id', parsedStudent.id)
            .eq('subject_id', subjectId)
            .eq('feedback_cycle_id', cycle.id);
            
          const submittedFaculties = new Set(userResponses?.map((r: any) => r.faculty_id) || []);

          const pending = fsa
            .filter((f: any) => !submittedFaculties.has(f.faculty_id))
            .map((f: any) => ({ id: f.faculty_id, faculty_name: f.faculty.faculty_name }));

          setPendingFaculties(pending);
          if (pending.length > 0) {
            setFaculty(pending[0]);
          } else {
            setSubmitted(true);
          }
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load feedback form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [subjectId, navigate]);

  const handleRating = (questionId: number, rating: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Calculate total score based on the max possible score (questions.length * 5)
      
      const payload = {
        student_id: student.id,
        faculty_id: faculty.id,
        subject_id: subject.id,
        department_id: student.department_id,
        feedback_cycle_id: activeCycle.id,
        status: 'COMPLETED'
      };

      // PRE-FLIGHT CHECK: Ensure the student hasn't already submitted for this faculty
      const { count } = await supabase
        .from('feedback_responses')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', student.id)
        .eq('faculty_id', faculty.id)
        .eq('subject_id', subject.id)
        .eq('feedback_cycle_id', activeCycle.id);

      if (count && count > 0) {
        throw new Error('You have already submitted feedback for this subject and faculty. Duplicate submissions are not allowed.');
      }

      const { data: responseData, error: insertError } = await supabase
        .from('feedback_responses')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('You have already submitted feedback for this subject and faculty. Duplicate submissions are not allowed.');
        }
        throw insertError;
      }

      // Insert the 10 answer records
      const answerRecords = Object.entries(answers).map(([qId, rating]) => {
        const questionText = ratings.find(r => r.value === rating)?.label || '';
        return {
          response_id: responseData.id,
          question_id: qId,
          rating_value: rating,
          selected_option: questionText
        };
      });

      const { error: answersError } = await supabase
        .from('feedback_answers')
        .insert(answerRecords);
        
      if (answersError) throw answersError;

      const remaining = pendingFaculties.slice(1);
      setPendingFaculties(remaining);
      
      if (remaining.length > 0) {
        setFaculty(remaining[0]);
        setAnswers({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitted(true);
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 3000);
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit feedback. You might have already submitted for this subject.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[24px] shadow-lg max-w-md w-full text-center animate-fade-in border border-gray-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Submitted!</h2>
          <p className="text-gray-500 mb-6">Thank you for your valuable response. Your feedback has been recorded securely.</p>
          <p className="text-sm text-gray-400">Loading next module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#1E3A8A] text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => {
              sessionStorage.removeItem('student_data');
              navigate('/');
            }}
            className="inline-flex items-center w-max text-blue-200 hover:text-white transition-colors mb-6 text-sm font-medium bg-white/10 px-4 py-2 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Save & Logout
          </button>
          <h1 className="text-3xl font-bold mb-2">{subject?.subject_name}</h1>
          <p className="text-blue-200 text-lg">
            Faculty: <span className="text-white font-medium">{faculty?.faculty_name || 'Not Assigned'}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-[24px] shadow-lg p-6 sm:p-10 border border-gray-100">
          
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Evaluation Form</h2>
            <p className="text-gray-500">Please rate the faculty on the following parameters. Your feedback is completely anonymous.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium text-sm flex items-start">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-10">
            {questions.map((q, index) => (
              <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#1E3A8A] font-bold text-sm mr-4 flex-shrink-0">
                    {q.question_number}
                  </span>
                  <p className="text-lg font-medium text-gray-900 pt-1">{q.question_text}</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pl-0 sm:pl-12 mt-3 sm:mt-0">
                  {ratings.map((rating) => {
                    const isSelected = answers[q.id] === rating.value;
                    return (
                      <button
                        key={rating.value}
                        onClick={() => handleRating(q.id, rating.value)}
                        className={`
                          relative py-3 px-2 rounded-[16px] text-sm font-semibold transition-all duration-200 border-2 
                          ${isSelected 
                            ? rating.text + ' border-transparent ring-2 ring-offset-2 ring-' + rating.color.split('-')[1] + '-500 scale-105 shadow-sm' 
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

          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center px-8 py-4 rounded-[20px] bg-[#1E3A8A] hover:bg-[#152e73] text-white font-bold text-lg transition-all shadow-[0_8px_20px_rgb(30,58,138,0.3)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
              {!submitting && <Send className="w-5 h-5 ml-3" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
