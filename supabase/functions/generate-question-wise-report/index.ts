// Supabase Edge Function: generate-question-wise-report
// Generates official institutional QuestionWiseAnalysisReport (.docx)
// Matching exact Thiagarajar Polytechnic College format with docxtemplater and pizzip

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import PizZip from "npm:pizzip@3.1.7";
import Docxtemplater from "npm:docxtemplater@3.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function calculateGrade(percentage: number): string {
  if (percentage >= 91.0) return "A+";
  if (percentage >= 81.0) return "A";
  if (percentage >= 71.0) return "B";
  if (percentage >= 61.0) return "C";
  return "D";
}

function createDocxParser() {
  return function parser(tag: string) {
    return {
      get(scope: any, context: any) {
        if (tag === ".") return scope;
        if (scope && typeof scope === "object" && tag in scope) return scope[tag];

        const parts = tag.split(".");
        let val = scope;
        for (const part of parts) {
          if (val == null || typeof val !== "object") return undefined;
          val = val[part];
        }
        if (val !== undefined && val !== null) return val;

        if (parts[0] === "q" && parts.length === 2 && scope && typeof scope === "object" && parts[1] in scope) {
          return scope[parts[1]];
        }

        const scopes = (context && (context.scopeList || context.scopePath)) || [];
        for (let i = scopes.length - 1; i >= 0; i--) {
          const parentScope = scopes[i];
          if (!parentScope || typeof parentScope !== "object") continue;
          if (tag in parentScope) return parentScope[tag];
          let pVal = parentScope;
          for (const part of parts) {
            if (pVal == null || typeof pVal !== "object") return undefined;
            pVal = pVal[part];
          }
          if (pVal !== undefined && pVal !== null) return pVal;
        }

        return "";
      },
    };
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let facultyId = "";
    let subjectId = "";
    let cycleId = "";
    let allowEmpty = false;
    let customStrength = 0;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        facultyId = body.faculty_id || body.facultyId || "";
        subjectId = body.subject_id || body.subjectId || "";
        cycleId = body.feedback_cycle_id || body.cycleId || "";
        allowEmpty = Boolean(body.allow_empty);
        customStrength = Number(body.total_strength) || 0;
      } catch {
        // Fallback to URL params
      }
    }

    if (!facultyId || !subjectId || !cycleId) {
      const url = new URL(req.url);
      facultyId = facultyId || url.searchParams.get("faculty_id") || "";
      subjectId = subjectId || url.searchParams.get("subject_id") || "";
      cycleId = cycleId || url.searchParams.get("feedback_cycle_id") || url.searchParams.get("cycle_id") || "";
      if (url.searchParams.get("allow_empty") === "true") allowEmpty = true;
      if (url.searchParams.get("total_strength")) customStrength = Number(url.searchParams.get("total_strength"));
    }

    if (!facultyId || !subjectId || !cycleId) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
          details: "faculty_id, subject_id, and feedback_cycle_id are required.",
          received: { faculty_id: facultyId, subject_id: subjectId, feedback_cycle_id: cycleId },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch Faculty, Subject, Cycle, Questions
    const [facRes, subjRes, cycleRes, qRes] = await Promise.all([
      supabase.from("faculty").select("*, departments(*)").eq("id", facultyId).single(),
      supabase.from("subjects").select("*").eq("id", subjectId).single(),
      supabase.from("feedback_cycles").select("*").eq("id", cycleId).single(),
      supabase.from("feedback_questions").select("*").order("question_number", { ascending: true }),
    ]);

    if (facRes.error || !facRes.data) {
      return new Response(JSON.stringify({ error: "Faculty not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (subjRes.error || !subjRes.data) {
      return new Response(JSON.stringify({ error: "Subject not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (cycleRes.error || !cycleRes.data) {
      return new Response(JSON.stringify({ error: "Feedback cycle not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const faculty = facRes.data;
    const subject = subjRes.data;
    const cycle = cycleRes.data;
    const questions = qRes.data || [];

    if (questions.length === 0) {
      return new Response(JSON.stringify({ error: "No feedback questions found in system" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Fetch feedback responses
    const { data: responses, error: respError } = await supabase
      .from("feedback_responses")
      .select("id, student_id, submitted_at, status")
      .eq("faculty_id", facultyId)
      .eq("subject_id", subjectId)
      .eq("feedback_cycle_id", cycleId);

    if (respError) {
      return new Response(JSON.stringify({ error: "Failed to fetch feedback responses", details: respError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if ((!responses || responses.length === 0) && !allowEmpty) {
      return new Response(
        JSON.stringify({
          error: "No survey responses found",
          details: `No students have submitted feedback for faculty '${faculty.faculty_name}' on subject '${subject.subject_name}'.`,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const responseIds = (responses || []).map((r) => r.id);

    // 3. Fetch detailed answers
    let answers: any[] = [];
    if (responseIds.length > 0) {
      const CHUNK_SIZE = 100;
      for (let i = 0; i < responseIds.length; i += CHUNK_SIZE) {
        const chunk = responseIds.slice(i, i + CHUNK_SIZE);
        const { data: chunkAnswers, error: ansError } = await supabase
          .from("feedback_answers")
          .select("response_id, question_id, rating_value, selected_option")
          .in("response_id", chunk);

        if (ansError) {
          return new Response(JSON.stringify({ error: "Failed to load feedback answers", details: ansError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (chunkAnswers) answers = answers.concat(chunkAnswers);
      }
    }

    // 4. Incomplete submission validation
    const expectedQuestionsCount = questions.length;
    const answersByResponse = new Map<string, any[]>();
    answers.forEach((ans) => {
      const arr = answersByResponse.get(ans.response_id) || [];
      arr.push(ans);
      answersByResponse.set(ans.response_id, arr);
    });

    const validResponseIds = new Set<string>();
    const distinctStudents = new Set<string>();

    (responses || []).forEach((r) => {
      const ansList = answersByResponse.get(r.id) || [];
      if (ansList.length >= expectedQuestionsCount) {
        validResponseIds.add(r.id);
        if (r.student_id) distinctStudents.add(r.student_id);
      }
    });

    const effectiveResponseIds = validResponseIds.size > 0 ? validResponseIds : new Set(responseIds);
    const appearedCount = distinctStudents.size > 0 ? distinctStudents.size : effectiveResponseIds.size;

    // 5. Total Strength
    let totalStrengthCount = customStrength || 0;
    if (!totalStrengthCount) {
      const { count, error: countErr } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("department_id", faculty.department_id)
        .eq("year", cycle.year || subject.year || 3);

      if (!countErr && count) {
        totalStrengthCount = count;
      } else {
        totalStrengthCount = appearedCount;
      }
    }
    if (totalStrengthCount < appearedCount) {
      totalStrengthCount = appearedCount;
    }

    // 6. Calculate question-wise counts and marks
    let totalC5 = 0, totalC4 = 0, totalC3 = 0, totalC2 = 0, totalC1 = 0, totalObtainedMarks = 0;

    const formattedQuestions = questions.map((q, index) => {
      const qAnswers = answers.filter(
        (ans) => ans.question_id === q.id && effectiveResponseIds.has(ans.response_id)
      );

      let count5 = 0, count4 = 0, count3 = 0, count2 = 0, count1 = 0;
      qAnswers.forEach((ans) => {
        if (ans.rating_value === 5) count5++;
        else if (ans.rating_value === 4) count4++;
        else if (ans.rating_value === 3) count3++;
        else if (ans.rating_value === 2) count2++;
        else if (ans.rating_value === 1) count1++;
      });

      const marksSecured = 5 * count5 + 4 * count4 + 3 * count3 + 2 * count2 + 1 * count1;
      const maxMarksForQuestion = appearedCount * 5;
      const percentageNum = maxMarksForQuestion > 0 ? (marksSecured / maxMarksForQuestion) * 100 : 0;
      const feedbackPercentage = percentageNum.toFixed(2);

      totalC5 += count5;
      totalC4 += count4;
      totalC3 += count3;
      totalC2 += count2;
      totalC1 += count1;
      totalObtainedMarks += marksSecured;

      const qData = {
        q_no: q.question_number || index + 1,
        question_text: q.question_text || `Question ${index + 1}`,
        excellent: count5,
        very_good: count4,
        good: count3,
        satisfactory: count2,
        poor: count1,
        marks_secured: marksSecured,
        feedback_percentage: feedbackPercentage,
      };

      return {
        ...qData,
        q: qData,
      };
    });

    const maxPossibleMarks = appearedCount * questions.length * 5;
    const overallPercentageNum = maxPossibleMarks > 0 ? (totalObtainedMarks / maxPossibleMarks) * 100 : 0;
    const overallPercentage = overallPercentageNum.toFixed(2);
    const grade = calculateGrade(overallPercentageNum);

    const templateData = {
      course_name: subject.subject_name,
      faculty_name: faculty.faculty_name,
      total_strength: totalStrengthCount,
      max_marks: maxPossibleMarks,
      appeared: appearedCount,
      marks_secured: totalObtainedMarks,
      overall_feedback: overallPercentage,
      grade: grade,

      questions: formattedQuestions,
      q: formattedQuestions,

      total_excellent: totalC5,
      total_very_good: totalC4,
      total_good: totalC3,
      total_satisfactory: totalC2,
      total_poor: totalC1,
      total_marks_secured: totalObtainedMarks,
      total_feedback_percentage: overallPercentage,

      overall_percentage: overallPercentage,
    };

    // 7. Load Template & Render
    let templateBytes: Uint8Array;
    try {
      const templatePath = new URL("./templates/QuestionWiseAnalysisReport.docx", import.meta.url).pathname;
      templateBytes = await Deno.readFile(templatePath);
    } catch {
      try {
        templateBytes = await Deno.readFile("./public/templates/QuestionWiseAnalysisReport.docx");
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: "Template file not found", details: err?.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const zip = new PizZip(templateBytes);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
      parser: createDocxParser(),
    });

    doc.render(templateData);

    const generatedDocx = doc.getZip().generate({
      type: "uint8array",
      compression: "DEFLATE",
    });

    const sanitizedFaculty = faculty.faculty_name.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedCourse = subject.course_code.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `QuestionWiseAnalysisReport_${sanitizedFaculty}_${sanitizedCourse}.docx`;

    return new Response(generatedDocx, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Appeared": String(appearedCount),
        "X-Total-Strength": String(totalStrengthCount),
        "X-Marks-Secured": String(totalObtainedMarks),
        "X-Overall-Percentage": overallPercentage,
        "X-Grade": grade,
      },
    });
  } catch (error: any) {
    console.error("Unhandled error generating report:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error generating report",
        message: error?.message || "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
