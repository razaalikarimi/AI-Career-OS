import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject access token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefresh);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API Service Methods ─────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const resumeAPI = {
  upload: (formData) =>
    api.post('/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/resumes', { params }),
  getById: (id) => api.get(`/resumes/${id}`),
  analyze: (id, data) => api.post(`/resumes/${id}/analyze`, data),
  getSkillGap: (params) => api.get('/resumes/skill-gap', { params }),
  delete: (id) => api.delete(`/resumes/${id}`),
};

export const jobAPI = {
  search: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  getMatches: () => api.get('/jobs/matches'),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getApplications: (params) => api.get('/jobs/applications', { params }),
};

export const interviewAPI = {
  createSession: (data) => api.post('/interviews/sessions', data),
  getSessions: (params) => api.get('/interviews/sessions', { params }),
  getSession: (id) => api.get(`/interviews/sessions/${id}`),
  submitAnswer: (sessionId, data) => api.post(`/interviews/sessions/${sessionId}/answers`, data),
  completeSession: (id) => api.post(`/interviews/sessions/${id}/complete`),
  getFeedback: (id) => api.get(`/interviews/sessions/${id}/feedback`),
};

export const learningAPI = {
  generatePlan: (data) => api.post('/learning/plans', data),
  getPlans: (params) => api.get('/learning/plans', { params }),
  getPlan: (id) => api.get(`/learning/plans/${id}`),
  updateProgress: (planId, phase, data) =>
    api.patch(`/learning/plans/${planId}/phases/${phase}`, data),
  getAnalytics: () => api.get('/learning/analytics'),
};

export default api;
