const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// Admin dashboard
router.get('/dashboard', authenticate, authorize('ADMIN', 'TNP_COORDINATOR', 'HOD'), adminController.getDashboard);

module.exports = router;
