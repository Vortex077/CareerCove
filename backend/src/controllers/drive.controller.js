const DriveService = require('../services/drive.service');
const Helpers = require('../utils/helpers');

class DriveController {
  static async createDrive(req, res, next) {
    try {
      const drive = await DriveService.createDrive(req.body, req.user.id);
      res.status(201).json({ success: true, message: 'Drive Cluster compiled successfully', data: { drive } });
    } catch (error) {
       next(error);
    }
  }

  static async getAllDrives(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20; 
      const { skip } = Helpers.paginate(page, limit);
      
      const { drives, total } = await DriveService.getAllDrives({ skip, limit });

      res.json({ success: true, data: { drives, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async getDriveById(req, res, next) {
    try {
       const drive = await DriveService.getDriveById(req.params.id);
       res.json({ success: true, data: { drive } });
    } catch (error) {
       next(error);
    }
  }
}

module.exports = DriveController;
