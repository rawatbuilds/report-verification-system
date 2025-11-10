import React, { useRef } from "react";
import { Upload, X, FileText, CheckCircle } from "lucide-react";

export function FileUpload({ label, onFileSelect, selectedFile, onClearFile }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="file-upload-area relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-blue-100 rounded-full p-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-700">
                Drop your file here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supported formats: .csv, .xlsx, .xls
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-900">
                    File Selected
                  </p>
                </div>
                <p className="text-sm text-gray-700 truncate mt-1" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFile();
              }}
              className="ml-2 flex-shrink-0 p-1.5 hover:bg-red-100 rounded-full transition-colors duration-200 group"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
