const jwt = require('jsonwebtoken');

class JWTUtil {
  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
  }

  static generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}

module.exports = JWTUtil;
