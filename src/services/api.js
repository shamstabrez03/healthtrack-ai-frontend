import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('healthtrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('healthtrack_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === Auth ===
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// === Reports ===
export const reportsAPI = {
  upload: (file, patientId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);
    return api.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (patientId, reportType = null) => {
    const params = { patient_id: patientId };
    if (reportType) params.report_type = reportType;
    return api.get('/reports', { params });
  },
  get: (reportId, patientId) =>
    api.get(`/reports/${reportId}`, { params: { patient_id: patientId } }),
  getObservations: (reportId, patientId) =>
    api.get(`/reports/${reportId}/observations`, { params: { patient_id: patientId } }),
  delete: (reportId, patientId) =>
    api.delete(`/reports/${reportId}`, { params: { patient_id: patientId } }),
};

// === Dashboard ===
export const dashboardAPI = {
  get: (patientId) => api.get('/dashboard', { params: { patient_id: patientId } }),
};

// === Trends ===
export const trendsAPI = {
  getAvailableTests: (patientId) =>
    api.get('/trends/available-tests', { params: { patient_id: patientId } }),
  getTrend: (testName, patientId, period = null) => {
    const params = { patient_id: patientId };
    if (period) params.period = period;
    return api.get(`/trends/${encodeURIComponent(testName)}`, { params });
  },
};

// === Family ===
export const familyAPI = {
  list: () => api.get('/family'),
  create: (data) => api.post('/family', data),
  update: (patientId, data) => api.put(`/family/${patientId}`, data),
  delete: (patientId) => api.delete(`/family/${patientId}`),
};

// === Chat ===
export const chatAPI = {
  reportChat: (message, patientId, reportId) =>
    api.post('/chat/report', { message, patient_id: patientId, report_id: reportId }),
  historyChat: (message, patientId) =>
    api.post('/chat/history', { message, patient_id: patientId }),
};

// === Settings ===
export const settingsAPI = {
  getGemini: () => api.get('/settings/gemini'),
  saveGeminiKey: (apiKey, model) =>
    api.post('/settings/gemini-key', { api_key: apiKey, model }),
  removeGeminiKey: () => api.delete('/settings/gemini-key'),
  testGemini: () => api.post('/settings/test-gemini'),
};

// === Guidance & Urgent Alerts ===
export const guidanceAPI = {
  getLatest: (patientId) => api.get('/guidance/latest', { params: { patient_id: patientId } }),
  getForReport: (reportId, patientId) => api.get(`/guidance/report/${reportId}`, { params: { patient_id: patientId } }),
};

export default api;
