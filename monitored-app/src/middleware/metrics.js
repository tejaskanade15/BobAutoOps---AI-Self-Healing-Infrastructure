const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics for our application
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'error_type', 'status_code'],
  registers: [register]
});

const appInfo = new client.Gauge({
  name: 'app_info',
  help: 'Application information',
  labelNames: ['version', 'name', 'env'],
  registers: [register]
});

// Set app info
const config = require('../config');
appInfo.set(
  {
    version: config.app.version,
    name: config.app.name,
    env: config.nodeEnv
  },
  1
);

// Middleware to track metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to capture metrics
  res.end = function(...args) {
    // Calculate duration
    const duration = (Date.now() - start) / 1000;
    
    // Get route path (use path or originalUrl)
    const route = req.route ? req.route.path : req.path;
    
    // Record metrics
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status_code: res.statusCode
      },
      duration
    );
    
    // Track errors (4xx and 5xx status codes)
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      httpErrorsTotal.inc({
        method: req.method,
        route: route,
        error_type: errorType,
        status_code: res.statusCode
      });
    }
    
    // Call original end function
    originalEnd.apply(res, args);
  };
  
  next();
};

module.exports = {
  register,
  metricsMiddleware,
  httpRequestsTotal,
  httpRequestDuration,
  httpErrorsTotal,
  appInfo
};

// Made with Bob
