/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Error} error - Optional error object
 */
const sendErrorResponse = (res, statusCode, message, error = null) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const response = {
    success: false,
    message,
  };

  if (!isProduction && error) {
    response.error = error.message;
  }

  return res.status(statusCode).json(response);
};

module.exports = { sendErrorResponse };