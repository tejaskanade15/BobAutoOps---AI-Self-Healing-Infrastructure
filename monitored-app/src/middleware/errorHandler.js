const { httpErrorsTotal } = require('./metrics');

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate responses
 * Also tracks errors in Prometheus metrics
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  const statusCode = err.statusCode || 500;
  
  // Get route path
  const route = req.route ? req.route.path : req.path;
  
  // Determine error type
  let errorType = 'unknown_error';
  if (err.type) {
    errorType = err.type;
  } else if (statusCode >= 500) {
    errorType = 'server_error';
  } else if (statusCode >= 400) {
    errorType = 'client_error';
  }
  
  // Track error in Prometheus
  httpErrorsTotal.inc({
    method: req.method,
    route: route,
    error_type: errorType,
    status_code: statusCode
  });
  
  // Log error for debugging
  console.error(`[ERROR] ${req.method} ${route} - ${statusCode} - ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      type: errorType,
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {})
    }
  });
};

/**
 * 404 Not Found handler
 * Handles routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.statusCode = 404;
  error.type = 'not_found';
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
};

// Made with Bob
