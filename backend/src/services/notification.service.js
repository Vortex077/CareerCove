const prisma = require('../config/prisma');

class NotificationService {
  /**
   * Insert a new notification
   */
  static async createNotification({ userId, type, title, message }) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          isRead: false
        }
      });
    } catch (err) {
      console.error('Failed to create notification', err);
      return null;
    }
  }

  /**
   * Batch notify eligible students (e.g., when a Job is posted)
   */
  static async notifyNewJob(job) {
    // Collect specific bounds dynamically
    const where = {};
    if (job.minCgpa) where.cgpa = { gte: parseFloat(job.minCgpa) };
    if (job.maxActiveBacklogs !== null) where.activeBacklogs = { lte: parseInt(job.maxActiveBacklogs, 10) };

    try {
      const eligibleProfiles = await prisma.studentProfile.findMany({
        where,
        select: { userId: true }
      });

      if (eligibleProfiles.length === 0) return;

      const payload = eligibleProfiles.map(p => ({
        userId: p.userId,
        type: 'NEW_OPPORTUNITY',
        title: 'New Job Opportunity',
        message: `${job.title} is now taking applications!`,
        isRead: false
      }));

      await prisma.notification.createMany({
        data: payload,
        skipDuplicates: true
      });
    } catch (error) {
      console.error('Failed batch notification bounds', error);
    }
  }

  /**
   * Fetch paginated notifications uniquely paired to context user
   */
  static async getUserNotifications(userId, limit = 20) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return { notifications, unreadCount };
  }

  /**
   * Flag notification cleanly
   */
  static async markAsRead(notificationId, userId) {
    const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif || notif.userId !== userId) throw new Error('Unauthorized or Not Found');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }
}

module.exports = NotificationService;
