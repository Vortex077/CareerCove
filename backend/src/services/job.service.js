const prisma = require('../config/prisma');

class JobService {

  static async createJob(data) {
    return prisma.job.create({
      data: {
        title: data.title,
        shortDescription: data.shortDescription,
        jobType: data.jobType || 'FULL_TIME',
        location: data.location,
        packageInfo: data.packageInfo,
        minCgpa: data.minCgpa ? parseFloat(data.minCgpa) : null,
        maxBacklogs: data.maxBacklogs != null && data.maxBacklogs !== '' ? parseInt(data.maxBacklogs, 10) : 0,
        applicationDeadline: new Date(data.applicationDeadline),
        status: data.status || 'published',
        publishedAt: new Date(),
        companyId: parseInt(data.companyId, 10),
        driveId: data.driveId ? parseInt(data.driveId, 10) : null,
        postedBy: data.postedBy,
        allowedDepartments: data.allowedDepartments || [],
        allowedYears: data.allowedYears ? data.allowedYears.map(Number) : [],
        requiredSkills: data.requiredSkills || [],
        duration: data.duration || null,
      },
      include: { company: true, drive: true }
    });
  }

  static async updateJob(id, data) {
    return prisma.job.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.jobType && { jobType: data.jobType }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.packageInfo !== undefined && { packageInfo: data.packageInfo }),
        ...(data.minCgpa !== undefined && { minCgpa: data.minCgpa ? parseFloat(data.minCgpa) : null }),
        ...(data.maxBacklogs !== undefined && { maxBacklogs: data.maxBacklogs !== '' ? parseInt(data.maxBacklogs, 10) : 0 }),
        ...(data.applicationDeadline && { applicationDeadline: new Date(data.applicationDeadline) }),
        ...(data.status && { status: data.status }),
        ...(data.driveId !== undefined && { driveId: data.driveId ? parseInt(data.driveId, 10) : null }),
        ...(data.allowedDepartments && { allowedDepartments: data.allowedDepartments }),
        ...(data.requiredSkills && { requiredSkills: data.requiredSkills }),
        ...(data.duration !== undefined && { duration: data.duration }),
      },
      include: { company: true, drive: true }
    });
  }

  static async deleteJob(id) {
    return prisma.job.update({ 
      where: { id: parseInt(id, 10) },
      data: { isActive: false }
    });
  }

  static async getAllJobsAdmin({ skip, limit, search, companyId }) {
    const where = { isActive: true };
    if (companyId) where.companyId = parseInt(companyId, 10);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          drive: true,
          _count: { select: { applications: true } }
        }
      }),
      prisma.job.count({ where })
    ]);

    return { jobs, total };
  }

  static async getJobById(id) {
    return prisma.job.findUnique({
      where: { id: parseInt(id, 10) },
      include: { company: true, drive: true }
    });
  }

  static async getActiveJobs({ skip, limit, search }) {
    const where = {
      status: 'published',
      isActive: true,
      applicationDeadline: { gt: new Date() }
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where, skip, take: limit,
        orderBy: { publishedAt: 'desc' },
        include: { company: true }
      }),
      prisma.job.count({ where })
    ]);

    return { jobs, total };
  }
}

module.exports = JobService;
