import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: inject Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusshare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle unauthorized / suspended session
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
};

export const userService = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getMyHistory: () => api.get('/users/me/history'),
};

export const resourceService = {
  getResources: (params) => api.get('/resources', { params }),
  getResourceById: (id) => api.get(`/resources/${id}`),
  createResource: (data) => api.post('/resources', data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
  withdrawResource: (id) => api.patch(`/resources/${id}/withdraw`),
  getMyListings: () => api.get('/resources/my-listings'),
};

export const borrowService = {
  createRequest: (data) => api.post('/borrow', data),
  getMyRequests: () => api.get('/borrow/my-requests'),
  getIncomingRequests: () => api.get('/borrow/incoming'),
  approveRequest: (id) => api.patch(`/borrow/${id}/approve`),
  rejectRequest: (id, data) => api.patch(`/borrow/${id}/reject`, data),
  cancelRequest: (id) => api.patch(`/borrow/${id}/cancel`),
  collectResource: (id, data) => api.patch(`/borrow/${id}/collect`, data),
  confirmReturn: (id, data) => api.patch(`/borrow/${id}/return`, data),
};

export const ratingService = {
  submitRating: (data) => api.post('/ratings', data),
  getUserRatings: (userId) => api.get(`/ratings/user/${userId}`),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const adminService = {
  getMetrics: () => api.get('/admin/metrics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  verifyUser: (id, isVerified) => api.patch(`/admin/users/${id}/verify`, { isVerified }),
  suspendUser: (id, isSuspended, reason) =>
    api.patch(`/admin/users/${id}/suspend`, { isSuspended, reason }),
  getAllResources: () => api.get('/admin/resources'),
  moderateResource: (id, isModerated, reason) =>
    api.patch(`/admin/resources/${id}/moderate`, { isModerated, moderationReason: reason }),
  getAuditLogs: () => api.get('/admin/audit-logs'),
};

export default api;
