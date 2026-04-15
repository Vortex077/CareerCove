const StudentService = require('../services/student.service');
const { uploadToSupabase } = require('../services/file.service');
const Helpers = require('../utils/helpers');

class StudentController {
  
  static async getProfile(req, res, next) {
    try {
      const student = await StudentService.getStudentById(req.user.id);
      if (!student) {
        return res.status(404).json({ success: false, error: 'Student profile not found' });
      }
      res.json({ success: true, data: { student } });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const student = await StudentService.updateProfile(req.user.id, req.body);
      res.json({ success: true, message: 'Profile updated successfully', data: { student } });
    } catch (error) {
      next(error);
    }
  }

  static async uploadResume(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      // Buffer approach isn't available with typical diskStorage multer, passing req.file path natively.
      const resumeUrl = await uploadToSupabase(req.file, 'resumes', `student-${req.user.id}`);
      
      const student = await StudentService.updateProfile(req.user.id, { resumeUrl });
      res.json({ success: true, message: 'Resume uploaded successfully', data: { student } });
    } catch (error) {
      next(error);
    }
  }

  static async getAllStudents(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { skip } = Helpers.paginate(page, limit);
      
      const { department, batchYear, search } = req.query;

      const { students, total } = await StudentService.getAllStudents({
        skip,
        limit,
        department,
        batchYear,
        search,
      });

      res.json({ success: true, data: { students, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentController;
