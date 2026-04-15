const prisma = require('../config/prisma');

class DriveService {
  /**
   * Create a new placement drive cluster
   */
  static async createDrive(data, userId) {
    return prisma.placementDrive.create({
      data: {
        title: data.title,
        description: data.description,
        driveType: data.driveType || 'FULL_TIME',
        academicYear: data.academicYear,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'UPCOMING',
        createdBy: userId
      }
    });
  }

  /**
   * Get all placement drives with job counts
   */
  static async getAllDrives({ skip, limit }) {
    const [drives, total] = await Promise.all([
      prisma.placementDrive.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          jobs: { select: { id: true, title: true, company: { select: { name: true } } } },
          createdByUser: { select: { fullName: true } }
        }
      }),
      prisma.placementDrive.count()
    ]);

    return { drives, total };
  }

  /**
   * Retrieve a specific drive details via ID
   */
  static async getDriveById(id) {
    const drive = await prisma.placementDrive.findUnique({
      where: { id: parseInt(id) },
      include: {
        jobs: {
          include: { company: true }
        }
      }
    });
    if (!drive) throw new Error('Drive not found');
    return drive;
  }
}

module.exports = DriveService;
