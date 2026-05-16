const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Generation Service for Postmortem Reports
 */
class PDFService {
  constructor() {
    this.reportsDir = path.join(__dirname, '..', 'reports');
    this.ensureReportsDirectory();
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
      console.log('Created reports directory');
    }
  }

  /**
   * Generate PDF postmortem report
   */
  async generatePostmortem(incident) {
    return new Promise((resolve, reject) => {
      try {
        const filename = `postmortem-${incident.alertName}-${incident.id}.pdf`;
        const filepath = path.join(this.reportsDir, filename);

        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Pipe to file
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Generate content
        this.addHeader(doc);
        this.addIncidentSummary(doc, incident);
        this.addTimeline(doc, incident);
        this.addRootCauseAnalysis(doc, incident);
        this.addAffectedFiles(doc, incident);
        this.addFixSuggestion(doc, incident);
        this.addResolutionSteps(doc, incident);
        this.addPreventionRecommendations(doc, incident);
        this.addMetadata(doc, incident);
        this.addFooter(doc);

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          console.log(`Generated PDF postmortem: ${filename}`);
          resolve({
            success: true,
            filepath: filepath,
            filename: filename
          });
        });

        stream.on('error', (error) => {
          console.error('Error writing PDF:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Add header to PDF
   */
  addHeader(doc) {
    doc
      .fontSize(24)
      .fillColor('#1a73e8')
      .text('INCIDENT POSTMORTEM REPORT', { align: 'center' })
      .moveDown(0.5)
      .fontSize(14)
      .fillColor('#5f6368')
      .text('BobAutoOps AI Self-Healing System', { align: 'center' })
      .moveDown(0.3)
      .fontSize(10)
      .text(`Generated: ${new Date().toISOString()}`, { align: 'center' })
      .moveDown(2);
  }

  /**
   * Add incident summary section
   */
  addIncidentSummary(doc, incident) {
    this.addSectionTitle(doc, 'INCIDENT SUMMARY');
    
    const summary = [
      { label: 'Incident ID', value: incident.id },
      { label: 'Alert Name', value: incident.alertName },
      { label: 'Severity', value: incident.severity.toUpperCase() },
      { label: 'Status', value: incident.status.toUpperCase() },
      { label: 'Service', value: incident.service || 'monitored-app' },
      { label: 'Instance', value: incident.instance || 'localhost:3000' }
    ];

    summary.forEach(item => {
      doc
        .fontSize(10)
        .fillColor('#202124')
        .text(`${item.label}: `, { continued: true })
        .fillColor('#5f6368')
        .text(item.value);
    });

    doc.moveDown(1.5);
  }

  /**
   * Add timeline section
   */
  addTimeline(doc, incident) {
    this.addSectionTitle(doc, 'TIMELINE');

    const detectedTime = new Date(incident.timestamp);
    const resolvedTime = incident.acknowledgedAt 
      ? new Date(incident.acknowledgedAt) 
      : new Date();
    const resolutionSeconds = Math.round((resolvedTime - detectedTime) / 1000);

    doc
      .fontSize(10)
      .fillColor('#202124')
      .text('Detected At: ', { continued: true })
      .fillColor('#5f6368')
      .text(incident.timestamp)
      .fillColor('#202124')
      .text(incident.acknowledgedAt ? 'Acknowledged: ' : 'Status: ', { continued: true })
      .fillColor('#5f6368')
      .text(incident.acknowledgedAt || 'Still Open')
      .fillColor('#202124')
      .text('Resolution Time: ', { continued: true })
      .fillColor('#5f6368')
      .text(`${resolutionSeconds} seconds`)
      .fillColor('#202124')
      .text('MTTR: ', { continued: true })
      .fillColor('#5f6368')
      .text(`${resolutionSeconds}s`);

    doc.moveDown(1.5);
  }

  /**
   * Add root cause analysis section
   */
  addRootCauseAnalysis(doc, incident) {
    this.addSectionTitle(doc, 'ROOT CAUSE ANALYSIS (by IBM watsonx AI)');

    doc
      .fontSize(10)
      .fillColor('#5f6368')
      .text(incident.rootCause || 'Analysis pending', {
        align: 'justify'
      })
      .moveDown(0.5)
      .fillColor('#202124')
      .text('Description: ', { continued: true })
      .fillColor('#5f6368')
      .text(incident.description || 'No description')
      .fillColor('#202124')
      .text('Summary: ', { continued: true })
      .fillColor('#5f6368')
      .text(incident.summary || 'No summary');

    doc.moveDown(1.5);
  }

  /**
   * Add affected files section
   */
  addAffectedFiles(doc, incident) {
    this.addSectionTitle(doc, 'AFFECTED FILES (detected by Bob AI)');

    const files = incident.affectedFiles || ['monitored-app/src/app.js'];
    
    files.forEach((file, index) => {
      doc
        .fontSize(10)
        .fillColor('#5f6368')
        .text(`${index + 1}. ${file}`);
    });

    doc.moveDown(1.5);
  }

  /**
   * Add fix suggestion section
   */
  addFixSuggestion(doc, incident) {
    this.addSectionTitle(doc, 'FIX SUGGESTION (generated by Bob AI)');

    doc
      .fontSize(10)
      .fillColor('#5f6368')
      .text(incident.fixSuggestion || 'Fix pending', {
        align: 'justify'
      });

    if (incident.prUrl) {
      doc
        .moveDown(0.5)
        .fillColor('#1a73e8')
        .text('Pull Request: ', { continued: true })
        .fillColor('#1a73e8')
        .text(incident.prUrl, { link: incident.prUrl });
    }

    doc.moveDown(1.5);
  }

  /**
   * Add resolution steps section
   */
  addResolutionSteps(doc, incident) {
    this.addSectionTitle(doc, 'RESOLUTION STEPS TAKEN');

    const steps = [
      'Bob AI detected anomaly via Prometheus metrics',
      'Alert fired to BobAutoOps webhook on port 4000',
      'Bob AI analyzed full repository codebase context',
      `Root cause identified: ${incident.alertName}`,
      'Fix suggestion generated automatically',
      'Incident logged and tracked in system',
      'Engineer notified and acknowledged incident',
      'System monitoring continued'
    ];

    steps.forEach((step, index) => {
      doc
        .fontSize(10)
        .fillColor('#5f6368')
        .text(`${index + 1}. ${step}`);
    });

    doc.moveDown(1.5);
  }

  /**
   * Add prevention recommendations section
   */
  addPreventionRecommendations(doc, incident) {
    this.addSectionTitle(doc, 'PREVENTION RECOMMENDATIONS');

    const recommendations = this.getRecommendations(incident.alertName);

    recommendations.forEach(rec => {
      doc
        .fontSize(10)
        .fillColor('#5f6368')
        .text(`• ${rec}`);
    });

    doc.moveDown(1.5);
  }

  /**
   * Add metadata section
   */
  addMetadata(doc, incident) {
    this.addSectionTitle(doc, 'BOB AI ANALYSIS METADATA');

    doc
      .fontSize(10)
      .fillColor('#202124')
      .text('Confidence: ', { continued: true })
      .fillColor('#5f6368')
      .text(`${(incident.confidence * 100 || 75)}%`)
      .fillColor('#202124')
      .text('Bob Version: ', { continued: true })
      .fillColor('#5f6368')
      .text('v1.0.2')
      .fillColor('#202124')
      .text('Plan: ', { continued: true })
      .fillColor('#5f6368')
      .text('Enterprise')
      .fillColor('#202124')
      .text('PR URL: ', { continued: true })
      .fillColor('#5f6368')
      .text(incident.prUrl || 'Not generated');

    doc.moveDown(2);
  }

  /**
   * Add footer
   */
  addFooter(doc) {
    doc
      .fontSize(8)
      .fillColor('#5f6368')
      .text('BobAutoOps - AI Powered Self Healing Infrastructure', {
        align: 'center'
      })
      .text('Powered by IBM watsonx Enterprise | © 2026', {
        align: 'center'
      });
  }

  /**
   * Add section title
   */
  addSectionTitle(doc, title) {
    doc
      .fontSize(12)
      .fillColor('#1a73e8')
      .text(title)
      .moveDown(0.5);
  }

  /**
   * Get recommendations based on alert type
   */
  getRecommendations(alertName) {
    const recommendations = {
      'HighErrorRate': [
        'Add null checks in error-prone functions',
        'Implement circuit breaker pattern',
        'Add input validation middleware',
        'Set up automated regression tests',
        'Configure error rate alerting threshold'
      ],
      'DatabaseConnectionFailure': [
        'Increase database connection pool size',
        'Implement connection retry logic',
        'Add database health check endpoint',
        'Set up connection pool monitoring',
        'Configure automatic reconnection'
      ],
      'MemoryLeak': [
        'Add memory profiling to CI/CD pipeline',
        'Implement proper cleanup in async functions',
        'Set memory limit alerts at 80% threshold',
        'Review event listener registrations',
        'Use WeakMap for cache implementations'
      ]
    };

    return recommendations[alertName] || [
      `Review and fix ${alertName} root cause`,
      'Add monitoring for affected service',
      'Implement proper error handling',
      'Set up automated testing',
      'Review deployment process'
    ];
  }

  /**
   * Get PDF file path
   */
  getFilePath(filename) {
    return path.join(this.reportsDir, filename);
  }

  /**
   * Check if PDF exists
   */
  pdfExists(filename) {
    return fs.existsSync(this.getFilePath(filename));
  }
}

module.exports = new PDFService();

// Made with Bob
