const transporter = require('../config/email');
const prisma = require('../config/prisma');

class EmailService {
  static async sendEmail(to, subject, html, emailType, userId = null) {
    try {
      const info = await transporter.sendMail({
        from: `"Placement System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });

      // Log email
      await prisma.emailLog.create({
        data: {
          userId,
          toEmail: to,
          subject,
          emailType,
          status: 'sent',
          sentAt: new Date()
        }
      });

      return info;
    } catch (error) {
      // Log failed email
      await prisma.emailLog.create({
        data: {
          userId,
          toEmail: to,
          subject,
          emailType,
          status: 'failed',
          errorMessage: error.message
        }
      });

      throw error;
    }
  }

  static async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14B8A6;">Verify Your Email</h2>
        <p>Thank you for registering with our Placement Management System.</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #14B8A6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${verificationUrl}
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `;

    return this.sendEmail(email, 'Verify Your Email', html, 'verification');
  }

  static async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14B8A6;">Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #14B8A6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${resetUrl}
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail(email, 'Password Reset Request', html, 'password_reset');
  }

  static async sendApplicationUpdateEmail(email, studentName, jobTitle, status) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14B8A6;">Application Status Update</h2>
        <p>Hi ${studentName},</p>
        <p>Your application status for <strong>${jobTitle}</strong> has been updated.</p>
        <p>New Status: <strong style="color: #14B8A6;">${status}</strong></p>
        <p>Login to your dashboard to view more details.</p>
        <a href="${process.env.CLIENT_URL}/student/applications" 
           style="display: inline-block; padding: 12px 24px; background-color: #14B8A6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Applications
        </a>
      </div>
    `;

    return this.sendEmail(email, 'Application Status Update', html, 'application_update');
  }

  static async sendNewJobNotification(email, studentName, jobTitle, companyName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14B8A6;">New Job Opportunity!</h2>
        <p>Hi ${studentName},</p>
        <p>A new job opportunity has been posted that matches your profile:</p>
        <h3>${jobTitle}</h3>
        <p><strong>Company:</strong> ${companyName}</p>
        <a href="${process.env.CLIENT_URL}/student/jobs" 
           style="display: inline-block; padding: 12px 24px; background-color: #14B8A6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Job Details
        </a>
      </div>
    `;

    return this.sendEmail(email, `New Job: ${jobTitle}`, html, 'new_job');
  }
}

module.exports = EmailService;
