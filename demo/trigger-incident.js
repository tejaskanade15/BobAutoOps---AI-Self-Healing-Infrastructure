const axios = require('axios');

const ALERT_URL = 'http://localhost:4000/alert';
const INCIDENTS_URL = 'http://localhost:4000/incidents';

// Prometheus alertmanager webhook format
const alertPayload = {
  receiver: "bob-webhook",
  status: "firing",
  alerts: [{
    status: "firing",
    labels: {
      alertname: "HighErrorRate",
      severity: "critical",
      service: "monitored-app"
    },
    annotations: {
      summary: "High error rate detected",
      description: "Error rate exceeded threshold in /users endpoint"
    },
    startsAt: "2026-05-16T16:00:00Z"
  }],
  groupLabels: { alertname: "HighErrorRate" },
  commonLabels: { severity: "critical" }
};

async function sendAlert() {
  try {
    console.log('📤 Sending Prometheus alert to', ALERT_URL);
    console.log('Alert payload:', JSON.stringify(alertPayload, null, 2));
    
    const response = await axios.post(ALERT_URL, alertPayload);
    console.log('✅ Alert sent successfully!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Failed to send alert:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

async function pollIncidents() {
  console.log('\n🔄 Starting to poll incidents every 2 seconds...');
  console.log('Press Ctrl+C to stop\n');
  
  let pollCount = 0;
  
  const intervalId = setInterval(async () => {
    pollCount++;
    try {
      const response = await axios.get(INCIDENTS_URL);
      const incidents = response.data;
      
      console.log(`\n[Poll #${pollCount}] ${new Date().toISOString()}`);
      console.log(`Total incidents: ${incidents.length}`);
      
      if (incidents.length > 0) {
        // Show the most recent incident
        const latestIncident = incidents[incidents.length - 1];
        console.log('\n📋 Latest Incident:');
        console.log(`  ID: ${latestIncident.id}`);
        console.log(`  Alert: ${latestIncident.alertname}`);
        console.log(`  Severity: ${latestIncident.severity}`);
        console.log(`  Service: ${latestIncident.service}`);
        console.log(`  Status: ${latestIncident.status}`);
        console.log(`  Summary: ${latestIncident.summary}`);
        console.log(`  Description: ${latestIncident.description}`);
        console.log(`  Created: ${latestIncident.createdAt}`);
        
        if (latestIncident.resolvedAt) {
          console.log(`  Resolved: ${latestIncident.resolvedAt}`);
        }
        
        if (latestIncident.actions && latestIncident.actions.length > 0) {
          console.log(`  Actions taken: ${latestIncident.actions.length}`);
          latestIncident.actions.forEach((action, idx) => {
            console.log(`    ${idx + 1}. ${action.type} - ${action.status}`);
          });
        }
      } else {
        console.log('No incidents found yet.');
      }
      
    } catch (error) {
      console.error('❌ Failed to poll incidents:', error.message);
    }
  }, 2000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping incident polling...');
    clearInterval(intervalId);
    process.exit(0);
  });
}

async function main() {
  console.log('🚀 Bob AutoOps - Incident Trigger Demo\n');
  
  // Send the alert
  const success = await sendAlert();
  
  if (success) {
    // Start polling for incidents
    await pollIncidents();
  } else {
    console.log('\n⚠️  Alert sending failed. Make sure autoops-backend is running on port 4000.');
    process.exit(1);
  }
}

// Run the script
main();

// Made with Bob
