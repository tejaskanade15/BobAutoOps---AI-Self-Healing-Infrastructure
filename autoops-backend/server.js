require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Import services
const watsonxService = require('./services/watsonx');
const githubService = require('./services/github');
const pdfService = require('./services/pdf');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const INCIDENTS_FILE = path.join(__dirname, 'incidents.json');
const MONITORED_APP_SRC = path.join(__dirname, '..', 'monitored-app', 'src');

// Initialize incidents file if it doesn't exist
async function initializeIncidentsFile() {
  try {
    await fs.access(INCIDENTS_FILE);
  } catch (error) {
    await fs.writeFile(INCIDENTS_FILE, JSON.stringify([], null, 2));
    console.log('✅ Created incidents.json file');
  }
}

// Read all files from monitored-app/src/ folder
async function readMonitoredAppFiles() {
  const files = {};
  
  async function readDirectory(dir, baseDir = dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      if (entry.isDirectory()) {
        await readDirectory(fullPath, baseDir);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.json'))) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          files[relativePath] = content;
        } catch (error) {
          console.error(`Error reading file ${relativePath}:`, error.message);
        }
      }
    }
  }
  
  try {
    await readDirectory(MONITORED_APP_SRC);
  } catch (error) {
    console.error('Error reading monitored app files:', error.message);
  }
  
  return files;
}

// Load incidents from file
async function loadIncidents() {
  try {
    const data = await fs.readFile(INCIDENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading incidents:', error.message);
    return [];
  }
}

// Save incidents to file
async function saveIncidents(incidents) {
  try {
    await fs.writeFile(INCIDENTS_FILE, JSON.stringify(incidents, null, 2));
  } catch (error) {
    console.error('Error saving incidents:', error.message);
  }
}

// Synchronous helper functions for readIncidents and saveIncidents
function readIncidents() {
  try {
    const data = require('fs').readFileSync(INCIDENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveIncidentsSync(incidents) {
  try {
    require('fs').writeFileSync(INCIDENTS_FILE, JSON.stringify(incidents, null, 2));
  } catch (error) {
    console.error('Error saving incidents:', error.message);
  }
}

// POST /alert - Receive Prometheus alertmanager webhooks
app.post('/alert', async (req, res) => {
  try {
    console.log('\n🚨 ===== ALERT RECEIVED =====');
    console.log('Timestamp:', new Date().toISOString());
    
    const rawAlert = req.body;
    const alertData = rawAlert;
    const firstAlert = alertData.alerts && alertData.alerts[0];
    
    // Read all files from monitored-app/src/
    console.log('📂 Reading monitored app codebase...');
    const codeContext = await readMonitoredAppFiles();
    console.log(`✅ Read ${Object.keys(codeContext).length} files from monitored app`);
    
    // Extract alert information
    const alertName = rawAlert?.alerts?.[0]?.labels?.alertname
      || rawAlert?.commonLabels?.alertname
      || rawAlert?.groupLabels?.alertname
      || 'Unknown Alert';

    const description = firstAlert?.annotations?.description || 'No description available';
    const severity = alertData.commonLabels?.severity || firstAlert?.labels?.severity || 'unknown';
    
    console.log(`📊 Alert: ${alertName} | Severity: ${severity}`);
    
    // Step 1: AI Root Cause Analysis
    console.log('\n🤖 Step 1: Running AI root cause analysis...');
    const analysis = await watsonxService.analyzeRootCause(alertData, codeContext);
    console.log(`✅ Analysis complete | Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
    console.log(`   Root Cause: ${analysis.rootCause.substring(0, 100)}...`);
    
    // Create incident record
    const incident = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      alertName: alertName,
      severity: severity,
      status: 'open',
      service: alertData.commonLabels?.service || firstAlert?.labels?.service || 'monitored-app',
      instance: alertData.commonLabels?.instance || firstAlert?.labels?.instance || 'unknown',
      description: description,
      summary: alertData.commonAnnotations?.summary || firstAlert?.annotations?.summary || 'No summary',
      job: alertData.commonLabels?.job || firstAlert?.labels?.job || 'unknown',
      rootCause: analysis.rootCause,
      fixSuggestion: null, // Will be populated by AI
      affectedFiles: analysis.affectedFiles,
      confidence: analysis.confidence,
      prUrl: null,
      postmortemPath: null,
      rawAlert: alertData
    };
    
    // Step 2: AI Fix Generation
    console.log('\n🔧 Step 2: Generating AI-powered fix...');
    const fixData = await watsonxService.generateFix(incident, codeContext);
    incident.fixSuggestion = fixData.fixDescription;
    console.log(`✅ Fix generated: ${fixData.fixDescription.substring(0, 100)}...`);
    
    // Step 3: Create GitHub PR
    if (githubService.isConfigured()) {
      console.log('\n📤 Step 3: Creating GitHub pull request...');
      const prResult = await githubService.createFixPR(incident, fixData);
      
      if (prResult.success) {
        incident.prUrl = prResult.prUrl;
        incident.status = 'pr_created';
        console.log(`✅ PR created: ${prResult.prUrl}`);
      } else {
        console.log(`⚠️  PR creation failed: ${prResult.error}`);
      }
    } else {
      console.log('\n⚠️  Step 3: GitHub not configured, skipping PR creation');
    }
    
    // Step 4: Generate PDF Postmortem
    console.log('\n📄 Step 4: Generating PDF postmortem report...');
    try {
      const pdfResult = await pdfService.generatePostmortem(incident);
      incident.postmortemPath = pdfResult.filepath;
      console.log(`✅ PDF generated: ${pdfResult.filename}`);
    } catch (error) {
      console.log(`⚠️  PDF generation failed: ${error.message}`);
    }
    
    // Save incident
    const incidents = await loadIncidents();
    incidents.push(incident);
    await saveIncidents(incidents);
    
    console.log(`\n✅ Incident ${incident.id} processed successfully`);
    console.log('===========================\n');
    
    res.status(200).json({
      success: true,
      message: 'Alert received and processed with AI',
      incidentId: incident.id,
      aiAnalysis: {
        rootCause: analysis.rootCause,
        confidence: analysis.confidence,
        affectedFiles: analysis.affectedFiles
      },
      fix: {
        description: fixData.fixDescription,
        filesChanged: fixData.files.length
      },
      prUrl: incident.prUrl,
      postmortemGenerated: !!incident.postmortemPath
    });
  } catch (error) {
    console.error('❌ Error processing alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /incidents - Return list of all incidents
app.get('/incidents', async (req, res) => {
  try {
    const incidents = await loadIncidents();
    
    // Sort by timestamp (newest first)
    incidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json([]);
  }
});

// GET /incidents/:id - Get specific incident
app.get('/incidents/:id', async (req, res) => {
  try {
    const incidents = await loadIncidents();
    const incident = incidents.find(i => i.id === req.params.id);
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }
    
    res.json({
      success: true,
      incident
    });
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PATCH /incidents/:id - Update incident status
app.patch('/incidents/:id', async (req, res) => {
  try {
    const incidents = await loadIncidents();
    const index = incidents.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }
    
    // Update incident fields
    const allowedUpdates = ['status', 'prUrl', 'postmortemPath', 'notes'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        incidents[index][field] = req.body[field];
      }
    });
    
    incidents[index].updatedAt = new Date().toISOString();
    
    await saveIncidents(incidents);
    
    res.json({
      success: true,
      incident: incidents[index]
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /incidents/:id/acknowledge - Acknowledge an incident
app.post('/incidents/:id/acknowledge', (req, res) => {
  try {
    let incidents = readIncidents();
    const index = incidents.findIndex(i =>
      String(i.id) === String(req.params.id)
    );
    if (index !== -1) {
      incidents[index].status = 'acknowledged';
      incidents[index].acknowledgedAt = new Date().toISOString();
      saveIncidentsSync(incidents);
      res.json(incidents[index]);
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /postmortem/:id - Download PDF postmortem report
app.get('/postmortem/:id', async (req, res) => {
  try {
    let incidents = readIncidents();
    const incident = incidents.find(i =>
      String(i.id) === String(req.params.id)
    );
    
    if (!incident) {
      return res.status(404).send('Incident not found');
    }

    // Check if PDF already exists
    const filename = `postmortem-${incident.alertName}-${incident.id}.pdf`;
    const filepath = pdfService.getFilePath(filename);

    // Generate PDF if it doesn't exist
    if (!pdfService.pdfExists(filename)) {
      console.log('Generating PDF on-demand...');
      await pdfService.generatePostmortem(incident);
    }

    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}`
    );
    
    const fileStream = require('fs').createReadStream(filepath);
    fileStream.pipe(res);
  } catch(err) {
    console.error('Error serving postmortem:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /health - Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      watsonx: !!process.env.WATSONX_API_KEY,
      github: githubService.isConfigured(),
      pdf: true
    }
  });
});

// GET /config - Get configuration status
app.get('/config', async (req, res) => {
  const repoInfo = await githubService.getRepoInfo();
  
  res.json({
    watsonx: {
      configured: !!process.env.WATSONX_API_KEY,
      url: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com'
    },
    github: {
      configured: githubService.isConfigured(),
      repo: repoInfo ? repoInfo.name : 'Not configured',
      url: repoInfo ? repoInfo.url : null
    },
    monitoring: {
      monitoredAppPath: MONITORED_APP_SRC
    }
  });
});

// Start server
async function startServer() {
  await initializeIncidentsFile();
  
  app.listen(PORT, () => {
    console.log('\n🚀 ===================================');
    console.log('   BobAutoOps Backend Server Started');
    console.log('   ===================================');
    console.log(`   Port: ${PORT}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log('\n📡 Endpoints:');
    console.log('   POST   /alert                    - Receive Prometheus alerts');
    console.log('   GET    /incidents                - List all incidents');
    console.log('   GET    /incidents/:id            - Get specific incident');
    console.log('   PATCH  /incidents/:id            - Update incident');
    console.log('   POST   /incidents/:id/acknowledge - Acknowledge incident');
    console.log('   GET    /postmortem/:id           - Download PDF postmortem');
    console.log('   GET    /health                   - Health check');
    console.log('   GET    /config                   - Configuration status');
    console.log('\n🤖 AI Services:');
    console.log(`   IBM watsonx: ${process.env.WATSONX_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   GitHub:      ${githubService.isConfigured() ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   PDF Gen:     ✅ Ready`);
    console.log('\n===================================\n');
  });
}

startServer().catch(console.error);

// Made with Bob - Now with REAL AI! 🚀
