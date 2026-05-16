const express = require('express');
const config = require('./config');
const { metricsMiddleware } = require('./middleware/metrics');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');
const metricsRouter = require('./routes/metrics');

// Create Express application
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply metrics middleware to all routes
app.use(metricsMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: config.app.name,
    version: config.app.version,
    status: 'running',
    environment: config.nodeEnv,
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      users: '/users',
      errorTypes: '/users/errors/types'
    },
    documentation: {
      errorSimulation: 'Add ?errorType=<type> to /users endpoint',
      availableErrors: ['500', '404', '503', 'db', 'timeout', 'validation', 'auth']
    },
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);
app.use('/users', usersRouter);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

module.exports = app;

// Made with Bob
