const prisma = require('../config/prisma');
const Helpers = require('../utils/helpers');
const { sendApplicationUpdateEmail } = require('./email.service');
const NotificationService = require('./notification.service');

class ApplicationService {
  /**
   * Apply student to a job posting
   */
  static async applyToJob(studentId, jobId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) throw new Error('Job not found');

    if (new Date(job.applicationDeadline) < new Date()) {
      throw new Error('Application deadline has passed');
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: { user: true }
    });

    // Run eligibility algorithms
    const { isEligible, checks } = Helpers.checkEligibility(student, job);
    if (!isEligible) {
      throw new Error(`Ineligible: ${Helpers.getEligibilityMessage(checks)}`);
    }

    // Prevent duplicates
    const existing = await prisma.application.findUnique({
      where: {
        studentId_jobId: { studentId, jobId }
      }
    });

    if (existing) {
      throw new Error('You have already applied to this job');
    }

    const application = await prisma.application.create({
      data: {
        studentId,
        jobId,
        resumeUrl: student.resumeUrl,
        eligibilityStatus: 'eligible'
      },
      include: {
        job: {
          include: { company: true }
        }
      }
    });

    return application;
  }

  /**
   * Get applications for a single student profile
   */
  static async getStudentApplications(studentId, { skip, limit }) {
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { studentId },
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            include: { company: true }
          }
        }
      }),
      prisma.application.count({ where: { studentId } })
    ]);

    return { applications, total };
  }

  /**
   * Admin: Get all applications for a specific job
   */
  static async getApplicationsByJob(jobId, { skip, limit, status }) {
    const where = { jobId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          student: {
            include: { user: { select: { fullName: true, email: true } } }
          }
        }
      }),
      prisma.application.count({ where })
    ]);

    return { applications, total };
  }

  /**
   * Admin: Get all applications globally
   */
  static async getAllApplications({ skip, limit, status }) {
    const where = {};
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          student: {
            include: { user: { select: { fullName: true, email: true } } }
          },
          job: {
            include: { company: true }
          }
        }
      }),
      prisma.application.count({ where })
    ]);

    return { applications, total };
  }

  /**
   * Admin: Adjust the status
   */
  static async updateApplicationStatus(studentId, jobId, status, adminRemarks) {
    const app = await prisma.application.update({
      where: {
        studentId_jobId: { studentId, jobId }
      },
      data: { status, adminRemarks },
      include: {
        student: { include: { user: true } },
        job: { include: { company: true } }
      }
    });

    // Attempt pushing emails seamlessly
    try {
      if (['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'].includes(status)) {
        await sendApplicationUpdateEmail(
          app.student.user.email,
          app.student.user.fullName,
          app.job.title,
          status
        );
      }
      
      // Native App Notification
      await NotificationService.createNotification({
        userId: app.student.user.id,
        type: 'STATUS_UPDATE',
        title: 'Application Status Updated',
        message: `Your application status for ${app.job.title} at ${app.job.company.name} is now ${status.replace('_', ' ')}`
      });

    } catch (e) {
      console.error('Email transport failed non-rhythmic task', e);
    }
    
    return app;
  }
}

module.exports = ApplicationService;
