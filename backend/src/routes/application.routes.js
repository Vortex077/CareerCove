const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const ApplicationController = require('../controllers/application.controller');
const { updateApplicationStatusValidation } = require('../utils/validators');
const { validate } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

const router = express.Router();

router.use(authenticate);

// Student interacting with jobs
router.post('/:jobId', authorize('STUDENT'), ApplicationController.applyToJob);
router.post('/:jobId/offer-letter', authorize('STUDENT'), upload.single('offerLetter'), ApplicationController.uploadOfferLetter);
router.get('/my/all', authorize('STUDENT'), ApplicationController.getMyApplications);

// Admin evaluating applications
router.get('/all', authorize('ADMIN', 'TNP_COORDINATOR'), ApplicationController.getAllApplications);
router.get('/job/:jobId', authorize('ADMIN', 'TNP_COORDINATOR'), ApplicationController.getApplicationsByJob);
router.patch('/:studentId/:jobId/status', authorize('ADMIN', 'TNP_COORDINATOR'), updateApplicationStatusValidation, validate, ApplicationController.updateApplicationStatus);

module.exports = router;
