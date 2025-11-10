import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES, ERROR_MESSAGES } from '../constants/fileTypes';

export const validateFileSize = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
  }
  return true;
};

export const validateFileType = (file) => {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  const validTypes = Object.values(SUPPORTED_FILE_TYPES);
  
  if (!validTypes.includes(extension)) {
    throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
  return true;
};

export const validateFile = (file) => {
  validateFileSize(file);
  validateFileType(file);
  return true;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};