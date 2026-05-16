const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 ${config.app.name} v${config.app.version}`);
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log('📍 Available Endpoints:');
  console.log(`   - Root:    http://localhost:${PORT}/`);
  console.log(`   - Health:  http://localhost:${PORT}/health`);
  console.log(`   - Metrics: http://localhost:${PORT}/metrics`);
  console.log(`   - Users:   http://localhost:${PORT}/users`);
  console.log('='.repeat(60));
  console.log('🔧 Error Simulation:');
  console.log(`   - Add ?errorType=<type> to /users endpoint`);
  console.log(`   - Available types: 500, 404, 503, db, timeout, validation, auth`);
  console.log(`   - Example: http://localhost:${PORT}/users?errorType=500`);
  console.log('='.repeat(60));
  console.log('📊 Prometheus Metrics:');
  console.log(`   - Scrape endpoint: http://localhost:${PORT}/metrics`);
  console.log(`   - Metrics tracked: requests, errors, duration, app_info`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Made with Bob
