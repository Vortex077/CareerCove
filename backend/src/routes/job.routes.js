const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const JobController = require('../controllers/job.controller');

const router = express.Router();
router.use(authenticate);

// T&P / Admin only
router.post('/', authorize('ADMIN', 'TNP_COORDINATOR'), JobController.createJob);
router.put('/:id', authorize('ADMIN', 'TNP_COORDINATOR'), JobController.updateJob);
router.delete('/:id', authorize('ADMIN', 'TNP_COORDINATOR'), JobController.deleteJob);
router.get('/admin', authorize('ADMIN', 'TNP_COORDINATOR', 'HOD'), JobController.getAllJobsAdmin);

// All authenticated users
router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);

module.exports = router;
