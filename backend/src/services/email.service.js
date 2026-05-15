const resend = require('../config/email');
const prisma = require('../config/prisma');

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

class EmailService {
  static async sendEmail(to, subject, html, emailType, userId = null) {
    try {
      const { data, error } = await resend.emails.send({
        from: `Placement System <${FROM_EMAIL}>`,
        to,
        subject,
        html
      });

      if (error) throw new Error(error.message);

      // Log success
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

      return data;
    } catch (error) {
      // Log failure
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
          If the button doesn't work, copy and paste this link:<br>
          ${verificationUrl}
        </p>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
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
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(email, 'Password Reset Request', html, 'password_reset');
  }

  static async sendApplicationUpdateEmail(email, studentName, jobTitle, status) {
    const statusColors = {
      SHORTLISTED: '#7C3AED',
      INTERVIEW_SCHEDULED: '#0891B2',
      SELECTED: '#059669',
      REJECTED: '#DC2626',
    };
    const color = statusColors[status] || '#14B8A6';
    const readableStatus = status.replace(/_/g, ' ');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 24px; text-align: center;">
          <h2 style="color: #14B8A6; margin: 0;">CareerCove</h2>
          <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Placement Management System</p>
        </div>
        <div style="padding: 32px;">
          <h3 style="color: #0f172a; margin: 0 0 16px;">Application Status Update</h3>
          <p style="color: #475569;">Hi <strong>${studentName}</strong>,</p>
          <p style="color: #475569;">Your application for <strong>${jobTitle}</strong> has been updated.</p>
          <div style="background: #f8fafc; border-left: 4px solid ${color}; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #64748b;">New Status</p>
            <p style="margin: 4px 0 0; font-size: 20px; font-weight: 700; color: ${color};">${readableStatus}</p>
          </div>
          <p style="color: #475569;">Login to your dashboard to view more details.</p>
          <a href="${process.env.CLIENT_URL}/student/applications" 
             style="display: inline-block; padding: 12px 28px; background-color: #14B8A6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0; font-weight: 600;">
            View My Applications
          </a>
        </div>
        <div style="background: #f8fafc; padding: 16px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message from CareerCove. Please do not reply.</p>
        </div>
      </div>
    `;

    return this.sendEmail(email, `Application Update: ${readableStatus} — ${jobTitle}`, html, 'application_update');
  }

  static async sendNewJobNotification(email, studentName, jobTitle, companyName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14B8A6;">New Job Opportunity!</h2>
        <p>Hi ${studentName},</p>
        <p>A new job opportunity has been posted:</p>
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
