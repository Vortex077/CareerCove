const { body } = require('express-validator');

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('role')
    .isIn(['STUDENT', 'ADMIN', 'TNP_COORDINATOR', 'HOD'])
    .withMessage('Valid role is required'),
  // Student-specific fields (conditional)
  body('enrollmentNumber')
    .if(body('role').equals('STUDENT'))
    .trim().notEmpty().withMessage('Enrollment number is required for students'),
  body('department')
    .if(body('role').equals('STUDENT'))
    .trim().notEmpty().withMessage('Department is required for students'),
  body('batchYear')
    .if(body('role').equals('STUDENT'))
    .isInt({ min: 2000, max: 2100 }).withMessage('Valid batch year is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
];

const updateProfileValidation = [
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('cgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('programmingLanguages').optional().isArray().withMessage('Programming languages must be an array'),
  body('linkedinUrl').optional().isURL().withMessage('Valid LinkedIn URL is required'),
  body('githubUrl').optional().isURL().withMessage('Valid GitHub URL is required'),
  body('portfolioUrl').optional().isURL().withMessage('Valid portfolio URL is required'),
];

const createJobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('companyId').isInt({ min: 1 }).withMessage('Valid company ID is required'),
  body('jobType')
    .isIn(['INTERNSHIP', 'FULL_TIME', 'BOTH'])
    .withMessage('Valid job type is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid deadline date is required'),
  body('shortDescription').optional().trim(),
  body('minCgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('maxBacklogs').optional().isInt({ min: 0 }).withMessage('Backlogs must be a non-negative integer'),
  body('allowedDepartments').optional().isArray().withMessage('Departments must be an array'),
  body('allowedYears').optional().isArray().withMessage('Years must be an array'),
  body('requiredSkills').optional().isArray().withMessage('Skills must be an array'),
];

const createCompanyValidation = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('industry').optional().trim(),
  body('website').optional().isURL().withMessage('Valid URL is required'),
  body('hrEmail').optional().isEmail().withMessage('Valid HR email is required'),
  body('hrPhone').optional().trim(),
];

const updateApplicationStatusValidation = [
  body('status')
    .isIn(['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED', 'WITHDRAWN'])
    .withMessage('Invalid application status'),
  body('adminRemarks').optional().trim(),
  body('interviewDate').optional().isISO8601().withMessage('Valid interview date is required'),
];

const createDriveValidation = [
  body('title').trim().notEmpty().withMessage('Drive title is required'),
  body('driveType')
    .isIn(['INTERNSHIP', 'FULL_TIME', 'BOTH'])
    .withMessage('Valid drive type is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  createJobValidation,
  createCompanyValidation,
  updateApplicationStatusValidation,
  createDriveValidation,
};
