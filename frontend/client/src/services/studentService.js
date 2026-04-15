import api from '../config/api';

export const studentService = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  uploadResume: (formData) =>
    api.post('/students/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Admin
  getAllStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
};

export default studentService;
