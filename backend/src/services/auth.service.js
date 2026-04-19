const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const JWTUtil = require('../utils/jwt');
const Helpers = require('../utils/helpers');

class AuthService {
  static async register(userData) {
    const { email, password, fullName, role, enrollmentNumber, department, batchYear, currentYear, currentSemester } = userData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = Helpers.generateToken();

    // Create user and profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role,
          verificationToken,
        }
      });

      // If student, create profile
      if (role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            enrollmentNumber,
            department,
            batchYear: parseInt(batchYear),
            currentYear: parseInt(currentYear) || 1,
            currentSemester: parseInt(currentSemester) || 1,
          }
        });
      }

      return newUser;
    });

    return { user, verificationToken };
  }

  static async login(email, password) {
    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if verified
    // if (!user.isVerified) {
    //  throw new Error('Please verify your email first');
    // }

    // Check if active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate tokens
    const accessToken = JWTUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = JWTUtil.generateRefreshToken({
      userId: user.id
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return {
      user: Helpers.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  static async verifyEmail(token) {
    const user = await prisma.user.update({
      where: { verificationToken: token },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    return user;
  }

  static async requestPasswordReset(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, reset link will be sent' };
    }

    const resetToken = Helpers.generateToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    return { resetToken, email: user.email };
  }

  static async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return user;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new Error('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
    
    return true;
  }

  static async refreshToken(refreshToken) {
    // Verify token
    const payload = JWTUtil.verifyRefreshToken(refreshToken);

    // Check if token exists and not revoked
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true
      }
    });

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new access token
    const accessToken = JWTUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  }

  static async logout(refreshToken) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });
    }
  }

  static async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true
      },
    });

    return user;
  }
}

module.exports = AuthService;
