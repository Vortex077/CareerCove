const ApplicationService = require('../services/application.service');
const Helpers = require('../utils/helpers');

class ApplicationController {

  static async applyToJob(req, res, next) {
    try {
      const jobId = parseInt(req.params.jobId, 10);
      const studentId = req.user.id; // User acts as StudentId via relational constraints

      const application = await ApplicationService.applyToJob(studentId, jobId);
      
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: { application }
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('passed') || error.message.includes('Ineligible')) {
         return res.status(400).json({ success: false, error: error.message });
      }
      if (error.message.includes('already applied')) {
         return res.status(409).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  static async getMyApplications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { skip } = Helpers.paginate(page, limit);

      const { applications, total } = await ApplicationService.getStudentApplications(req.user.id, { skip, limit });
      
      res.json({ success: true, data: { applications, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicationsByJob(req, res, next) {
    try {
      const jobId = parseInt(req.params.jobId, 10);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { skip } = Helpers.paginate(page, limit);
      
      const { applications, total } = await ApplicationService.getApplicationsByJob(jobId, { skip, limit, status: req.query.status });
      
      res.json({ success: true, data: { applications, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async getAllApplications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { skip } = Helpers.paginate(page, limit);
      
      const { applications, total } = await ApplicationService.getAllApplications({ skip, limit, status: req.query.status });
      
      res.json({ success: true, data: { applications, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async updateApplicationStatus(req, res, next) {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      const jobId = parseInt(req.params.jobId, 10);
      const { status, adminRemarks } = req.body;

      const application = await ApplicationService.updateApplicationStatus(studentId, jobId, status, adminRemarks);
      res.json({ success: true, message: 'Application status updated', data: { application } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ApplicationController;
