# BobAutoOps Backend - AI-Powered Self-Healing System

The intelligent backend that powers automatic incident detection, AI analysis, fix generation, and GitHub PR creation.

## 🎯 Features

✅ **Real IBM watsonx AI Integration** - Root cause analysis using IBM's enterprise AI
✅ **AI-Powered Fix Generation** - Automatically generates code fixes
✅ **GitHub PR Automation** - Creates pull requests with fixes automatically
✅ **PDF Postmortem Reports** - Professional incident documentation
✅ **Webhook Receiver** - Receives alerts from Prometheus Alertmanager
✅ **Incident Management** - Complete REST API for incident tracking

## 🚀 Quick Start

### Prerequisites

1. **Node.js** >= 16.0.0
2. **IBM watsonx Account** - [Sign up here](https://www.ibm.com/products/watsonx-ai)
3. **GitHub Personal Access Token** - [Create one here](https://github.com/settings/tokens)

### Installation

```bash
# Navigate to autoops-backend directory
cd autoops-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

### Configuration

Edit the `.env` file with your credentials:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# IBM watsonx AI Configuration
WATSONX_API_KEY=your_actual_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# GitHub Configuration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main

# Monitored Application Path
MONITORED_APP_PATH=../monitored-app/src
```

### Getting IBM watsonx Credentials

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create a watsonx.ai instance
3. Navigate to **Resource List** → **AI / Machine Learning**
4. Click on your watsonx.ai instance
5. Go to **Manage** → **Access (IAM)**
6. Create an API key
7. Copy your **API Key** and **Project ID**

### Getting GitHub Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name: "BobAutoOps"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click **Generate token**
6. Copy the token immediately (you won't see it again!)

### Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:

```
🚀 ===================================
   BobAutoOps Backend Server Started
   ===================================
   Port: 4000
   Time: 2026-05-16T12:00:00.000Z

📡 Endpoints:
   POST   /alert                    - Receive Prometheus alerts
   GET    /incidents                - List all incidents
   GET    /incidents/:id            - Get specific incident
   PATCH  /incidents/:id            - Update incident
   POST   /incidents/:id/acknowledge - Acknowledge incident
   GET    /postmortem/:id           - Download PDF postmortem
   GET    /health                   - Health check
   GET    /config                   - Configuration status

🤖 AI Services:
   IBM watsonx: ✅ Configured
   GitHub:      ✅ Configured
   PDF Gen:     ✅ Ready

===================================
```

## 📡 API Endpoints

### POST /alert

Receives webhook from Prometheus Alertmanager and triggers the AI workflow.

**Request Body:** Prometheus alert format

**Response:**
```json
{
  "success": true,
  "message": "Alert received and processed with AI",
  "incidentId": "1778934013959",
  "aiAnalysis": {
    "rootCause": "Null pointer exception in /users endpoint...",
    "confidence": 0.85,
    "affectedFiles": ["src/routes/users.js", "src/middleware/errorHandler.js"]
  },
  "fix": {
    "description": "Add null checks and error handling",
    "filesChanged": 2
  },
  "prUrl": "https://github.com/user/repo/pull/123",
  "postmortemGenerated": true
}
```

### GET /incidents

List all incidents sorted by timestamp (newest first).

**Response:**
```json
[
  {
    "id": "1778934013959",
    "timestamp": "2026-05-16T12:20:13.960Z",
    "alertName": "HighErrorRate",
    "severity": "critical",
    "status": "pr_created",
    "rootCause": "Null pointer exception...",
    "fixSuggestion": "Add null checks...",
    "affectedFiles": ["src/routes/users.js"],
    "confidence": 0.85,
    "prUrl": "https://github.com/user/repo/pull/123",
    "postmortemPath": "/path/to/postmortem.pdf"
  }
]
```

### GET /incidents/:id

Get details of a specific incident.

### PATCH /incidents/:id

Update incident status or add notes.

**Request Body:**
```json
{
  "status": "resolved",
  "notes": "Fix merged and deployed"
}
```

### POST /incidents/:id/acknowledge

Acknowledge an incident (marks it as acknowledged with timestamp).

### GET /postmortem/:id

Download PDF postmortem report for an incident.

**Response:** PDF file download

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-16T12:00:00.000Z",
  "uptime": 3600,
  "services": {
    "watsonx": true,
    "github": true,
    "pdf": true
  }
}
```

### GET /config

Get configuration status.

**Response:**
```json
{
  "watsonx": {
    "configured": true,
    "url": "https://us-south.ml.cloud.ibm.com"
  },
  "github": {
    "configured": true,
    "repo": "username/repository",
    "url": "https://github.com/username/repository"
  },
  "monitoring": {
    "monitoredAppPath": "../monitored-app/src"
  }
}
```

## 🤖 AI Workflow

When an alert is received, the system automatically:

1. **📂 Reads Codebase** - Scans all files in monitored-app/src/
2. **🧠 AI Analysis** - Uses IBM watsonx to analyze root cause
3. **🔧 Generate Fix** - AI creates code fixes automatically
4. **📤 Create PR** - Pushes fix to GitHub and creates pull request
5. **📄 Generate PDF** - Creates professional postmortem report
6. **💾 Save Incident** - Stores all data in incidents.json

## 📁 Project Structure

```
autoops-backend/
├── services/
│   ├── watsonx.js      # IBM watsonx AI integration
│   ├── github.js       # GitHub API integration
│   └── pdf.js          # PDF generation service
├── reports/            # Generated PDF postmortems
├── server.js           # Main Express server
├── incidents.json      # Incident database
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

## 🔧 Services

### watsonx.js

Handles all IBM watsonx AI interactions:
- Root cause analysis
- Fix generation
- Code understanding
- Confidence scoring

### github.js

Manages GitHub operations:
- Branch creation
- File commits
- Pull request creation
- Label management

### pdf.js

Generates professional PDF reports:
- Incident summary
- Timeline
- Root cause analysis
- Fix suggestions
- Prevention recommendations

## 🧪 Testing

### Test with Demo Script

```bash
# In a separate terminal, run the demo
cd demo
npm install
node trigger-incident.js
```

### Manual Testing

```bash
# Send a test alert
curl -X POST http://localhost:4000/alert \
  -H "Content-Type: application/json" \
  -d '{
    "receiver": "bob-webhook",
    "status": "firing",
    "alerts": [{
      "status": "firing",
      "labels": {
        "alertname": "HighErrorRate",
        "severity": "critical",
        "service": "monitored-app"
      },
      "annotations": {
        "summary": "High error rate detected",
        "description": "Error rate exceeded threshold"
      }
    }]
  }'

# Check incidents
curl http://localhost:4000/incidents

# Download postmortem (replace ID)
curl http://localhost:4000/postmortem/1778934013959 -o postmortem.pdf
```

## 🐛 Troubleshooting

### watsonx Authentication Error

**Problem:** `Failed to authenticate with IBM Cloud`

**Solution:**
1. Verify your API key is correct
2. Check if your watsonx instance is active
3. Ensure you have proper permissions
4. Try regenerating the API key

### GitHub PR Creation Failed

**Problem:** `Error creating PR: Bad credentials`

**Solution:**
1. Verify your GitHub token has `repo` scope
2. Check if the repository exists
3. Ensure GITHUB_OWNER and GITHUB_REPO are correct
4. Token might be expired - generate a new one

### PDF Generation Failed

**Problem:** `Error generating PDF`

**Solution:**
1. Check if `reports/` directory exists
2. Verify write permissions
3. Ensure pdfkit is installed: `npm install pdfkit`

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9

# Or change PORT in .env
PORT=4001
```

## 📊 Monitoring

Check service health:
```bash
curl http://localhost:4000/health
```

Check configuration:
```bash
curl http://localhost:4000/config
```

View logs:
```bash
# The server logs all operations to console
# Look for these indicators:
# 🚨 Alert received
# 🤖 AI analysis
# 🔧 Fix generation
# 📤 PR creation
# 📄 PDF generation
# ✅ Success
# ❌ Error
```

## 🔐 Security Best Practices

1. **Never commit .env file** - It's in .gitignore
2. **Rotate API keys regularly** - Every 90 days
3. **Use environment-specific tokens** - Different for dev/prod
4. **Limit GitHub token scope** - Only what's needed
5. **Monitor API usage** - Check IBM Cloud dashboard

## 📚 Additional Resources

- [IBM watsonx Documentation](https://www.ibm.com/docs/en/watsonx-as-a-service)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Prometheus Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PDFKit Documentation](https://pdfkit.org/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Verify all environment variables are set
4. Test each service independently

## 📝 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for IBM Bob Hackathon 2026**

**Powered by:** IBM watsonx AI | GitHub API | Node.js | Express