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

  static async bulkImportStudents(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'CSV file required' });
      }

      // Multer file buffer reading (if using memoryStorage) or readFile (if using diskStorage)
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(req.file.path);
      
      const result = await AdminService.bulkImportStudents(fileBuffer);
      
      // Clean up local temp file
      fs.unlinkSync(req.file.path);

      res.json({ success: true, message: 'Import completed', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async exportStudents(req, res, next) {
    try {
      const csvString = await AdminService.exportStudents();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students-export.csv');
      
      res.status(200).send(csvString);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
