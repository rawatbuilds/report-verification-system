import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const reportService = {
  uploadReference: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post(
      `${API_CONFIG.ENDPOINTS.COLUMN_VALIDATOR}/upload-reference/`,
      formData
    );
    
    return data;
  },

  compareReports: async (referenceFile, currentFile) => {
    const formData = new FormData();
    formData.append('reference', referenceFile);
    formData.append('current', currentFile);
    
    const { data } = await api.post(
      `${API_CONFIG.ENDPOINTS.COLUMN_VALIDATOR}/compare-reports/`,
      formData
    );
    
    return data;
  }
};