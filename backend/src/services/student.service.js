const prisma = require('../config/prisma');

class StudentService {
  /**
   * Get student profile with nested user info
   */
  static async getStudentById(userId) {
    return prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            isActive: true,
          }
        }
      }
    });
  }

  /**
   * Update student profile fields
   */
  static async updateProfile(userId, updateData) {
    // Only extract fields belonging to StudentProfile that are allowed to be updated directly
    const allowedFields = [
      'phone', 'cgpa', 'percentage', 'activeBacklogs', 
      'skills', 'programmingLanguages', 'linkedinUrl', 
      'githubUrl', 'portfolioUrl', 'resumeUrl'
    ];

    const data = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        data[key] = updateData[key];
      }
    }

    return prisma.studentProfile.update({
      where: { userId },
      data,
      include: {
        user: { select: { fullName: true, email: true } }
      }
    });
  }

  /**
   * Get all students with pagination and filters (for admin)
   */
  static async getAllStudents({ skip, limit, department, batchYear, search }) {
    const where = {};

    if (department) where.department = department;
    if (batchYear) where.batchYear = parseInt(batchYear, 10);
    if (search) {
      where.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { fullName: true, email: true, isActive: true } }
        },
        orderBy: {
          user: { fullName: 'asc' }
        }
      }),
      prisma.studentProfile.count({ where })
    ]);

    return { students, total };
  }
}

module.exports = StudentService;
