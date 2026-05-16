const express = require('express');
const router = express.Router();
const { register } = require('../middleware/metrics');

/**
 * GET /metrics
 * Prometheus metrics endpoint
 * Returns metrics in Prometheus text format for scraping
 */
router.get('/', async (req, res) => {
  try {
    // Set content type for Prometheus
    res.set('Content-Type', register.contentType);
    
    // Get metrics from registry
    const metrics = await register.metrics();
    
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).json({
      error: 'Failed to generate metrics',
      message: error.message
    });
  }
});

module.exports = router;

// Made with Bob
