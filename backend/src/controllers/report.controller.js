const ReportService = require('../services/report.service');
const { successResponse } = require('../utils/helpers');

class ReportController {
  
  static async getPlacementReport(req, res, next) {
    try {
      const { batchYear, department } = req.query;
      const data = await ReportService.getPlacementReport(batchYear, department);
      return successResponse(res, data, 'Placement report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyReport(req, res, next) {
    try {
      const data = await ReportService.getCompanyReport();
      return successResponse(res, data, 'Company report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
