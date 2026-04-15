const prisma = require('../config/prisma');

class ReportService {
  /**
   * Complex analytics block querying students bounded by current placements
   */
  static async getPlacementReport(batchYear, department) {
    const where = {};
    if (batchYear) where.batchYear = parseInt(batchYear, 10);
    if (department) where.department = department;

    try {
      // Pull all matching profiles including their associated User structure and matching SELECT statuses
      const profiles = await prisma.studentProfile.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
          student: {
             include: {
                applications: {
                   where: { status: 'SELECTED' },
                   include: {
                      job: {
                         include: { company: true }
                      }
                   }
                }
             }
          }
        }
      });

      // Filter and compute maps
      const placed = profiles.filter(p => p.student && p.student.applications.length > 0);
      const unplaced = profiles.filter(p => !p.student || p.student.applications.length === 0);

      // Dept aggregate map
      const departmentStats = {};
      profiles.forEach(p => {
        if (!departmentStats[p.department]) {
          departmentStats[p.department] = { total: 0, placed: 0 };
        }
        departmentStats[p.department].total++;
        if (p.student && p.student.applications.length > 0) {
          departmentStats[p.department].placed++;
        }
      });

      // Flatten placed students safely addressing edge-cases of missing User relationships bounds or duplicates
      const placedStudentsFlat = [];
      placed.forEach(p => {
        p.student.applications.forEach(app => {
          placedStudentsFlat.push({
             name: p.user?.fullName || 'Unknown User',
             email: p.user?.email || 'N/A',
             enrollmentNo: p.enrollmentNumber,
             department: p.department,
             batchYear: p.batchYear,
             cgpa: p.cgpa ? parseFloat(p.cgpa).toString() : 'N/A',
             company: app.job.company.name,
             position: app.job.title,
             dateSelected: app.updatedAt
          });
        });
      });

      return {
        totalStudents: profiles.length,
        totalPlaced: placed.length,
        totalUnplaced: unplaced.length,
        placementPercentage: profiles.length > 0 ? ((placed.length / profiles.length) * 100).toFixed(1) : '0.0',
        departmentWise: departmentStats,
        placedStudents: placedStudentsFlat
      };
      
    } catch (err) {
      console.error('Error computing placement reports', err);
      throw err;
    }
  }

  /**
   * Aggregate reports per company utilizing explicit _count hooks for performance
   */
  static async getCompanyReport() {
    const companies = await prisma.company.findMany({
      include: {
        jobs: {
          include: {
            _count: { select: { applications: true } },
            applications: {
              where: { status: 'SELECTED' },
              select: { studentId: true } // Map distinct limits to avoid massive payload bursts
            }
          }
        }
      }
    });

    return companies.map(c => ({
       name: c.name,
       industry: c.industry,
       totalJobsPosted: c.jobs.length,
       totalApplicationsGathered: c.jobs.reduce((sum, j) => sum + j._count.applications, 0),
       totalSelectedStudents: c.jobs.reduce((sum, j) => sum + j.applications.length, 0)
    }));
  }
}

module.exports = ReportService;
