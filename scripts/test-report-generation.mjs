import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function calculateGrade(percentage) {
  if (percentage >= 91.0) return 'A+';
  if (percentage >= 81.0) return 'A';
  if (percentage >= 71.0) return 'B';
  if (percentage >= 61.0) return 'C';
  return 'D';
}

function createDocxParser() {
  return function parser(tag) {
    return {
      get(scope, context) {
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

async function runTests() {
  console.log('--- Testing QuestionWiseAnalysisReport Word Generation ---');

  // Test 1: Grading Scale Thresholds
  console.log('\n[Test 1] Verifying Grade Scale Thresholds...');
  const gradeTests = [
    { pct: 95.5, expected: 'A+' },
    { pct: 91.0, expected: 'A+' },
    { pct: 90.99, expected: 'A' },
    { pct: 85.0, expected: 'A' },
    { pct: 81.0, expected: 'A' },
    { pct: 80.5, expected: 'B' },
    { pct: 75.0, expected: 'B' },
    { pct: 71.0, expected: 'B' },
    { pct: 70.99, expected: 'C' },
    { pct: 65.0, expected: 'C' },
    { pct: 61.0, expected: 'C' },
    { pct: 60.99, expected: 'D' },
    { pct: 50.0, expected: 'D' }
  ];

  gradeTests.forEach(t => {
    const res = calculateGrade(t.pct);
    if (res !== t.expected) {
      throw new Error(`Grade mismatch for ${t.pct}%: got ${res}, expected ${t.expected}`);
    }
  });
  console.log('✓ All 13 grade boundary conditions verified successfully.');

  // Test 2: Template file existence and structure
  console.log('\n[Test 2] Verifying Template File Integrity...');
  const templatePath = path.resolve(__dirname, '../public/templates/QuestionWiseAnalysisReport.docx');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at: ${templatePath}`);
  }
  const templateBuf = fs.readFileSync(templatePath);
  const zip = new PizZip(templateBuf);
  console.log(`✓ Template loaded successfully (${templateBuf.length} bytes).`);

  // Test 3: End-to-end report rendering with 64 students
  console.log('\n[Test 3] Rendering Official Student Feedback Assessment Report...');
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    parser: createDocxParser()
  });

  const questionList = [
    'Completion of syllabus as per plan',
    'Evaluation of tests/assignments in time',
    'Practice & Revision',
    'Punctuality to the class',
    'Preparation and subject knowledge',
    'Presentation skill',
    'Usage of appropriate teaching methods and aids',
    'Adequately answer to students questions',
    'Motivation to students in studies and cocurricular activities',
    'Special guidence to academically weak students'
  ];

  const appeared = 64;
  const totalStrength = 64;
  let totalC5 = 0, totalC4 = 0, totalC3 = 0, totalC2 = 0, totalC1 = 0, totalObtained = 0;

  // Exact counts matching reference document
  const rawCounts = [
    [58, 0, 1, 0, 5],
    [58, 0, 1, 0, 5],
    [58, 0, 1, 0, 5],
    [58, 0, 0, 0, 6],
    [58, 0, 0, 0, 6],
    [59, 0, 0, 0, 5],
    [59, 0, 0, 0, 5],
    [59, 0, 0, 0, 5],
    [58, 1, 0, 0, 5],
    [57, 2, 0, 0, 5]
  ];

  const questionsData = questionList.map((text, idx) => {
    const [c5, c4, c3, c2, c1] = rawCounts[idx];
    const marksSecured = (5 * c5) + (4 * c4) + (3 * c3) + (2 * c2) + (1 * c1);
    const maxMarks = appeared * 5;
    const feedbackPercentage = ((marksSecured / maxMarks) * 100).toFixed(2);

    totalC5 += c5;
    totalC4 += c4;
    totalC3 += c3;
    totalC2 += c2;
    totalC1 += c1;
    totalObtained += marksSecured;

    const item = {
      q_no: idx + 1,
      question_text: text,
      excellent: c5,
      very_good: c4,
      good: c3,
      satisfactory: c2,
      poor: c1,
      marks_secured: marksSecured,
      feedback_percentage: feedbackPercentage
    };
    return { ...item, q: item };
  });

  const maxTotalMarks = appeared * 10 * 5; // 3200
  const overallPercentage = ((totalObtained / maxTotalMarks) * 100).toFixed(2); // 93.22
  const grade = calculateGrade(parseFloat(overallPercentage)); // A+

  const renderPayload = {
    course_name: 'Fundamentals of data science',
    faculty_name: 'Mr  V Naveen Kumar',
    total_strength: totalStrength,
    max_marks: maxTotalMarks,
    appeared: appeared,
    marks_secured: totalObtained,
    overall_feedback: overallPercentage,
    grade: grade,

    questions: questionsData,
    q: questionsData,

    total_excellent: totalC5,
    total_very_good: totalC4,
    total_good: totalC3,
    total_satisfactory: totalC2,
    total_poor: totalC1,
    total_marks_secured: totalObtained,
    total_feedback_percentage: overallPercentage,

    overall_percentage: overallPercentage
  };

  doc.render(renderPayload);
  const outBuffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  const outPath = path.resolve(__dirname, '../test_final_verified_report.docx');
  fs.writeFileSync(outPath, outBuffer);
  console.log(`✓ Report rendered successfully: ${outPath} (${outBuffer.length} bytes)`);

  // Verify XML text in rendered document
  const verifyZip = new PizZip(outBuffer);
  const verifyXml = verifyZip.file('word/document.xml').asText();

  // Assert red fields are filled
  if (!verifyXml.includes('Fundamentals of data science')) throw new Error('Missing Course Name');
  if (!verifyXml.includes('Mr  V Naveen Kumar')) throw new Error('Missing Faculty Name');
  if (!verifyXml.includes('3200')) throw new Error('Missing Max.Mark: 3200');
  if (!verifyXml.includes('2983')) throw new Error('Missing Marks Secured: 2983');
  if (!verifyXml.includes('93.22')) throw new Error('Missing Overall Feedback: 93.22');
  if (!verifyXml.includes('A+')) throw new Error('Missing Grade: A+');

  // Assert green fields are blank
  if (verifyXml.includes('Artificial Intelligence and Machine Learning (SS)')) {
    throw new Error('Programme Name was not left blank for manual entry');
  }
  if (verifyXml.includes('29-09-2026')) {
    throw new Error('Date of Feedback was not left blank for manual entry');
  }

  // Assert HOD remarks box is present
  if (!verifyXml.includes('Remarks') || !verifyXml.includes('HOD')) {
    throw new Error('Remarks by HOD section missing');
  }

  // Clean up test file
  fs.unlinkSync(outPath);
  console.log('✓ All 10 test verification checks passed with 100% precision!\n');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
