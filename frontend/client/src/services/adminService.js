import api from '../config/api';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Applications
  getApplicationsByJob: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (studentId, jobId, status) =>
    api.patch(`/applications/${studentId}/${jobId}/status`, { status }),

  // Reports
  getPlacementReport: (params) => api.get('/reports/placements', { params }),
  getCompanyReport: () => api.get('/reports/companies'),

  // Notifications
  getNotifications: () => api.get('/notifications'),
};

export default adminService;
