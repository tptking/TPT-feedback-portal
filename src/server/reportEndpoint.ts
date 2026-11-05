import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReportGenerationParams {
  supabase: SupabaseClient;
  facultyId: string;
  subjectId: string;
  cycleId: string;
  allowEmpty?: boolean;
  totalStrength?: number;
  customTemplatePath?: string;
}

export interface ReportGenerationResult {
  buffer: Buffer;
  filename: string;
  appeared: number;
  totalStrength: number;
  maxMarks: number;
  marksSecured: number;
  overallPercentage: string;
  grade: string;
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 91.0) return 'A+';
  if (percentage >= 81.0) return 'A';
  if (percentage >= 71.0) return 'B';
  if (percentage >= 61.0) return 'C';
  return 'D';
}

export function createDocxParser() {
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

export async function generateQuestionWiseReportDocx({
  supabase,
  facultyId,
  subjectId,
  cycleId,
  allowEmpty = false,
  totalStrength: customStrength,
  customTemplatePath
}: ReportGenerationParams): Promise<ReportGenerationResult> {
  if (!facultyId || !subjectId || !cycleId) {
    throw new Error('Missing required arguments: facultyId, subjectId, and cycleId are required.');
  }

  // 1. Fetch metadata
  const [facRes, subjRes, cycleRes, qRes] = await Promise.all([
    supabase.from('faculty').select('*, departments(*)').eq('id', facultyId).single(),
    supabase.from('subjects').select('*').eq('id', subjectId).single(),
    supabase.from('feedback_cycles').select('*').eq('id', cycleId).single(),
    supabase.from('feedback_questions').select('*').order('question_number', { ascending: true })
  ]);

  if (facRes.error || !facRes.data) throw new Error(`Faculty not found: ${facRes.error?.message || 'Invalid ID'}`);
  if (subjRes.error || !subjRes.data) throw new Error(`Subject not found: ${subjRes.error?.message || 'Invalid ID'}`);
  if (cycleRes.error || !cycleRes.data) throw new Error(`Feedback cycle not found: ${cycleRes.error?.message || 'Invalid ID'}`);

  const faculty = facRes.data;
  const subject = subjRes.data;
  const cycle = cycleRes.data;
  const questions = qRes.data || [];

  if (questions.length === 0) {
    throw new Error('No feedback questions configured in the database.');
  }

  // 2. Fetch responses
  const { data: responses, error: respError } = await supabase
    .from('feedback_responses')
    .select('id, student_id, submitted_at, status')
    .eq('faculty_id', facultyId)
    .eq('subject_id', subjectId)
    .eq('feedback_cycle_id', cycleId);

  if (respError) throw new Error(`Error fetching feedback responses: ${respError.message}`);

  if ((!responses || responses.length === 0) && !allowEmpty) {
    const error: any = new Error(
      `No student survey responses found for faculty "${faculty.faculty_name}" on subject "${subject.subject_name}" (${subject.course_code}).`
    );
    error.statusCode = 422;
    error.code = 'NO_RESPONSES';
    throw error;
  }

  const responseIds = (responses || []).map(r => r.id);

  // 3. Fetch answers in batches
  let answers: any[] = [];
  if (responseIds.length > 0) {
    const CHUNK_SIZE = 100;
    for (let i = 0; i < responseIds.length; i += CHUNK_SIZE) {
      const chunk = responseIds.slice(i, i + CHUNK_SIZE);
      const { data: chunkAnswers, error: ansError } = await supabase
        .from('feedback_answers')
        .select('response_id, question_id, rating_value, selected_option')
        .in('response_id', chunk);

      if (ansError) throw new Error(`Error loading feedback answers: ${ansError.message}`);
      if (chunkAnswers) answers = answers.concat(chunkAnswers);
    }
  }

  // 4. Incomplete response detection
  const expectedQuestionsCount = questions.length;
  const answersByRespId = new Map<string, any[]>();
  answers.forEach(a => {
    const arr = answersByRespId.get(a.response_id) || [];
    arr.push(a);
    answersByRespId.set(a.response_id, arr);
  });

  const validResponseIds = new Set<string>();
  const distinctStudents = new Set<string>();

  (responses || []).forEach(r => {
    const ansList = answersByRespId.get(r.id) || [];
    if (ansList.length >= expectedQuestionsCount) {
      validResponseIds.add(r.id);
      if (r.student_id) distinctStudents.add(r.student_id);
    }
  });

  const effectiveResponseIds = validResponseIds.size > 0 ? validResponseIds : new Set(responseIds);
  const appearedCount = distinctStudents.size > 0 ? distinctStudents.size : effectiveResponseIds.size;

  // 5. Total Strength calculation
  let totalStrengthCount = customStrength || 0;
  if (!totalStrengthCount) {
    const { count, error: countErr } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', faculty.department_id)
      .eq('year', cycle.year || subject.year || 3);

    if (!countErr && count) {
      totalStrengthCount = count;
    } else {
      totalStrengthCount = appearedCount;
    }
  }
  if (totalStrengthCount < appearedCount) {
    totalStrengthCount = appearedCount;
  }

  // 6. Calculate question-wise ratings, marks, and totals
  let totalC5 = 0;
  let totalC4 = 0;
  let totalC3 = 0;
  let totalC2 = 0;
  let totalC1 = 0;
  let totalObtainedMarks = 0;

  const formattedQuestions = questions.map((q, index) => {
    const qAnswers = answers.filter(
      ans => ans.question_id === q.id && effectiveResponseIds.has(ans.response_id)
    );

    let count5 = 0, count4 = 0, count3 = 0, count2 = 0, count1 = 0;
    qAnswers.forEach(ans => {
      if (ans.rating_value === 5) count5++;
      else if (ans.rating_value === 4) count4++;
      else if (ans.rating_value === 3) count3++;
      else if (ans.rating_value === 2) count2++;
      else if (ans.rating_value === 1) count1++;
    });

    const marksSecured = (5 * count5) + (4 * count4) + (3 * count3) + (2 * count2) + (1 * count1);
    const maxMarksForQuestion = appearedCount * 5;
    const percentageNum = maxMarksForQuestion > 0 ? (marksSecured / maxMarksForQuestion) * 100 : 0;
    const feedbackPercentage = percentageNum.toFixed(2);

    totalC5 += count5;
    totalC4 += count4;
    totalC3 += count3;
    totalC2 += count2;
    totalC1 += count1;
    totalObtainedMarks += marksSecured;

    const qItem = {
      q_no: q.question_number || index + 1,
      question_text: q.question_text || `Question ${index + 1}`,
      excellent: count5,
      very_good: count4,
      good: count3,
      satisfactory: count2,
      poor: count1,
      marks_secured: marksSecured,
      feedback_percentage: feedbackPercentage
    };

    return {
      ...qItem,
      q: qItem
    };
  });

  const maxPossibleMarks = appearedCount * questions.length * 5;
  const overallPercentageNum = maxPossibleMarks > 0 ? (totalObtainedMarks / maxPossibleMarks) * 100 : 0;
  const overallPercentageStr = overallPercentageNum.toFixed(2);
  const gradeStr = calculateGrade(overallPercentageNum);

  const templateData = {
    course_name: subject.subject_name,
    faculty_name: faculty.faculty_name,
    total_strength: totalStrengthCount,
    max_marks: maxPossibleMarks,
    appeared: appearedCount,
    marks_secured: totalObtainedMarks,
    overall_feedback: overallPercentageStr,
    grade: gradeStr,

    questions: formattedQuestions,
    q: formattedQuestions,

    total_excellent: totalC5,
    total_very_good: totalC4,
    total_good: totalC3,
    total_satisfactory: totalC2,
    total_poor: totalC1,
    total_marks_secured: totalObtainedMarks,
    total_feedback_percentage: overallPercentageStr,

    overall_percentage: overallPercentageStr
  };

  // 7. Read official template
  const templateFilePath =
    customTemplatePath ||
    path.resolve(process.cwd(), 'public/templates/QuestionWiseAnalysisReport.docx');

  if (!fs.existsSync(templateFilePath)) {
    throw new Error(`Word template not found at: ${templateFilePath}`);
  }

  const templateContent = fs.readFileSync(templateFilePath);
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    parser: createDocxParser()
  });

  doc.render(templateData);

  const buffer = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE'
  });

  const sanitizedFaculty = faculty.faculty_name.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedCourse = subject.course_code.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `QuestionWiseAnalysisReport_${sanitizedFaculty}_${sanitizedCourse}.docx`;

  return {
    buffer,
    filename,
    appeared: appearedCount,
    totalStrength: totalStrengthCount,
    maxMarks: maxPossibleMarks,
    marksSecured: totalObtainedMarks,
    overallPercentage: overallPercentageStr,
    grade: gradeStr
  };
}

export async function expressReportEndpoint(req: any, res: any) {
  try {
    const supabase = req.supabase || req.app.get('supabaseClient');
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not configured on server request.' });
    }

    const facultyId = req.query.faculty_id || req.body?.faculty_id;
    const subjectId = req.query.subject_id || req.body?.subject_id;
    const cycleId = req.query.feedback_cycle_id || req.body?.feedback_cycle_id;
    const allowEmpty = req.query.allow_empty === 'true' || Boolean(req.body?.allow_empty);
    const totalStrength = req.query.total_strength ? Number(req.query.total_strength) : undefined;

    const result = await generateQuestionWiseReportDocx({
      supabase,
      facultyId,
      subjectId,
      cycleId,
      allowEmpty,
      totalStrength
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('X-Appeared', String(result.appeared));
    res.setHeader('X-Total-Strength', String(result.totalStrength));
    res.setHeader('X-Marks-Secured', String(result.marksSecured));
    res.setHeader('X-Overall-Percentage', result.overallPercentage);
    res.setHeader('X-Grade', result.grade);

    return res.send(result.buffer);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      error: err.message || 'Failed to generate Word report',
      code: err.code || 'REPORT_ERROR'
    });
  }
}
