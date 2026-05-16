const express = require('express');
const router = express.Router();
const ErrorSimulator = require('../utils/errorSimulator');

// Mock user data
const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'moderator' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'user' }
];

/**
 * GET /users
 * Returns list of users
 * Supports error simulation via query parameter: ?errorType=<type>
 * 
 * Available error types:
 * - 500 or internal: Internal Server Error
 * - 404 or notfound: Not Found Error
 * - 503 or unavailable: Service Unavailable
 * - db or database: Database Connection Error
 * - timeout: Request Timeout Error
 * - validation: Validation Error
 * - auth or unauthorized: Authentication Error
 */
router.get('/', (req, res, next) => {
  try {
    // Check if error simulation is requested
    const errorType = req.query.errorType;
    
    if (errorType) {
      console.log(`[SIMULATION] Simulating error type: ${errorType}`);
      ErrorSimulator.simulateError(errorType);
    }
    
    // Normal response - return users
    res.json({
      success: true,
      count: mockUsers.length,
      data: mockUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
});

/**
 * GET /users/:id
 * Returns a specific user by ID
 * Supports error simulation via query parameter
 */
router.get('/:id', (req, res, next) => {
  try {
    // Check if error simulation is requested
    const errorType = req.query.errorType;
    
    if (errorType) {
      console.log(`[SIMULATION] Simulating error type: ${errorType}`);
      ErrorSimulator.simulateError(errorType);
    }
    
    const userId = parseInt(req.params.id);
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      const error = new Error(`User with ID ${userId} not found`);
      error.statusCode = 404;
      error.type = 'not_found';
      throw error;
    }
    
    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users/errors/types
 * Returns available error types for simulation
 */
router.get('/errors/types', (req, res) => {
  res.json({
    success: true,
    errorTypes: ErrorSimulator.getAvailableErrorTypes(),
    usage: 'Add ?errorType=<type> to /users endpoint to simulate errors',
    examples: [
      '/users?errorType=500',
      '/users?errorType=db',
      '/users?errorType=timeout',
      '/users/1?errorType=404'
    ]
  });
});

module.exports = router;

// Made with Bob
