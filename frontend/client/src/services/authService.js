import api from '../config/api';

export const authService = {
  loginStudent: (credentials) => api.post('/auth/login/student', credentials),
  loginStaff: (credentials) => api.post('/auth/login/staff', credentials),
  registerStudent: (data) => api.post('/auth/register/student', data),
  registerStaff: (data) => api.post('/auth/register/staff', data),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

export default authService;
