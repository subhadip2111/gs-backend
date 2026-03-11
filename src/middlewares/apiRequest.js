const logger = require('../config/logger');

/**
 * Middleware to calculate the execution response time of a request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const apiRequestTime = (req, res, next) => {
  // Record the start time using process.hrtime() for high-resolution timing
  const start = process.hrtime();

  // Listen to the 'finish' event which is emitted when the response has been sent
  res.on('finish', () => {
    // Calculate the duration difference
    const diff = process.hrtime(start);
    
    // Calculate time in milliseconds (diff[0] is seconds, diff[1] is nanoseconds)
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    // Log the execution time along with method and URL
    logger.info(`[${req.method}] ${req.originalUrl} - Execution Time: ${timeInMs} ms`);
  });

  // Proceed to the next middleware or controller
  next();
};

module.exports = apiRequestTime;
