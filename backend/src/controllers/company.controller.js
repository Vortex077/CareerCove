const CompanyService = require('../services/company.service');
const Helpers = require('../utils/helpers');

const { uploadToSupabase } = require('../services/file.service');

class CompanyController {
  
  static async createCompany(req, res, next) {
    try {
      let logoUrl = null;
      if (req.file) {
        // Upload to company_logos bucket with a unique prefix
        logoUrl = await uploadToSupabase(req.file, 'company_logos', `company-${Date.now()}`);
      }
      const companyData = { ...req.body, addedBy: req.user.id };
      if (logoUrl) companyData.logoUrl = logoUrl;

      const company = await CompanyService.createCompany(companyData);
      res.status(201).json({ success: true, message: 'Company created successfully', data: { company } });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCompanies(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { skip } = Helpers.paginate(page, limit);
      
      const { companies, total } = await CompanyService.getAllCompanies({ skip, limit, search: req.query.search });

      res.json({ success: true, data: { companies, total, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyById(req, res, next) {
    try {
       const company = await CompanyService.getCompanyById(parseInt(req.params.id, 10));
       if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
       res.json({ success: true, data: { company } });
    } catch (error) {
       next(error);
    }
  }

  static async deleteCompany(req, res, next) {
    try {
      await CompanyService.deleteCompany(parseInt(req.params.id, 10));
      res.json({ success: true, message: 'Company removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompanyController;
