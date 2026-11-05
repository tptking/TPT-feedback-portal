import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { supabase } from '../lib/supabase';

export interface GenerateReportOptions {
  facultyId: string;
  subjectId: string;
  cycleId: string;
  facultyName: string;
  subjectName: string;
  courseCode: string;
  departmentName?: string;
  totalStrength?: number;
  appeared?: number;
  cachedQStats?: Array<{
    question: string;
    c5: number;
    c4: number;
    c3: number;
    c2: number;
    c1: number;
    obtained: number;
    max: number;
    percentage: string;
  }>;
  totalResponses?: number;
}

/**
 * Institutional Grading Scale:
 * A+ : >= 91.00
 * A  : 81.00 - 90.99
 * B  : 71.00 - 80.99
 * C  : 61.00 - 70.99
 * D  : <= 60.99
 */
export function calculateGrade(percentage: number): string {
  if (percentage >= 91.0) return 'A+';
  if (percentage >= 81.0) return 'A';
  if (percentage >= 71.0) return 'B';
  if (percentage >= 61.0) return 'C';
  return 'D';
}

/**
 * Docxtemplater custom parser to resolve:
 * 1. Dot-notation: {{q.excellent}}, {{q.marks_secured}}, etc.
 * 2. Scope fallback: {{q_no}}
 * 3. Parent scope lookups: {{overall_percentage}}
 */
function createDocxParser() {
  return function parser(tag: string) {
    return {
      get(scope: any, context: any) {
        if (tag === '.') return scope;
        if (scope && typeof scope === 'object' && tag in scope) return scope[tag];

        const parts = tag.split('.');
        let val = scope;
        for (const part of parts) {
          if (val == null || typeof val !== 'object') {
            val = undefined;
            break;
          }
          val = val[part];
        }
        if (val !== undefined && val !== null) return val;

        if (parts[0] === 'q' && parts.length === 2 && scope && typeof scope === 'object' && parts[1] in scope) {
          return scope[parts[1]];
        }

        const scopes = (context && (context.scopeList || context.scopePath)) || [];
        for (let i = scopes.length - 1; i >= 0; i--) {
          const parentScope = scopes[i];
          if (!parentScope || typeof parentScope !== 'object') continue;
          if (tag in parentScope) return parentScope[tag];
          let pVal = parentScope;
          for (const part of parts) {
            if (pVal == null || typeof pVal !== 'object') {
              pVal = undefined;
              break;
            }
            pVal = pVal[part];
          }
          if (pVal !== undefined && pVal !== null) return pVal;
        }

        return '';
      }
    };
  };
}

/**
 * 1. Download QuestionWiseAnalysisReport via Supabase Edge Function
 */
export async function downloadReportFromEdgeFunction(
  facultyId: string,
  subjectId: string,
  cycleId: string,
  facultyName: string,
  courseCode: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('generate-question-wise-report', {
    body: {
      faculty_id: facultyId,
      subject_id: subjectId,
      feedback_cycle_id: cycleId
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate Word report from Edge Function');
  }

  const blob = data instanceof Blob ? data : new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  const sanitizedFaculty = facultyName.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedCourse = courseCode.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `QuestionWiseAnalysisReport_${sanitizedFaculty}_${sanitizedCourse}.docx`;

  saveAs(blob, filename);
}

/**
 * 2. In-Browser Report Generator using official institutional template
 * Strictly adheres to all institutional calculation rules and leaves green-marked areas blank.
 */
export async function generateAndDownloadReportInBrowser(options: GenerateReportOptions): Promise<void> {
  const {
    facultyId,
    subjectId,
    cycleId,
    facultyName,
    subjectName,
    courseCode,
    totalStrength: precalculatedStrength,
    appeared: precalculatedAppeared,
    cachedQStats,
    totalResponses: precalculatedResponses
  } = options;

  let questionsData: any[] = [];
  let appearedCount = precalculatedAppeared || precalculatedResponses || 0;
  let totalStrengthCount = precalculatedStrength || appearedCount;

  // If dashboard passed cached qStats, use them directly for instantaneous download
  if (cachedQStats && cachedQStats.length > 0) {
    if (appearedCount === 0) {
      throw new Error(
        `No student survey responses found for "${facultyName}" (${courseCode}). Cannot generate Question-Wise Analysis Report without responses.`
      );
    }

    questionsData = cachedQStats.map((q, idx) => {
      const qItem = {
        q_no: idx + 1,
        question_text: q.question,
        excellent: q.c5,
        very_good: q.c4,
        good: q.c3,
        satisfactory: q.c2,
        poor: q.c1,
        marks_secured: q.obtained,
        feedback_percentage: q.percentage
      };
      return {
        ...qItem,
        q: qItem
      };
    });
  } else {
    // Retrieve actual responses and questions directly from Supabase
    const [respRes, qRes] = await Promise.all([
      supabase
        .from('feedback_responses')
        .select('id, student_id, submitted_at')
        .eq('faculty_id', facultyId)
        .eq('subject_id', subjectId)
        .eq('feedback_cycle_id', cycleId),
      supabase
        .from('feedback_questions')
        .select('*')
        .order('question_number', { ascending: true })
    ]);

    if (respRes.error) throw new Error(`Failed to load responses: ${respRes.error.message}`);
    if (qRes.error) throw new Error(`Failed to load questions: ${qRes.error.message}`);

    const responses = respRes.data || [];
    const questions = qRes.data || [];

    if (responses.length === 0) {
      throw new Error(
        `No student survey responses found for faculty "${facultyName}" on subject "${subjectName}" (${courseCode}).`
      );
    }

    const respIds = responses.map(r => r.id);

    // Fetch detailed answers in batches
    let answers: any[] = [];
    const CHUNK_SIZE = 100;
    for (let i = 0; i < respIds.length; i += CHUNK_SIZE) {
      const chunk = respIds.slice(i, i + CHUNK_SIZE);
      const { data: chunkAnswers, error: ansError } = await supabase
        .from('feedback_answers')
        .select('response_id, question_id, rating_value')
        .in('response_id', chunk);

      if (ansError) throw new Error(`Failed to load feedback answers: ${ansError.message}`);
      if (chunkAnswers) answers = answers.concat(chunkAnswers);
    }

    // Incomplete submission validation: verify responses have all required answers
    const expectedQuestions = questions.length || 10;
    const answersByRespId = new Map<string, number>();
    answers.forEach(a => {
      answersByRespId.set(a.response_id, (answersByRespId.get(a.response_id) || 0) + 1);
    });

    const completedRespIds = new Set(
      responses.filter(r => (answersByRespId.get(r.id) || 0) >= expectedQuestions).map(r => r.id)
    );

    const effectiveRespIds = completedRespIds.size > 0 ? completedRespIds : new Set(respIds);
    appearedCount = effectiveRespIds.size;

    // Distinct students for appeared count
    const distinctAppearedStudents = new Set(
      responses.filter(r => effectiveRespIds.has(r.id)).map(r => r.student_id)
    );
    if (distinctAppearedStudents.size > 0) {
      appearedCount = distinctAppearedStudents.size;
    }

    questionsData = questions.map((q, idx) => {
      const qAnswers = answers.filter(
        a => a.question_id === q.id && effectiveRespIds.has(a.response_id)
      );

      let c5 = 0, c4 = 0, c3 = 0, c2 = 0, c1 = 0;
      qAnswers.forEach(a => {
        if (a.rating_value === 5) c5++;
        else if (a.rating_value === 4) c4++;
        else if (a.rating_value === 3) c3++;
        else if (a.rating_value === 2) c2++;
        else if (a.rating_value === 1) c1++;
      });

      const marksSecured = (5 * c5) + (4 * c4) + (3 * c3) + (2 * c2) + (1 * c1);
      const maxMarks = appearedCount * 5;
      const feedbackPercentage = maxMarks > 0 ? ((marksSecured / maxMarks) * 100).toFixed(2) : '0.00';

      const qItem = {
        q_no: q.question_number || idx + 1,
        question_text: q.question_text || `Question ${idx + 1}`,
        excellent: c5,
        very_good: c4,
        good: c3,
        satisfactory: c2,
        poor: c1,
        marks_secured: marksSecured,
        feedback_percentage: feedbackPercentage
      };

      return {
        ...qItem,
        q: qItem
      };
    });
  }

  // Calculate totals and statistics
  const totalC5 = questionsData.reduce((acc, item) => acc + item.excellent, 0);
  const totalC4 = questionsData.reduce((acc, item) => acc + item.very_good, 0);
  const totalC3 = questionsData.reduce((acc, item) => acc + item.good, 0);
  const totalC2 = questionsData.reduce((acc, item) => acc + item.satisfactory, 0);
  const totalC1 = questionsData.reduce((acc, item) => acc + item.poor, 0);
  const totalMarksSecured = questionsData.reduce((acc, item) => acc + item.marks_secured, 0);

  // Maximum Marks = Appeared * totalQuestions * 5
  const totalQuestionsCount = questionsData.length || 10;
  const maxPossibleMarks = appearedCount * totalQuestionsCount * 5;
  const overallPercentageNum = maxPossibleMarks > 0 ? (totalMarksSecured / maxPossibleMarks) * 100 : 0;
  const overallPercentageStr = overallPercentageNum.toFixed(2);
  const gradeStr = calculateGrade(overallPercentageNum);

  // Ensure totalStrength is at least equal to appeared
  if (totalStrengthCount < appearedCount) {
    totalStrengthCount = appearedCount;
  }

  // Assemble template payload with red-marked fields populated
  const templatePayload = {
    course_name: subjectName,
    faculty_name: facultyName,
    total_strength: totalStrengthCount,
    max_marks: maxPossibleMarks,
    maximum_marks: maxPossibleMarks,
    appeared: appearedCount,
    marks_secured: totalMarksSecured,
    overall_feedback: overallPercentageStr,
    overall_percentage: overallPercentageStr,
    grade: gradeStr,

    questions: questionsData,
    q: questionsData,

    total_excellent: totalC5,
    total_very_good: totalC4,
    total_good: totalC3,
    total_satisfactory: totalC2,
    total_poor: totalC1,
    total_marks_secured: totalMarksSecured,
    total_feedback_percentage: overallPercentageStr
  };

  // Fetch the official institutional Word template
  const response = await fetch('/templates/QuestionWiseAnalysisReport.docx');
  if (!response.ok) {
    throw new Error(`Failed to load official report template: ${response.statusText}`);
  }

  const templateArrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(templateArrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    parser: createDocxParser()
  });

  doc.render(templatePayload);

  const generatedBlob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE'
  });

  const sanitizedFaculty = facultyName.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedCourse = courseCode.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `QuestionWiseAnalysisReport_${sanitizedFaculty}_${sanitizedCourse}.docx`;

  saveAs(generatedBlob, filename);
}
