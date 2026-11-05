const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

function prepareTemplate() {
  const refPath = path.resolve(__dirname, '../reference_QuestionWiseAnalysisReport.docx');
  if (!fs.existsSync(refPath)) {
    throw new Error(`Reference document not found at: ${refPath}`);
  }

  const origZip = new PizZip(fs.readFileSync(refPath));
  let docXml = origZip.file('word/document.xml').asText();

  // 1. Table 1: Green-marked fields left blank for manual entry
  docXml = docXml.replace(
    '<w:t>Artificial Intelligence and Machine Learning (SS)</w:t>',
    '<w:t xml:space="preserve">                                                                                </w:t>'
  );
  docXml = docXml.replace('<w:t>II</w:t>', '<w:t xml:space="preserve">      </w:t>');
  docXml = docXml.replace('<w:t>3</w:t>', '<w:t xml:space="preserve">      </w:t>');
  docXml = docXml.replace('<w:t>A</w:t>', '<w:t xml:space="preserve">      </w:t>');
  docXml = docXml.replace('<w:t>29-09-2026</w:t>', '<w:t xml:space="preserve">                    </w:t>');
  docXml = docXml.replace('<w:t>29-11-2026</w:t>', '<w:t xml:space="preserve">                    </w:t>');

  // 2. Table 2: Red-marked fields
  docXml = docXml.replace('<w:t>Fundamentals of data science</w:t>', '<w:t>{{course_name}}</w:t>');
  docXml = docXml.replace('<w:t>Mr  V Naveen Kumar</w:t>', '<w:t>{{faculty_name}}</w:t>');

  // Total Strength: 64
  docXml = docXml.replace(
    /(<w:t xml:space="preserve">Total Strength: <\/w:t>[\s\S]*?<w:t>)64(<\/w:t>)/,
    '$1{{total_strength}}$2'
  );

  // Max.Mark: 3200
  docXml = docXml.replace(
    /(<w:t xml:space="preserve">: <\/w:t>[\s\S]*?<w:t>)3200(<\/w:t>)/,
    '$1{{max_marks}}$2'
  );

  // Appeared: 64
  docXml = docXml.replace(
    /(<w:t xml:space="preserve">Appeared: <\/w:t>[\s\S]*?<w:t>)64(<\/w:t>)/,
    '$1{{appeared}}$2'
  );

  // Marks Secured: 2983
  docXml = docXml.replace(
    /(<w:t xml:space="preserve">Marks Secured: <\/w:t>[\s\S]*?<w:t>)2983(<\/w:t>)/,
    '$1{{marks_secured}}$2'
  );

  // Overall feedback: 93.22 %
  docXml = docXml.replace(
    /(<w:t xml:space="preserve">Overall feedback: <\/w:t>[\s\S]*?<w:t>)93\.22(<\/w:t>)/,
    '$1{{overall_feedback}}$2'
  );

  // Grade: A+
  docXml = docXml.replace(
    /(<w:t xml:space="preserve">Grade: <\/w:t>[\s\S]*?<w:t>)A\+(<\/w:t>)/,
    '$1{{grade}}$2'
  );

  // 3. Table 3: Questions Table
  const t3Start = docXml.indexOf('<w:tbl', docXml.indexOf('Question Wise Analysis'));
  const t3End = docXml.indexOf('</w:tbl>', t3Start) + 8;
  const t3Xml = docXml.substring(t3Start, t3End);
  const rows = t3Xml.match(/<w:tr[\s\S]*?<\/w:tr>/g);

  const headerRow = rows[0];
  let loopRow = rows[1];
  const totalRow = rows[rows.length - 1];

  loopRow = loopRow.replace('<w:t>1</w:t>', '<w:t>{{#questions}}{{q.q_no}}</w:t>');
  loopRow = loopRow.replace(
    '<w:t>Completion of syllabus as per plan</w:t>',
    '<w:t>{{q.question_text}}</w:t>'
  );
  loopRow = loopRow.replace('<w:t>58</w:t>', '<w:t>{{q.excellent}}</w:t>');
  loopRow = loopRow.replace('<w:t>0</w:t>', '<w:t>{{q.very_good}}</w:t>');
  loopRow = loopRow.replace('<w:t>1</w:t>', '<w:t>{{q.good}}</w:t>');
  loopRow = loopRow.replace('<w:t>0</w:t>', '<w:t>{{q.satisfactory}}</w:t>');
  loopRow = loopRow.replace('<w:t>5</w:t>', '<w:t>{{q.poor}}</w:t>');
  loopRow = loopRow.replace('<w:t>298</w:t>', '<w:t>{{q.marks_secured}}</w:t>');
  loopRow = loopRow.replace(
    '<w:t>93.13</w:t>',
    '<w:t>{{q.feedback_percentage}}{{/questions}}</w:t>'
  );

  let modifiedTotalRow = totalRow;
  modifiedTotalRow = modifiedTotalRow.replace('<w:t>582</w:t>', '<w:t>{{total_excellent}}</w:t>');
  modifiedTotalRow = modifiedTotalRow.replace('<w:t>3</w:t>', '<w:t>{{total_very_good}}</w:t>');
  modifiedTotalRow = modifiedTotalRow.replace('<w:t>3</w:t>', '<w:t>{{total_good}}</w:t>');
  modifiedTotalRow = modifiedTotalRow.replace('<w:t>0</w:t>', '<w:t>{{total_satisfactory}}</w:t>');
  modifiedTotalRow = modifiedTotalRow.replace('<w:t>52</w:t>', '<w:t>{{total_poor}}</w:t>');
  modifiedTotalRow = modifiedTotalRow.replace('<w:t>2983</w:t>', '<w:t>{{total_marks_secured}}</w:t>');
  modifiedTotalRow = modifiedTotalRow.replace('<w:t>93.22</w:t>', '<w:t>{{total_feedback_percentage}}</w:t>');

  const newT3Xml =
    t3Xml.substring(0, t3Xml.indexOf('<w:tr')) + headerRow + loopRow + modifiedTotalRow + '</w:tbl>';
  docXml = docXml.substring(0, t3Start) + newT3Xml + docXml.substring(t3End);

  // 4. Over All Percentage after Table 3
  docXml = docXml.replace(
    /(<w:t>Over All Percentage:<\/w:t>[\s\S]*?<w:t>)93\.22(<\/w:t>)/,
    '$1{{overall_percentage}}$2'
  );

  // Validate all fields exist
  const fields = [
    'course_name', 'faculty_name', 'total_strength', 'max_marks', 'appeared',
    'marks_secured', 'overall_feedback', 'grade', '#questions', '/questions',
    'total_excellent', 'total_very_good', 'total_good', 'total_satisfactory',
    'total_poor', 'total_marks_secured', 'total_feedback_percentage', 'overall_percentage'
  ];

  fields.forEach(f => {
    const present = docXml.includes('{{' + f) || docXml.includes('{{#' + f) || docXml.includes('{{/' + f);
    if (!present) {
      throw new Error(`CRITICAL: Placeholder {{${f}}} was not properly injected into template XML!`);
    }
  });

  origZip.file('word/document.xml', docXml);
  const templateBuf = origZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

  const publicDest = path.resolve(__dirname, '../public/templates/QuestionWiseAnalysisReport.docx');
  const edgeDest = path.resolve(
    __dirname,
    '../supabase/functions/generate-question-wise-report/templates/QuestionWiseAnalysisReport.docx'
  );

  fs.mkdirSync(path.dirname(publicDest), { recursive: true });
  fs.mkdirSync(path.dirname(edgeDest), { recursive: true });

  fs.writeFileSync(publicDest, templateBuf);
  fs.writeFileSync(edgeDest, templateBuf);

  console.log(`Successfully verified and generated QuestionWiseAnalysisReport.docx at:`);
  console.log(` - ${publicDest} (${templateBuf.length} bytes)`);
  console.log(` - ${edgeDest} (${templateBuf.length} bytes)`);
}

prepareTemplate();
