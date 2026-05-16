require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  app: {
    name: process.env.APP_NAME || 'BobAutoOps-Monitored-App',
    version: process.env.APP_VERSION || '1.0.0'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;

// Made with Bob
