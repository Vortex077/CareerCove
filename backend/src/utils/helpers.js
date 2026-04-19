const crypto = require('crypto');

class Helpers {
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static sanitizeUser(user) {
    // eslint-disable-next-line no-unused-vars
    const { passwordHash, verificationToken, resetToken, ...sanitized } = user;
    return sanitized;
  }

  static checkEligibility(student, job) {
    const checks = {
      cgpa: true,
      backlogs: true,
      department: true,
      year: true,
    };

    if (job.minCgpa && student.cgpa < job.minCgpa) {
      checks.cgpa = false;
    }

    if (job.maxBacklogs !== null && student.activeBacklogs > job.maxBacklogs) {
      checks.backlogs = false;
    }

    if (job.allowedDepartments.length > 0 && 
        !job.allowedDepartments.includes(student.department) &&
        !job.allowedDepartments.includes('ALL')) {
      checks.department = false;
    }

    if (job.allowedYears.length > 0 && 
        !job.allowedYears.includes(student.currentYear)) {
      checks.year = false;
    }

    const isEligible = Object.values(checks).every(check => check);

    return { isEligible, checks };
  }

  static getEligibilityMessage(checks) {
    const failed = [];
    
    if (!checks.cgpa) failed.push('CGPA requirement not met');
    if (!checks.backlogs) failed.push('Too many backlogs');
    if (!checks.department) failed.push('Department not allowed');
    if (!checks.year) failed.push('Year not eligible');

    return failed.length > 0 ? failed.join(', ') : 'Eligible';
  }

  static paginate(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }
}

module.exports = Helpers;
