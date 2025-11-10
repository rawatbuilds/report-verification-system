import React from "react";

export function SheetSelector({ sheets, currentSheet, onSheetChange, disabled = false }) {
  if (!sheets || sheets.length <= 1) {
    return null; // Don't show selector if there's only one sheet or no sheets
  }

  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📄</span>
        <label className="text-sm font-medium text-gray-700">
          Select Sheet
        </label>
        <span className="text-xs text-gray-500">
          ({sheets.length} sheet{sheets.length > 1 ? 's' : ''} available)
        </span>
      </div>
      <select
        value={currentSheet || sheets[0]}
        onChange={(e) => onSheetChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      >
        {sheets.map((sheet) => (
          <option key={sheet} value={sheet}>
            {sheet}
          </option>
        ))}
      </select>
    </div>
  );
}