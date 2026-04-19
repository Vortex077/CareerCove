const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('role').isIn(['STUDENT', 'ADMIN', 'TNP_COORDINATOR', 'HOD']),
  body('enrollmentNumber').if(body('role').equals('STUDENT')).notEmpty(),
  body('department').if(body('role').equals('STUDENT')).notEmpty(),
  body('batchYear').if(body('role').equals('STUDENT')).isInt({ min: 2020, max: 2030 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const resetPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

// Routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.get('/verify/:token', AuthController.verifyEmail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, AuthController.resetPassword);
router.post('/change-password', authenticate, changePasswordValidation, AuthController.changePassword);
router.get('/me', authenticate, AuthController.getCurrentUser);

module.exports = router;
