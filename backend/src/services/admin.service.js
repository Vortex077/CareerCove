const prisma = require('../config/prisma');

class AdminService {
  static async getDashboardStats() {
    const [
      totalStudents,
      totalJobs,
      totalCompanies,
      totalApplications,
      selectedCount,
      recentJobs,
      recentApplications
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.job.count(),
      prisma.company.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SELECTED' } }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { company: { select: { name: true } } }
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { appliedAt: 'desc' },
        include: {
          student: { include: { user: { select: { fullName: true, email: true } } } },
          job: { include: { company: { select: { name: true } } } }
        }
      })
    ]);

    const placementRate = totalStudents > 0 ? ((selectedCount / totalStudents) * 100).toFixed(1) : '0.0';

    return {
      stats: { totalStudents, totalJobs, totalCompanies, totalApplications, selectedCount, placementRate },
      recentJobs,
      recentApplications
    };
  }
}

module.exports = AdminService;
