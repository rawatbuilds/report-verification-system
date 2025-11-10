import React from 'react';

export const LoadingSpinner = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-700 font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};