const AdminService = require('../services/admin.service');

class AdminController {
  static async getDashboard(req, res, next) {
    try {
      const data = await AdminService.getDashboardStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
