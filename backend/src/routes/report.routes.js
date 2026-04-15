const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const ReportController = require('../controllers/report.controller');

const router = express.Router();

router.use(authenticate);

// Bound natively allowing HODs to view metrics implicitly alongside Admins
router.get('/placements', authorize('ADMIN', 'TNP_COORDINATOR', 'HOD'), ReportController.getPlacementReport);
router.get('/companies', authorize('ADMIN', 'TNP_COORDINATOR'), ReportController.getCompanyReport);

module.exports = router;
