const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const CompanyController = require('../controllers/company.controller');
const { createCompanyValidation } = require('../utils/validators');
const { validate } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

const router = express.Router();

router.use(authenticate);

// Global view
router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);

// Admin / Coordinator bound creations
router.post('/', authorize('ADMIN', 'TNP_COORDINATOR'), upload.single('logo'), createCompanyValidation, validate, CompanyController.createCompany);
router.delete('/:id', authorize('ADMIN', 'TNP_COORDINATOR'), CompanyController.deleteCompany);

module.exports = router;
