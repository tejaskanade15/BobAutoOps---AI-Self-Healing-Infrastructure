/**
 * Error Simulator Utility
 * Simulates various types of errors for testing and demonstration purposes
 */

class ErrorSimulator {
  /**
   * Simulate different types of errors based on error type parameter
   * @param {string} errorType - Type of error to simulate
   * @throws {Error} Throws appropriate error based on type
   */
  static simulateError(errorType) {
    switch (errorType) {
      case '500':
      case 'internal':
        return this.simulateInternalServerError();
      
      case '404':
      case 'notfound':
        return this.simulateNotFoundError();
      
      case '503':
      case 'unavailable':
        return this.simulateServiceUnavailableError();
      
      case 'db':
      case 'database':
        return this.simulateDatabaseError();
      
      case 'timeout':
        return this.simulateTimeoutError();
      
      case 'validation':
        return this.simulateValidationError();
      
      case 'auth':
      case 'unauthorized':
        return this.simulateAuthError();
      
      default:
        return null; // No error simulation
    }
  }

  /**
   * Simulate 500 Internal Server Error
   */
  static simulateInternalServerError() {
    const error = new Error('Internal Server Error: Unexpected condition encountered');
    error.statusCode = 500;
    error.type = 'internal_server_error';
    error.stack = `Error: Internal Server Error: Unexpected condition encountered
    at ErrorSimulator.simulateInternalServerError (errorSimulator.js:45:19)
    at processUserRequest (users.js:23:15)
    at Layer.handle [as handle_request] (express/lib/router/layer.js:95:5)`;
    throw error;
  }

  /**
   * Simulate 404 Not Found Error
   */
  static simulateNotFoundError() {
    const error = new Error('Resource not found: The requested user does not exist');
    error.statusCode = 404;
    error.type = 'not_found';
    throw error;
  }

  /**
   * Simulate 503 Service Unavailable Error
   */
  static simulateServiceUnavailableError() {
    const error = new Error('Service Unavailable: The service is temporarily unavailable');
    error.statusCode = 503;
    error.type = 'service_unavailable';
    throw error;
  }

  /**
   * Simulate Database Connection Error
   */
  static simulateDatabaseError() {
    const error = new Error('Database Connection Error: Unable to connect to database server at localhost:5432');
    error.statusCode = 500;
    error.type = 'database_error';
    error.code = 'ECONNREFUSED';
    error.stack = `Error: Database Connection Error: Unable to connect to database server at localhost:5432
    at Connection.connect (pg/lib/connection.js:123:17)
    at Client._connect (pg/lib/client.js:89:12)
    at ErrorSimulator.simulateDatabaseError (errorSimulator.js:78:19)`;
    throw error;
  }

  /**
   * Simulate Timeout Error
   */
  static simulateTimeoutError() {
    const error = new Error('Request Timeout: Operation timed out after 30000ms');
    error.statusCode = 504;
    error.type = 'timeout_error';
    error.timeout = 30000;
    throw error;
  }

  /**
   * Simulate Validation Error
   */
  static simulateValidationError() {
    const error = new Error('Validation Error: Invalid input parameters');
    error.statusCode = 400;
    error.type = 'validation_error';
    error.details = [
      { field: 'email', message: 'Invalid email format' },
      { field: 'age', message: 'Age must be a positive number' }
    ];
    throw error;
  }

  /**
   * Simulate Authentication Error
   */
  static simulateAuthError() {
    const error = new Error('Unauthorized: Invalid or missing authentication token');
    error.statusCode = 401;
    error.type = 'authentication_error';
    throw error;
  }

  /**
   * Get list of available error types
   */
  static getAvailableErrorTypes() {
    return [
      { type: '500', description: 'Internal Server Error' },
      { type: '404', description: 'Not Found Error' },
      { type: '503', description: 'Service Unavailable' },
      { type: 'db', description: 'Database Connection Error' },
      { type: 'timeout', description: 'Request Timeout Error' },
      { type: 'validation', description: 'Validation Error' },
      { type: 'auth', description: 'Authentication Error' }
    ];
  }
}

module.exports = ErrorSimulator;

// Made with Bob
