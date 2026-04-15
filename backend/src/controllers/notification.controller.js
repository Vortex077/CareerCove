const NotificationService = require('../services/notification.service');

class NotificationController {
  
  static async getNotifications(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const data = await NotificationService.getUserNotifications(req.user.id, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await NotificationService.markAsRead(id, req.user.id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ success: false, error: 'Unauthorized to read this notification' });
      }
      next(error);
    }
  }
}

module.exports = NotificationController;
