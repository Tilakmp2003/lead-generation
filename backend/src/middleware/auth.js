const supabase = require('../config/supabase');
const errorHandler = require('../utils/errorHandler');

/**
 * Protect routes - require authentication using Supabase
 * In development mode, authentication is bypassed
 */
exports.protect = async (req, res, next) => {
  // For development/testing purposes, bypass authentication
  // This is a temporary solution for development only
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Authentication bypassed');
    // Set a mock user for development
    req.user = {
      id: 'dev-user',
      email: 'dev@example.com',
      role: 'user'
    };
    return next();
  }

  // In production, verify authentication
  try {
    let token;

    // Check if auth header exists and starts with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      throw errorHandler.unauthorized('Not authorized to access this route');
    }

    try {
      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw errorHandler.unauthorized('Not authorized to access this route');
      }

      // Add user to request object
      req.user = data.user;
      next();
    } catch (err) {
      console.error('Auth error:', err);
      throw errorHandler.unauthorized('Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Grant access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Get user role from Supabase user metadata
    const userRole = req.user.app_metadata?.role || 'user';

    if (!roles.includes(userRole)) {
      return next(
        errorHandler.forbidden(`User role ${userRole} is not authorized to access this route`)
      );
    }
    next();
  };
};
