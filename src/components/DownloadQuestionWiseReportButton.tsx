import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import {
  generateAndDownloadReportInBrowser,
  downloadReportFromEdgeFunction,
  type GenerateReportOptions
} from '../services/questionWiseReportService';

interface DownloadQuestionWiseReportButtonProps {
  facultyId: string;
  subjectId: string;
  cycleId: string;
  facultyName: string;
  subjectName: string;
  courseCode: string;
  departmentName?: string;
  totalStrength?: number;
  appeared?: number;
  cachedQStats?: any[];
  totalResponses?: number;
  useEdgeFunction?: boolean;
  className?: string;
}

export const DownloadQuestionWiseReportButton: React.FC<DownloadQuestionWiseReportButtonProps> = ({
  facultyId,
  subjectId,
  cycleId,
  facultyName,
  subjectName,
  courseCode,
  departmentName,
  totalStrength,
  appeared,
  cachedQStats,
  totalResponses,
  useEdgeFunction = false,
  className = ''
}) => {
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setErrorMessage(null);

      const effectiveResponses = appeared ?? totalResponses;
      if (effectiveResponses !== undefined && effectiveResponses === 0) {
        throw new Error(
          `No student survey responses received for "${facultyName}" (${courseCode}). Cannot generate Question-Wise Analysis Report.`
        );
      }

      if (useEdgeFunction) {
        await downloadReportFromEdgeFunction(facultyId, subjectId, cycleId, facultyName, courseCode);
      } else {
        const options: GenerateReportOptions = {
          facultyId,
          subjectId,
          cycleId,
          facultyName,
          subjectName,
          courseCode,
          departmentName,
          totalStrength,
          appeared: effectiveResponses,
          cachedQStats,
          totalResponses: effectiveResponses
        };

        await generateAndDownloadReportInBrowser(options);
      }
    } catch (err: any) {
      console.error('Error downloading Word report:', err);
      setErrorMessage(err.message || 'Failed to generate Word report.');
      alert(err.message || 'Failed to generate Word document.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleDownload}
        disabled={downloading}
        title="Download official Question-Wise Analysis Report (.docx)"
        className={`flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {downloading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-blue-700" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
            Word (.docx)
          </>
        )}
      </button>

      {errorMessage && (
        <div className="absolute right-0 top-full mt-1 w-64 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs shadow-lg z-20 flex items-start space-x-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default DownloadQuestionWiseReportButton;
