import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

export const listingsAPI = {
  create: (listingData) => api.post('/listings', listingData),
  getAll: () => api.get('/listings'),
  updateStatus: (id, status) => api.patch(`/listings/${id}/status`, { status }),
};

export const matchesAPI = {
  respond: (matchId, action, reason) => api.post(`/matches/${matchId}/respond`, { action, reason }),
};

export const shelterAPI = {
  getDashboard: () => api.get('/shelters/dashboard'),
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: () => api.get('/admin/users'),
};

export default api;
