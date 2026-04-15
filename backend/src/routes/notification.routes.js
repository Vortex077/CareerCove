const express = require('express');
const { authenticate } = require('../middlewares/auth');
const NotificationController = require('../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.patch('/:id/read', NotificationController.markAsRead);

module.exports = router;
