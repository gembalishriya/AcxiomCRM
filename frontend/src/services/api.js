import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acxiomcrm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

export const dashboardApi = {
  summary: () => api.get('/dashboard')
};

export const customerApi = {
  list: (params) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (payload) => api.post('/customers', payload),
  update: (id, payload) => api.put(`/customers/${id}`, payload),
  remove: (id) => api.delete(`/customers/${id}`)
};

export const leadApi = {
  list: (params) => api.get('/leads', { params }),
  get: (id) => api.get(`/leads/${id}`)
};

export const opportunityApi = {
  list: (params) => api.get('/opportunities', { params }),
  get: (id) => api.get(`/opportunities/${id}`),
  create: (payload) => api.post('/opportunities', payload)
};

export const followUpApi = {
  list: (params) => api.get('/followups', { params }),
  create: (payload) => api.post('/followups', payload)
};

export const activityApi = {
  list: (params) => api.get('/activities', { params }),
  create: (payload) => api.post('/activities', payload)
};

export const reportApi = {
  customers: () => api.get('/reports/customers'),
  leads: () => api.get('/reports/leads'),
  followUps: () => api.get('/reports/followups'),
  conversions: () => api.get('/reports/conversions'),
  opportunities: () => api.get('/reports/opportunities'),
  pipeline: () => api.get('/reports/pipeline'),
  users: () => api.get('/reports/users'),
  audit: () => api.get('/reports/audit')
};

export const userApi = {
  list: (params) => api.get('/users', { params }),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  resetPassword: (id, payload) => api.post(`/users/${id}/reset-password`, payload)
};

export default api;
