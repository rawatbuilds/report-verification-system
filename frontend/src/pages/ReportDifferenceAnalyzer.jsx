import React, { useState, useEffect } from "react";
import { FileUpload } from "../components/FileUpload";
import { Loader2, Download } from "lucide-react";
import Swal from "sweetalert2";

export const ReportDifferenceAnalyzer = () => {
  const [refFile, setRefFile] = useState(null);
  const [mainFile, setMainFile] = useState(null);
  const [refSheets, setRefSheets] = useState([]);
  const [mainSheets, setMainSheets] = useState([]);
  const [refSheet, setRefSheet] = useState("");
  const [mainSheet, setMainSheet] = useState("");
  const [progress, setProgress] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const BASE_URL = "http://127.0.0.1:8000/report-difference-analyzer";

  // ===============================
  // 📘 Fetch available sheets (Excel)
  // ===============================
  const handleSheetFetch = async (file, setSheets) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/sheets/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.sheets) setSheets(data.sheets);
      else if (data.error) console.error(data.error);
    } catch (err) {
      console.error("Error fetching sheets:", err);
    }
  };

  useEffect(() => {
    if (refFile?.name.endsWith(".xlsx")) {
      handleSheetFetch(refFile, setRefSheets);
    } else {
      setRefSheets([]);
      setRefSheet("");
    }
  }, [refFile]);

  useEffect(() => {
    if (mainFile?.name.endsWith(".xlsx")) {
      handleSheetFetch(mainFile, setMainSheets);
    } else {
      setMainSheets([]);
      setMainSheet("");
    }
  }, [mainFile]);

  // ===============================
  // 🚀 Trigger Analysis
  // ===============================
  const handleAnalyze = async () => {
    if (!refFile || !mainFile) return;

    if (
      (refFile.name.endsWith(".xlsx") && !refSheet) ||
      (mainFile.name.endsWith(".xlsx") && !mainSheet)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Sheet Selection Required",
        text: "Please select sheets in both Reference and Main reports before analysis.",
      });
      return;
    }

    setSummary(null);
    setLoading(true);
    const formData = new FormData();
    formData.append("reference", refFile);
    formData.append("main", mainFile);

    const url = new URL(`${BASE_URL}/analyze/`);
    if (refSheet) url.searchParams.append("ref_sheet", refSheet);
    if (mainSheet) url.searchParams.append("main_sheet", mainSheet);

    const res = await fetch(url, { method: "POST", body: formData });

    if (!res.ok) {
      const errorData = await res.json();
      Swal.fire({
        icon: "error",
        title: "Column Mismatch Detected",
        text:
          errorData.error ||
          "Reports cannot be compared due to missing or mismatched columns.",
      });
      setLoading(false);
      return;
    }

    const result = await res.json();
    setSummary(result);

    const id = setInterval(fetchProgress, 1500);
    setIntervalId(id);
  };

  // ===============================
  // ⏱️ Poll Progress API
  // ===============================
  const fetchProgress = async () => {
    const res = await fetch(`${BASE_URL}/progress`);
    const data = await res.json();
    setProgress(data);
    setLoading(false);

    if (["done", "error"].includes(data.phase)) clearInterval(intervalId);

    if (data.phase === "error") {
      Swal.fire({
        icon: "error",
        title: "Analysis Failed",
        text: data.message || "Unexpected error occurred during comparison.",
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          Report Difference Analyzer
        </h1>

        {/* ================= Upload Section ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Reference File */}
          <div>
            <FileUpload
              label="Upload Reference Report"
              selectedFile={refFile}
              onFileSelect={setRefFile}
              onClearFile={() => setRefFile(null)}
            />
            {refSheets.length > 0 && (
              <div className="mt-3">
                <label className="text-sm text-gray-700 font-medium">
                  Select Sheet (Reference):
                </label>
                <select
                  value={refSheet}
                  onChange={(e) => setRefSheet(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Sheet --</option>
                  {refSheets.map((sheet, i) => (
                    <option key={i} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Main File */}
          <div>
            <FileUpload
              label="Upload Main Report"
              selectedFile={mainFile}
              onFileSelect={setMainFile}
              onClearFile={() => setMainFile(null)}
            />
            {mainSheets.length > 0 && (
              <div className="mt-3">
                <label className="text-sm text-gray-700 font-medium">
                  Select Sheet (Main):
                </label>
                <select
                  value={mainSheet}
                  onChange={(e) => setMainSheet(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Sheet --</option>
                  {mainSheets.map((sheet, i) => (
                    <option key={i} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ================= Analyze Button ================= */}
        <button
          onClick={handleAnalyze}
          disabled={!refFile || !mainFile || loading}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>{loading ? "Analyzing..." : "Start Analysis"}</span>
        </button>

        {/* ================= Progress Section ================= */}
        {progress && (
          <div className="mt-10 bg-gray-100 border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {progress.percent}% — {progress.message}
            </p>
          </div>
        )}

        {/* ================= Summary Section ================= */}
        {summary && summary.status === "success" && (
          <div className="mt-10 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              ✅ Analysis Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {summary.rowsCompared ?? 0}
                </p>
                <p className="text-sm text-gray-600">Rows Compared</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {summary.sharedColumns ?? 0}
                </p>
                <p className="text-sm text-gray-600">Shared Columns</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {summary.matchedRows ?? 0}
                </p>
                <p className="text-sm text-gray-600">Matched Rows</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {summary.missingRows ?? 0}
                </p>
                <p className="text-sm text-gray-600">Missing Rows</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {summary.extraRows ?? 0}
                </p>
                <p className="text-sm text-gray-600">Extra Rows</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600">
                  {summary.cellMismatches ?? 0}
                </p>
                <p className="text-sm text-gray-600">Cell Mismatches</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= Download Buttons ================= */}
        {progress?.phase === "done" && (
          <div className="mt-6 flex flex-wrap gap-4">
            {/* Only show Missing Rows button if file exists */}
            {summary?.missingPath && (
              <a
                href={`${BASE_URL}/download-missing/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Missing Rows</span>
              </a>
            )}

            {/* Only show Extra Rows button if file exists */}
            {summary?.extraPath && (
              <a
                href={`${BASE_URL}/download-extra/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Extra Rows</span>
              </a>
            )}

            {/* Only show Cell Differences button if file exists */}
            {summary?.mismatchPath && (
              <a
                href={`${BASE_URL}/download-mismatched/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Cell Differences</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


