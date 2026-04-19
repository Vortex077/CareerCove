const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const { parse } = require('csv-parse/sync');
const { Parser } = require('json2csv');

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

  static async bulkImportStudents(fileBuffer) {
    const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });
    
    // Hash default password
    const defaultPasswordHash = await bcrypt.hash('CareerCove@123', 12);
    
    let imported = 0;
    let failed = 0;
    const errors = [];

    for (const record of records) {
      try {
        const { email, fullName, enrollmentNumber, department, batchYear } = record;
        if (!email || !fullName || !enrollmentNumber || !department || !batchYear) {
          throw new Error('Missing required fields');
        }

        // Use transaction array to create User and StudentProfile
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              fullName,
              passwordHash: defaultPasswordHash,
              role: 'STUDENT',
              isVerified: true,
            }
          });

          await tx.studentProfile.create({
            data: {
              userId: user.id,
              enrollmentNumber,
              department,
              batchYear: parseInt(batchYear, 10),
              currentYear: 1,
              currentSemester: 1,
            }
          });
        });

        imported++;
      } catch (err) {
        failed++;
        errors.push(`Row ${record.email || 'unknown'} failed: ${err.message}`);
      }
    }

    return { imported, failed, errors };
  }

  static async exportStudents() {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: { select: { fullName: true, email: true, isActive: true } }
      }
    });

    const flatData = students.map(s => ({
      fullName: s.user.fullName,
      email: s.user.email,
      enrollmentNumber: s.enrollmentNumber,
      department: s.department,
      batchYear: s.batchYear,
      cgpa: s.cgpa || '',
      isPlaced: s.isPlaced ? 'Yes' : 'No',
      placementCompany: s.placementCompany || ''
    }));

    const parser = new Parser();
    return parser.parse(flatData);
  }
}

module.exports = AdminService;
