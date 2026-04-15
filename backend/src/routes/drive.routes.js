const express = require('express');
const router = express.Router();
const driveController = require('../controllers/drive.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// T&P / Admin Specific Drive Management
router.post('/', authenticate, authorize('ADMIN', 'TNP_COORDINATOR'), driveController.createDrive);

// Note: Students might need to 'see' drives eventually, so getting drives can be open to all authenticated roles
router.get('/', authenticate, driveController.getAllDrives);
router.get('/:id', authenticate, driveController.getDriveById);

module.exports = router;
