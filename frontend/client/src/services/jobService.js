import api from '../config/api';

export const jobService = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),

  // Companies
  getAllCompanies: (params) => api.get('/jobs/companies/all', { params }),
  getCompanyById: (id) => api.get(`/jobs/companies/${id}`),
  createCompany: (data) => api.post('/jobs/companies', data),
};

export default jobService;
