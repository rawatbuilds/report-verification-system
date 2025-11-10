import React, { memo, useState } from "react";
import { Download, FileText, Table, Printer } from "lucide-react";
import { exportToJSON, exportToCSV, exportToPDF } from "../utils/exportUtils";
import Swal from "sweetalert2";

export const ExportOptions = memo(({ result, referenceFile, currentFile }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      
      switch (format) {
        case "json":
          exportToJSON(result, referenceFile, currentFile);
          break;
        case "csv":
          exportToCSV(result, referenceFile, currentFile);
          break;
        case "pdf":
          exportToPDF(result, referenceFile, currentFile);
          break;
        default:
          throw new Error('Invalid export format');
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Report exported as ${format.toUpperCase()}`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export report. Please try again.',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setExporting(false);
    }
  };

  const exportButtons = [
    {
      format: 'json',
      label: 'JSON Report',
      icon: FileText,
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      format: 'csv',
      label: 'CSV Export',
      icon: Table,
      bgColor: 'bg-green-50 hover:bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    {
      format: 'pdf',
      label: 'PDF Report',
      icon: Printer,
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <Download className="w-5 h-5 text-gray-600" />
        <h4 className="text-lg font-medium text-gray-900">Export Results</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {exportButtons.map(({ format, label, icon: Icon, bgColor, textColor, borderColor }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            disabled={exporting}
            className={`${bgColor} ${textColor} border ${borderColor} rounded-lg px-4 py-3 
              font-medium transition-all duration-200 flex items-center justify-center space-x-2
              disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95`}
            aria-label={`Export as ${format}`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

ExportOptions.displayName = 'ExportOptions';
