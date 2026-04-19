const ReportService = require('../services/report.service');

class ReportController {
  
  static async getPlacementReport(req, res, next) {
    try {
      const { batchYear, department } = req.query;
      const data = await ReportService.getPlacementReport(batchYear, department);
      return res.json({
        success: true,
        message: 'Placement report generated successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyReport(req, res, next) {
    try {
      const data = await ReportService.getCompanyReport();
      return res.json({
        success: true,
        message: 'Company report generated successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
