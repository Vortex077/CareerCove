const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');
const EmailService = require('../services/email.service');

class AuthController {
  static async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { user, verificationToken } = await AuthService.register(req.body);

      // Send verification email (async, don't wait)
      EmailService.sendVerificationEmail(user.email, verificationToken)
        .catch(err => console.error('Email send failed:', err));

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify.',
        data: {
          userId: user.id,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { user, accessToken, refreshToken } = await AuthService.login(
        req.body.email,
        req.body.password
      );

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      await AuthService.verifyEmail(req.params.token);

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);

      // Send reset email if token was generated
      if (result.resetToken) {
        EmailService.sendPasswordResetEmail(result.email, result.resetToken)
          .catch(err => console.error('Email send failed:', err));
      }

      res.json({
        success: true,
        message: 'If email exists, password reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      await AuthService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'No refresh token provided'
        });
      }

      const { accessToken } = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
