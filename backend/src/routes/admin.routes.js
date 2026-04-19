const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

// Admin dashboard
router.get('/dashboard', authenticate, authorize('ADMIN', 'TNP_COORDINATOR', 'HOD'), adminController.getDashboard);

// Bulk Import & Export
router.post('/students/import', authenticate, authorize('ADMIN', 'TNP_COORDINATOR'), upload.single('file'), adminController.bulkImportStudents);
router.get('/students/export', authenticate, authorize('ADMIN', 'TNP_COORDINATOR', 'HOD'), adminController.exportStudents);

module.exports = router;
