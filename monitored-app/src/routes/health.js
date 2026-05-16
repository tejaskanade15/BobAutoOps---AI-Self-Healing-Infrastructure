const express = require('express');
const router = express.Router();

// Store application start time
const startTime = Date.now();

/**
 * GET /health
 * Health check endpoint
 * Returns application health status and uptime
 */
router.get('/', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  const healthStatus = {
    status: 'healthy',
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime)
    },
    timestamp: new Date().toISOString(),
    service: 'BobAutoOps-Monitored-App',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    pid: process.pid
  };
  
  res.json(healthStatus);
});

/**
 * Format uptime in human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;

// Made with Bob
