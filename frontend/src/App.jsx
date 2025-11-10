import React, { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { ReferenceInfo } from "./components/ReferenceInfo";
import { ComparisonResultComponent } from "./components/ComparisonResultComponent";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SheetSelector } from "./components/SheetSelector";
import { reportService } from "./services/reportService";
import { ERROR_MESSAGES } from "./constants/fileTypes";
import Swal from "sweetalert2";
import { FileCheck2, ArrowRight } from "lucide-react";
import "./App.css";

const BASE_URL = "http://127.0.0.1:8000";
const COLUMN_VALIDATOR_URL = `${BASE_URL}/column-validator`;

export default function App() {
  const [referenceMeta, setReferenceMeta] = useState(null);
  const [referenceFileObj, setReferenceFileObj] = useState(null);
  const [currentFileObj, setCurrentFileObj] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [availableSheets, setAvailableSheets] = useState(null);
  const [currentSheet, setCurrentSheet] = useState(null);
  const [currentFileSheets, setCurrentFileSheets] = useState(null);
  const [currentFileSheet, setCurrentFileSheet] = useState(null);

  // Upload reference file
  const uploadReference = async (file) => {
    try {
      setLoading(true);
      setLoadingMessage("Uploading reference file...");
      const fd = new FormData();
      fd.append("file", file);

      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type);

      const resp = await fetch(`${COLUMN_VALIDATOR_URL}/upload-reference/`, {
        method: "POST",
        body: fd,
      });

      console.log("Response status:", resp.status);
      
      if (!resp.ok) {
        const err = await resp.text();
        console.error("Backend error response:", err);
        throw new Error(`Failed to upload reference: ${err}`);
      }

      const data = await resp.json();
      setReferenceMeta({
        filename: data.filename,
        columns: data.columns,
        uploadDate: new Date().toISOString(),
      });
      setReferenceFileObj(file);
      setAvailableSheets(data.sheets);
      setCurrentSheet(data.currentSheet);
      
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: data.sheets && data.sheets.length > 1 
          ? `Reference file uploaded! Found ${data.sheets.length} sheets.` 
          : "Reference file uploaded successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Upload Reference Error:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Error uploading reference file. Check backend logs.",
      });
    } finally {
      setLoading(false);
      setLoadingMessage("Processing...");
    }
  };

  // Handle sheet change
  const handleSheetChange = async (sheetName) => {
    try {
      setLoading(true);
      setLoadingMessage("Loading sheet...");
      
      const resp = await fetch(`${COLUMN_VALIDATOR_URL}/change-sheet/?sheet_name=${encodeURIComponent(sheetName)}`, {
        method: "POST",
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to change sheet: ${err}`);
      }

      const data = await resp.json();
      setReferenceMeta({
        ...referenceMeta,
        columns: data.columns,
      });
      setCurrentSheet(data.currentSheet);
      
      Swal.fire({
        icon: "success",
        title: "Sheet Changed!",
        text: `Now using sheet: ${sheetName}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Change Sheet Error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Change Sheet",
        text: err.message || "Error changing sheet. See console for details.",
      });
    } finally {
      setLoading(false);
      setLoadingMessage("Processing...");
    }
  };

  // Handle current file selection with sheet detection
  const handleCurrentFileSelect = async (file) => {
    setCurrentFileObj(file);
    
    // Check if it's an Excel file and detect sheets
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
      try {
        setLoading(true);
        setLoadingMessage("Detecting sheets...");
        
        const fd = new FormData();
        fd.append("file", file);

        const resp = await fetch(`${COLUMN_VALIDATOR_URL}/detect-sheets/`, {
          method: "POST",
          body: fd,
        });

        if (resp.ok) {
          const data = await resp.json();
          setCurrentFileSheets(data.sheets);
          setCurrentFileSheet(data.currentSheet);
        }
      } catch (err) {
        console.error("Sheet detection error:", err);
        // Non-critical error, just continue without sheet selection
      } finally {
        setLoading(false);
        setLoadingMessage("Processing...");
      }
    } else {
      setCurrentFileSheets(null);
      setCurrentFileSheet(null);
    }
  };

  // Handle current file sheet change
  const handleCurrentFileSheetChange = (sheetName) => {
    setCurrentFileSheet(sheetName);
  };

  const clearReference = () => {
    setReferenceMeta(null);
    setReferenceFileObj(null);
    setCompareResult(null);
    setAvailableSheets(null);
    setCurrentSheet(null);
  };

  const clearCurrentFile = () => {
    setCurrentFileObj(null);
    setCurrentFileSheets(null);
    setCurrentFileSheet(null);
  };

  // Compare reference vs report
  const handleCompare = async () => {
    if (!referenceFileObj) {
      Swal.fire({
        icon: "warning",
        title: "Missing Reference",
        text: "Please upload a reference file first.",
      });
      return;
    }
    
    if (!currentFileObj) {
      Swal.fire({
        icon: "warning",
        title: "Missing Report",
        text: "Please select a report to verify.",
      });
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Comparing reports...");
      const fd = new FormData();
      fd.append("reference", referenceFileObj);
      fd.append("current", currentFileObj);
      
      // Add sheet names if available
      if (currentSheet) {
        fd.append("reference_sheet", currentSheet);
      }
      if (currentFileSheet) {
        fd.append("current_sheet", currentFileSheet);
      }

      const resp = await fetch(`${COLUMN_VALIDATOR_URL}/compare-reports/`, {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Compare failed: ${err}`);
      }

      const data = await resp.json();
      setCompareResult(data);
      
      Swal.fire({
        icon: "success",
        title: "Comparison Complete!",
        text: "Reports have been compared successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Compare Error:", err);
      Swal.fire({
        icon: "error",
        title: "Comparison Failed",
        text: err.message || "Error comparing reports. See console for details.",
      });
    } finally {
      setLoading(false);
      setLoadingMessage("Processing...");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {loading && <LoadingSpinner message={loadingMessage} />}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileCheck2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Report Verification System
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Upload and compare report columns to ensure data consistency
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Side - Reference File */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Reference File</h2>
              </div>
              
              <FileUpload
                label=""
                onFileSelect={uploadReference}
                selectedFile={referenceFileObj}
                onClearFile={clearReference}
              />
              
              {referenceMeta && (
                <div className="mt-4 space-y-3">
                  <ReferenceInfo reference={referenceMeta} onClear={clearReference} />
                  <SheetSelector
                    sheets={availableSheets}
                    currentSheet={currentSheet}
                    onSheetChange={handleSheetChange}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Report to Verify */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Report to Verify</h2>
              </div>
              
              <FileUpload
                label=""
                onFileSelect={handleCurrentFileSelect}
                selectedFile={currentFileObj}
                onClearFile={clearCurrentFile}
              />

              {currentFileObj && currentFileSheets && (
                <div className="mt-3">
                  <SheetSelector
                    sheets={currentFileSheets}
                    currentSheet={currentFileSheet}
                    onSheetChange={handleCurrentFileSheetChange}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleCompare}
                  disabled={!referenceMeta || !currentFileObj || loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold
                    hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                    flex items-center justify-center space-x-2"
                >
                  <FileCheck2 className="w-5 h-5" />
                  <span>{loading ? "Processing..." : "Verify Report"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section - Full Width */}
        {compareResult && (
          <div className="animate-fade-in">
            <ComparisonResultComponent
              result={compareResult}
              referenceFile={compareResult.referenceFile || referenceMeta.filename}
              currentFile={compareResult.currentFile || currentFileObj.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

