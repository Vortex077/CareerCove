const prisma = require('../config/prisma');

class CompanyService {
  /**
   * Create a new company
   */
  static async createCompany(data) {
    return prisma.company.create({
      data: {
        name: data.name,
        industry: data.industry,
        website: data.website,
        description: data.description,
        logoUrl: data.logoUrl
      }
    });
  }

  /**
   * Get all companies with basic search and pagination
   */
  static async getAllCompanies({ skip, limit, search }) {
    const where = { isActive: true };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company.count({ where })
    ]);

    return { companies, total };
  }

  /**
   * Get single company by ID
   */
  static async getCompanyById(id) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        jobs: true
      }
    });
  }

  /**
   * Soft delete a company
   */
  static async deleteCompany(id) {
    return prisma.company.update({
      where: { id },
      data: { isActive: false }
    });
  }
}

module.exports = CompanyService;
