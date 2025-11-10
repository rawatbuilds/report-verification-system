export const SUPPORTED_FILE_TYPES = {
  CSV: '.csv',
  XLSX: '.xlsx',
  XLS: '.xls'
};

export const SUPPORTED_FILE_TYPES_STRING = Object.values(SUPPORTED_FILE_TYPES).join(',');

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ERROR_TYPES = {
  MISSING: 'missing',
  EXTRA: 'extra',
  SEQUENCE: 'sequence',
  CASE: 'case'
};

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: `Only ${SUPPORTED_FILE_TYPES_STRING} files are supported`,
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  COMPARE_FAILED: 'Failed to compare reports. Please try again.',
  NO_REFERENCE: 'Please upload a reference file first.',
  NO_REPORT: 'Please select a report to verify.',
};