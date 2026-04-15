const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');
const StudentController = require('../controllers/student.controller');
const { updateProfileValidation } = require('../utils/validators');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// Student profile management
router.get('/profile', authorize('STUDENT'), StudentController.getProfile);
router.put('/profile', authorize('STUDENT'), updateProfileValidation, validate, StudentController.updateProfile);
router.post('/resume', authorize('STUDENT'), upload.single('resume'), StudentController.uploadResume);

// Admin routes
router.get('/', authorize('ADMIN', 'TNP_COORDINATOR'), StudentController.getAllStudents);

module.exports = router;
