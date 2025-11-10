import React from "react";
import { FileCheck, Calendar, Columns, Trash2 } from "lucide-react";

export function ReferenceInfo({ reference, onClear }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 rounded-lg p-1.5">
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            Reference File Structure
          </h3>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
          aria-label="Clear reference"
        >
          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Filename */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Filename</p>
          <p className="text-sm text-gray-900 font-medium truncate" title={reference.filename}>
            {reference.filename}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-xs font-medium text-gray-500">Uploaded</p>
            </div>
            <p className="text-xs text-gray-900 font-medium">
              {formatDate(reference.uploadDate)}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center space-x-2 mb-1">
              <Columns className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-xs font-medium text-gray-500">Columns</p>
            </div>
            <p className="text-xl font-bold text-blue-600">
              {reference.columns.length}
            </p>
          </div>
        </div>

        {/* Column Structure */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Column Structure:</p>
          <div className="max-h-32 overflow-y-auto pr-2">
            <div className="grid grid-cols-4 gap-2">
              {reference.columns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 bg-blue-50 rounded px-2 py-1.5 border border-blue-100"
                >
                  <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-gray-700 truncate" title={col}>
                    {col}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
