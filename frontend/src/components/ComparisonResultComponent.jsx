import React, { memo } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, TrendingUp, TrendingDown, Shuffle } from "lucide-react";
import { ExportOptions } from "./ExportOptions";
import { ERROR_TYPES } from "../constants/fileTypes";

const ErrorIcon = ({ type }) => {
  const icons = {
    [ERROR_TYPES.MISSING]: <TrendingDown className="w-4 h-4 text-red-500" />,
    [ERROR_TYPES.EXTRA]: <TrendingUp className="w-4 h-4 text-orange-500" />,
    [ERROR_TYPES.SEQUENCE]: <Shuffle className="w-4 h-4 text-yellow-500" />,
    [ERROR_TYPES.CASE]: <Info className="w-4 h-4 text-blue-500" />,
  };
  
  return icons[type] || <AlertCircle className="w-4 h-4 text-gray-500" />;
};

const getErrorColor = (type) => {
  const colors = {
    [ERROR_TYPES.MISSING]: "bg-red-50 border-red-200",
    [ERROR_TYPES.EXTRA]: "bg-orange-50 border-orange-200",
    [ERROR_TYPES.SEQUENCE]: "bg-yellow-50 border-yellow-200",
    [ERROR_TYPES.CASE]: "bg-blue-50 border-blue-200",
  };
  
  return colors[type] || "bg-gray-50 border-gray-200";
};

const SummaryCard = memo(({ label, value, color }) => (
  <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
));

SummaryCard.displayName = 'SummaryCard';

export const ComparisonResultComponent = memo(({ result, referenceFile, currentFile }) => {
  if (!result) return null;

  const summaryItems = [
    { label: "Total Columns", value: result.summary?.totalColumns || 0, color: "text-gray-900" },
    { label: "Matching", value: result.summary?.matchingColumns || 0, color: "text-green-600" },
    { label: "Missing", value: result.summary?.missingColumns || 0, color: "text-red-600" },
    { label: "Extra", value: result.summary?.extraColumns || 0, color: "text-orange-600" },
    { label: "Sequence Issues", value: result.summary?.sequenceErrors || 0, color: "text-yellow-600" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-900">
          Verification Results
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Comparing "<span className="font-medium">{currentFile}</span>" against reference "
          <span className="font-medium">{referenceFile}</span>"
        </p>
      </div>

      {/* Summary Section */}
      <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {summaryItems.map((item, idx) => (
            <SummaryCard key={idx} {...item} />
          ))}
        </div>
      </div>

      {/* Errors Section */}
      {result.errors && result.errors.length > 0 ? (
        <div className="px-6 py-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Issues Found ({result.errors.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {result.errors.map((error, index) => (
              <div 
                key={`error-${index}`} 
                className={`p-4 rounded-lg border ${getErrorColor(error.type)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-3">
                  <ErrorIcon type={error.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{error.message}</p>
                    {(error.expected || error.actual) && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        {error.expected && <p>Expected: <span className="font-mono">{error.expected}</span></p>}
                        {error.actual && <p>Actual: <span className="font-mono">{error.actual}</span></p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Success Message */}
      {result.isValid && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-200 text-green-800 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">All columns match perfectly!</p>
        </div>
      )}

      {/* Export Options */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <ExportOptions
          result={result}
          referenceFile={referenceFile}
          currentFile={currentFile}
        />
      </div>
    </div>
  );
});

ComparisonResultComponent.displayName = 'ComparisonResultComponent';

