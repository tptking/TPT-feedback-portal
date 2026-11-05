const fs = require('fs');
const path = require('path');
const docx = require('docx');
const { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, AlignmentType, BorderStyle, ShadingType 
} = docx;

// Styling constants
const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }
};

const headerBorder = {
  top: { style: BorderStyle.SINGLE, size: 8, color: "1E3A8A" },
  bottom: { style: BorderStyle.SINGLE, size: 8, color: "1E3A8A" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" }
};

const cellPadding = { top: 120, bottom: 120, left: 140, right: 140 };

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 720, bottom: 720, left: 720, right: 720 }
      }
    },
    children: [
      // 1. Institutional Header
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "THIAGARAJAR POLYTECHNIC COLLEGE, SALEM - 636 005",
            bold: true,
            size: 26,
            color: "1E3A8A",
            font: "Calibri"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: "(Government Aided Autonomous Institution | Affiliated to DOTE, Chennai)",
            italics: true,
            size: 18,
            color: "475569",
            font: "Calibri"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "DEPARTMENT OF {{department_name}}",
            bold: true,
            size: 22,
            color: "0F172A",
            font: "Calibri"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: "STUDENTS FEEDBACK ON FACULTY - QUESTION-WISE ANALYSIS REPORT",
            bold: true,
            size: 20,
            color: "1E3A8A",
            font: "Calibri"
          })
        ]
      }),

      // 2. Metadata Grid
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                width: { size: 18, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Faculty Name:", bold: true, size: 18, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                width: { size: 32, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "{{faculty_name}}", bold: true, size: 18, font: "Calibri", color: "1E3A8A" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                width: { size: 18, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Academic Year:", bold: true, size: 18, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                width: { size: 32, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "{{academic_year}}", size: 18, font: "Calibri" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Course / Subject:", bold: true, size: 18, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ children: [new TextRun({ text: "{{course_name}} ({{course_code}})", size: 18, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Year / Semester:", bold: true, size: 18, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ children: [new TextRun({ text: "Year {{year}} / Sem {{semester}} - Section {{section}}", size: 18, font: "Calibri" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Evaluated Students:", bold: true, size: 18, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                columnSpan: 3,
                children: [new Paragraph({ children: [new TextRun({ text: "{{total_responses}} Responses received", bold: true, size: 18, font: "Calibri", color: "1E3A8A" })] })]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 180 }, children: [] }),

      // 3. Question-Wise Analysis Table
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Table Header
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 6, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Q.No", bold: true, size: 16, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 38, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Questions", bold: true, size: 16, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Excellent\n(5)", bold: true, size: 15, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Very Good\n(4)", bold: true, size: 15, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Good\n(3)", bold: true, size: 15, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Satisfactory\n(2)", bold: true, size: 15, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Poor\n(1)", bold: true, size: 15, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Marks\nSecured", bold: true, size: 15, color: "FFFFFF", font: "Calibri" })] })]
              }),
              new TableCell({
                borders: headerBorder,
                margins: cellPadding,
                shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Feedback\n(%)", bold: true, size: 15, color: "FFFFFF", font: "Calibri" })] })]
              })
            ]
          }),

          // Dynamic Table Row with Exact Template Placeholders
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{#questions}}{{q.q_no}}", size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ children: [new TextRun({ text: "{{q.question_text}}", size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{q.excellent}}", size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{q.very_good}}", size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{q.good}}", size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{q.satisfactory}}", size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{q.poor}}", size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{q.marks_secured}}", bold: true, size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{q.feedback_percentage}}{{/questions}}", bold: true, size: 16, font: "Calibri" })] })]
              })
            ]
          }),

          // Total Summary Row
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                columnSpan: 2,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total", bold: true, size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{total_excellent}}", bold: true, size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{total_very_good}}", bold: true, size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{total_good}}", bold: true, size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{total_satisfactory}}", bold: true, size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{total_poor}}", bold: true, size: 16, font: "Calibri" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{total_marks_secured}}", bold: true, size: 16, font: "Calibri", color: "1E3A8A" })] })]
              }),
              new TableCell({
                borders: cellBorder,
                margins: cellPadding,
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{{overall_percentage}}%", bold: true, size: 16, font: "Calibri", color: "1E3A8A" })] })]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 180 }, children: [] }),

      // 4. Highlight Overall Percentage Banner
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 12, color: "1E3A8A" },
                  bottom: { style: BorderStyle.SINGLE, size: 12, color: "1E3A8A" },
                  left: { style: BorderStyle.SINGLE, size: 12, color: "1E3A8A" },
                  right: { style: BorderStyle.SINGLE, size: 12, color: "1E3A8A" }
                },
                shading: { fill: "EFF6FF", type: ShadingType.CLEAR },
                margins: { top: 160, bottom: 160, left: 180, right: 180 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "OVERALL FEEDBACK PERCENTAGE: ",
                        bold: true,
                        size: 22,
                        color: "1E3A8A",
                        font: "Calibri"
                      }),
                      new TextRun({
                        text: "{{overall_percentage}}%",
                        bold: true,
                        size: 26,
                        color: "1E3A8A",
                        font: "Calibri"
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 140 }, children: [] }),

      // 5. Notes & Formula
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Calculation Methodology & Formulae:", bold: true, size: 16, font: "Calibri" })
        ]
      }),
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: "1. Rating Weights: Excellent (5) = 5, Very Good (4) = 4, Good (3) = 3, Satisfactory (2) = 2, Poor (1) = 1.",
            size: 15,
            font: "Calibri",
            color: "475569"
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: "2. Marks Secured = (5 × Excellent) + (4 × Very Good) + (3 × Good) + (2 × Satisfactory) + (1 × Poor).",
            size: 15,
            font: "Calibri",
            color: "475569"
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: "3. Question Feedback (%) = [Marks Secured / (Total Responses × 5)] × 100.",
            size: 15,
            font: "Calibri",
            color: "475569"
          })
        ]
      }),

      // 6. Signatures Grid
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\n\n\n__________________________", font: "Calibri", color: "64748B" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Faculty Member", bold: true, size: 16, font: "Calibri", color: "0F172A" })] })
                ]
              }),
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\n\n\n__________________________", font: "Calibri", color: "64748B" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Head of Department (HOD)", bold: true, size: 16, font: "Calibri", color: "0F172A" })] })
                ]
              }),
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\n\n\n__________________________", font: "Calibri", color: "64748B" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Principal", bold: true, size: 16, font: "Calibri", color: "0F172A" })] })
                ]
              })
            ]
          })
        ]
      })
    ]
  }]
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  const outDir = path.join(__dirname, '../public/templates');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'QuestionWiseAnalysisReport_Template.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated institutional template at: ${outPath} (${buffer.length} bytes)`);
}

main().catch(console.error);
