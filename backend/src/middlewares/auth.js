const JWTUtil = require('../utils/jwt');
const prisma = require('../config/prisma');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = JWTUtil.verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        error: 'Email not verified'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      error: error.message || 'Invalid or expired token'
    });
  }
};

module.exports = { authenticate };
