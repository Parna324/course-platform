import jwt from 'jsonwebtoken';
import { User } from '../model/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { env } from '../utils/env.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return ApiResponse.unauthorized('Access token required').send(res);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return ApiResponse.unauthorized('User not found').send(res);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized('Invalid token').send(res);
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized('Token expired').send(res);
    }
    return ApiResponse.serverError('Authentication failed').send(res);
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized('Authentication required').send(res);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        `Access denied. Required role: ${roles.join(' or ')}`
      ).send(res);
    }

    next();
  };
};
