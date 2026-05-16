# Bob AutoOps Demo Scripts

This directory contains demo scripts for testing the Bob AutoOps incident management system.

## trigger-incident.js

Sends a fake Prometheus alert to the AutoOps backend and polls for incident status updates.

### Prerequisites

1. Make sure the autoops-backend is running on port 4000:
   ```bash
   cd autoops-backend
   npm start
   ```

### Installation

Install dependencies:
```bash
cd demo
npm install
```

### Usage

Run the script:
```bash
npm run trigger
```

Or directly:
```bash
node trigger-incident.js
```

### What it does

1. **Sends a Prometheus Alert**: Posts a fake alert in Prometheus Alertmanager webhook format to `http://localhost:4000/alert`
   - Alert: `HighErrorRate`
   - Severity: `critical`
   - Service: `monitored-app`

2. **Polls for Incidents**: Queries `http://localhost:4000/incidents` every 2 seconds and displays:
   - Total number of incidents
   - Latest incident details (ID, status, severity, actions taken, etc.)

3. **Continuous Monitoring**: Keeps polling until you press `Ctrl+C`

### Expected Output

```
🚀 Bob AutoOps - Incident Trigger Demo

📤 Sending Prometheus alert to http://localhost:4000/alert
Alert payload: {
  "receiver": "bob-webhook",
  "status": "firing",
  ...
}
✅ Alert sent successfully!

🔄 Starting to poll incidents every 2 seconds...
Press Ctrl+C to stop

[Poll #1] 2026-05-16T11:00:00.000Z
Total incidents: 1

📋 Latest Incident:
  ID: inc_1234567890
  Alert: HighErrorRate
  Severity: critical
  Service: monitored-app
  Status: investigating
  Summary: High error rate detected
  Description: Error rate exceeded threshold in /users endpoint
  Created: 2026-05-16T11:00:00.000Z
  Actions taken: 2
    1. restart_service - completed
    2. scale_up - in_progress
```

### Troubleshooting

- **Connection refused**: Make sure autoops-backend is running on port 4000
- **No incidents appearing**: Check that the backend is properly receiving and processing alerts
- **Axios not found**: Run `npm install` in the demo directory