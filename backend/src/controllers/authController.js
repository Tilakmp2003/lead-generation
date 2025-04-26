const supabase = require('../config/supabase');
const errorHandler = require('../utils/errorHandler');

/**
 * Register a new user with email and password
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw errorHandler.badRequest('Please provide name, email and password');
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) {
      throw errorHandler.badRequest(error.message);
    }

    // Return user data and session
    res.status(201).json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user with email and password
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      throw errorHandler.badRequest('Please provide an email and password');
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw errorHandler.unauthorized(error.message);
    }

    // Return user data and session
    res.status(200).json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login or register with Google OAuth
 * @route POST /api/auth/google
 * @access Public
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      throw errorHandler.badRequest('Please provide a Google access token');
    }

    // Sign in with Google OAuth token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: accessToken
    });

    if (error) {
      throw errorHandler.unauthorized(error.message);
    }

    // Return user data and session
    res.status(200).json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // Get user from Supabase session
    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization.split(' ')[1]);

    if (error) {
      throw errorHandler.unauthorized(error.message);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log user out
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res, next) => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw errorHandler.internal(error.message);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
