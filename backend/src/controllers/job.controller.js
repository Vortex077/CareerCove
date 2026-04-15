const JobService = require('../services/job.service');
const NotificationService = require('../services/notification.service');
const Helpers = require('../utils/helpers');

class JobController {

  static async createJob(req, res, next) {
    try {
      const job = await JobService.createJob({ ...req.body, postedBy: req.user.id });
      NotificationService.notifyNewJob(job).catch(err => console.error('Notify error:', err));
      res.status(201).json({ success: true, message: 'Job created successfully', data: { job } });
    } catch (error) {
      next(error);
    }
  }

  static async updateJob(req, res, next) {
    try {
      const job = await JobService.updateJob(req.params.id, req.body);
      res.json({ success: true, message: 'Job updated successfully', data: { job } });
    } catch (error) {
      next(error);
    }
  }

  static async deleteJob(req, res, next) {
    try {
      await JobService.deleteJob(req.params.id);
      res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getAllJobsAdmin(req, res, next) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { skip } = Helpers.paginate(page, limit);
      const { jobs, total } = await JobService.getAllJobsAdmin({
        skip, limit,
        search:    req.query.search,
        companyId: req.query.companyId
      });
      res.json({ success: true, data: { jobs, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async getAllJobs(req, res, next) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { skip } = Helpers.paginate(page, limit);
      const { jobs, total } = await JobService.getActiveJobs({ skip, limit, search: req.query.search });
      res.json({ success: true, data: { jobs, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async getJobById(req, res, next) {
    try {
      const job = await JobService.getJobById(req.params.id);
      if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
      res.json({ success: true, data: { job } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobController;
