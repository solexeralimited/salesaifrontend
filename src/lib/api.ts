import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_URL, withCredentials: false });

// Attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('salesai_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('salesai_token');
      localStorage.removeItem('salesai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: Record<string, string>) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ── Leads ─────────────────────────────────────────────────────────────────────
export const leadsApi = {
  list: (params?: Record<string, string>) => api.get('/leads', { params }),
  get: (id: string) => api.get(`/leads/${id}`),
  create: (data: Record<string, unknown>) => api.post('/leads', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  importCsv: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/leads/import/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Conversations ─────────────────────────────────────────────────────────────
export const conversationsApi = {
  list: (params?: Record<string, string>) => api.get('/conversations', { params }),
  messages: (id: string) => api.get(`/conversations/${id}/messages`),
  sendMessage: (id: string, content: string, channel?: string) =>
    api.post(`/conversations/${id}/messages`, { content, channel }),
  aiReply: (id: string) => api.post(`/conversations/${id}/ai-reply`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/conversations/${id}`, data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  leadsByWeek: () => api.get('/analytics/leads-by-week'),
  stageFunnel: () => api.get('/analytics/stage-funnel'),
  channelPerformance: () => api.get('/analytics/channel-performance'),
  conversionRate: () => api.get('/analytics/conversion-rate'),
};

// ── Calendar ──────────────────────────────────────────────────────────────────
export const calendarApi = {
  meetings: (from?: string, to?: string) => api.get('/calendar/meetings', { params: { from, to } }),
  book: (data: Record<string, unknown>) => api.post('/calendar/meetings', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/calendar/meetings/${id}`, data),
};

// ── Knowledge Base ────────────────────────────────────────────────────────────
export const kbApi = {
  list: (params?: Record<string, string>) => api.get('/knowledge-base', { params }),
  categories: () => api.get('/knowledge-base/categories'),
  create: (data: Record<string, unknown>) => api.post('/knowledge-base', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/knowledge-base/${id}`, data),
  delete: (id: string) => api.delete(`/knowledge-base/${id}`),
};

// ── Workflows ─────────────────────────────────────────────────────────────────
export const workflowsApi = {
  list: () => api.get('/workflows'),
  get: (id: string) => api.get(`/workflows/${id}`),
  create: (data: Record<string, unknown>) => api.post('/workflows', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/workflows/${id}`, data),
  delete: (id: string) => api.delete(`/workflows/${id}`),
};

// ── Company ───────────────────────────────────────────────────────────────────
export const companyApi = {
  get: () => api.get('/companies/me'),
  update: (data: Record<string, unknown>) => api.patch('/companies/me', data),
  users: () => api.get('/companies/users'),
};
