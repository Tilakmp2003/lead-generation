/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Create a 400 Bad Request error
 * @param {string} message - Error message
 * @returns {ApiError} - Bad Request error
 */
const badRequest = (message = 'Bad Request') => {
  return new ApiError(400, message);
};

/**
 * Create a 401 Unauthorized error
 * @param {string} message - Error message
 * @returns {ApiError} - Unauthorized error
 */
const unauthorized = (message = 'Unauthorized') => {
  return new ApiError(401, message);
};

/**
 * Create a 403 Forbidden error
 * @param {string} message - Error message
 * @returns {ApiError} - Forbidden error
 */
const forbidden = (message = 'Forbidden') => {
  return new ApiError(403, message);
};

/**
 * Create a 404 Not Found error
 * @param {string} message - Error message
 * @returns {ApiError} - Not Found error
 */
const notFound = (message = 'Not Found') => {
  return new ApiError(404, message);
};

/**
 * Create a 429 Too Many Requests error
 * @param {string} message - Error message
 * @returns {ApiError} - Too Many Requests error
 */
const tooManyRequests = (message = 'Too Many Requests') => {
  return new ApiError(429, message);
};

/**
 * Create a 500 Internal Server Error
 * @param {string} message - Error message
 * @returns {ApiError} - Internal Server Error
 */
const internal = (message = 'Internal Server Error') => {
  return new ApiError(500, message, true);
};

module.exports = {
  ApiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  internal
};
