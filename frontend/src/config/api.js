export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  TIMEOUT: 30000,
  ENDPOINTS: {
    COLUMN_VALIDATOR: '/column-validator',
  }
};