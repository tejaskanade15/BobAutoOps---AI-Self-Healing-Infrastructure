# 🚀 BobAutoOps - Complete Setup Guide

This guide will walk you through setting up the complete BobAutoOps AI-powered self-healing infrastructure system.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** >= 16.0.0 ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))

### Required Accounts & Credentials

1. **IBM watsonx Account** (for AI features)
   - Sign up: https://www.ibm.com/products/watsonx-ai
   - Free tier available for testing

2. **GitHub Personal Access Token** (for PR automation)
   - Create: https://github.com/settings/tokens
   - Required scopes: `repo`, `workflow`

## Quick Start

### 1️⃣ Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/bob-autoops.git
cd bob-autoops

# Install all dependencies
npm install --prefix monitored-app
npm install --prefix autoops-backend
npm install --prefix demo
```

### 2️⃣ Configure Environment

```bash
# Setup monitored app
cd monitored-app
cp .env.example .env
# Edit .env if needed (defaults work fine)

# Setup autoops backend
cd ../autoops-backend
cp .env.example .env
# IMPORTANT: Edit .env with your credentials
nano .env
```

**Required in autoops-backend/.env:**
```env
WATSONX_API_KEY=your_watsonx_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=bob-autoops
```

### 3️⃣ Start Services

```bash
# Terminal 1: Start monitored application
cd monitored-app
npm start

# Terminal 2: Start monitoring stack
cd monitoring
docker-compose up -d

# Terminal 3: Start AutoOps backend
cd autoops-backend
npm start
```

### 4️⃣ Verify Everything Works

```bash
# Check monitored app
curl http://localhost:3000/health

# Check Prometheus
open http://localhost:9090

# Check AutoOps backend
curl http://localhost:4000/health

# Trigger a test incident
cd demo
npm install
node trigger-incident.js
```

## Detailed Setup

### Step 1: Get IBM watsonx Credentials

1. **Create IBM Cloud Account**
   - Go to https://cloud.ibm.com/
   - Sign up (free tier available)

2. **Create watsonx.ai Instance**
   - Navigate to **Catalog** → **AI / Machine Learning**
   - Select **watsonx.ai**
   - Choose **Lite** plan (free)
   - Click **Create**

3. **Get API Key**
   - Go to **Manage** → **Access (IAM)**
   - Click **API keys** → **Create**
   - Name it "BobAutoOps"
   - Copy the API key immediately

4. **Get Project ID**
   - Go to your watsonx.ai instance
   - Click **Launch watsonx.ai**
   - Create a new project or select existing
   - Copy the Project ID from project settings

### Step 2: Get GitHub Token

1. **Generate Token**
   - Go to https://github.com/settings/tokens
   - Click **Generate new token (classic)**
   - Name: "BobAutoOps Automation"

2. **Select Scopes**
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows

3. **Generate and Copy**
   - Click **Generate token**
   - Copy immediately (you won't see it again!)

### Step 3: Configure Monitored App

```bash
cd monitored-app
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development
APP_NAME=BobAutoOps-Monitored-App
APP_VERSION=1.0.0
LOG_LEVEL=info
```

Install dependencies:
```bash
npm install
```

Start the app:
```bash
npm start
```

Verify:
```bash
curl http://localhost:3000/health
# Should return: {"status":"healthy","uptime":...}
```

### Step 4: Configure Monitoring Stack

```bash
cd monitoring
```

The monitoring stack includes:
- **Prometheus** (Port 9090) - Metrics collection
- **Alertmanager** (Port 9093) - Alert routing
- **Grafana** (Port 3001) - Visualization

Start monitoring:
```bash
docker-compose up -d
```

Verify:
```bash
docker-compose ps
# All services should be "Up"

# Check Prometheus
curl http://localhost:9090/-/healthy

# Check Alertmanager
curl http://localhost:9093/-/healthy
```

Access UIs:
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093
- Grafana: http://localhost:3001 (admin/admin)

### Step 5: Configure AutoOps Backend

```bash
cd autoops-backend
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=4000
NODE_ENV=development

# IBM watsonx (REQUIRED)
WATSONX_API_KEY=your_actual_api_key_here
WATSONX_PROJECT_ID=your_actual_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# GitHub (REQUIRED for PR creation)
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=bob-autoops
GITHUB_BRANCH=main

# Monitored App Path
MONITORED_APP_PATH=../monitored-app/src
```

Install dependencies:
```bash
npm install
```

Start the backend:
```bash
npm start
```

You should see:
```
🚀 ===================================
   BobAutoOps Backend Server Started
   ===================================
   Port: 4000

🤖 AI Services:
   IBM watsonx: ✅ Configured
   GitHub:      ✅ Configured
   PDF Gen:     ✅ Ready
===================================
```

## Configuration

### Environment Variables Reference

#### Monitored App (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Application port |
| NODE_ENV | No | development | Environment |
| APP_NAME | No | BobAutoOps-Monitored-App | App name |
| APP_VERSION | No | 1.0.0 | App version |
| LOG_LEVEL | No | info | Logging level |

#### AutoOps Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 4000 | Backend port |
| NODE_ENV | No | development | Environment |
| WATSONX_API_KEY | **YES** | - | IBM watsonx API key |
| WATSONX_PROJECT_ID | **YES** | - | watsonx project ID |
| WATSONX_URL | No | https://us-south.ml.cloud.ibm.com | watsonx endpoint |
| GITHUB_TOKEN | **YES** | - | GitHub PAT |
| GITHUB_OWNER | **YES** | - | GitHub username |
| GITHUB_REPO | **YES** | - | Repository name |
| GITHUB_BRANCH | No | main | Base branch |

### Prometheus Configuration

Edit `monitoring/prometheus.yml` to adjust:
- Scrape interval (default: 10s)
- Target endpoints
- Alert evaluation interval

### Alert Rules

Edit `monitoring/alert-rules.yml` to customize:
- Alert thresholds
- Alert severity
- Alert descriptions

## Testing

### Test 1: Basic Health Checks

```bash
# Monitored app
curl http://localhost:3000/health

# AutoOps backend
curl http://localhost:4000/health

# Prometheus
curl http://localhost:9090/-/healthy
```

### Test 2: Trigger Error Manually

```bash
# Trigger a 500 error
curl "http://localhost:3000/users?errorType=500"

# Wait 10-15 seconds for alert to fire
# Check Prometheus alerts
open http://localhost:9090/alerts

# Check incidents
curl http://localhost:4000/incidents
```

### Test 3: Use Demo Script

```bash
cd demo
npm install
node trigger-incident.js
```

This will:
1. Send a test alert to the backend
2. Trigger AI analysis
3. Generate a fix
4. Create a GitHub PR (if configured)
5. Generate a PDF postmortem

### Test 4: Download Postmortem

```bash
# Get incident ID from incidents list
curl http://localhost:4000/incidents

# Download PDF (replace ID)
curl http://localhost:4000/postmortem/1778934013959 -o postmortem.pdf

# Open the PDF
open postmortem.pdf  # Mac
start postmortem.pdf # Windows
xdg-open postmortem.pdf # Linux
```

### Test 5: Verify GitHub PR

If GitHub is configured:
1. Go to your repository
2. Check the **Pull Requests** tab
3. You should see an auto-generated PR with:
   - Title: "🤖 AutoFix: [AlertName]"
   - Description with incident details
   - Code changes
   - Labels: `autofix`, `bot`, `severity:critical`

## Troubleshooting

### Issue: Monitored App Won't Start

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Issue: Docker Services Won't Start

**Error:** `Cannot connect to Docker daemon`

**Solution:**
1. Start Docker Desktop
2. Wait for it to fully start
3. Try again: `docker-compose up -d`

### Issue: watsonx Authentication Failed

**Error:** `Failed to authenticate with IBM Cloud`

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Check if watsonx instance is active
3. Ensure you have proper IAM permissions
4. Try regenerating the API key
5. Check if you're using the correct region URL

### Issue: GitHub PR Creation Failed

**Error:** `Bad credentials` or `Not Found`

**Solutions:**
1. Verify token has `repo` scope
2. Check GITHUB_OWNER and GITHUB_REPO are correct
3. Ensure repository exists and you have write access
4. Token might be expired - generate new one
5. Check if repository is private (token needs access)

### Issue: Prometheus Can't Scrape Metrics

**Error:** Targets down in Prometheus

**Solutions:**
1. Verify monitored app is running: `curl http://localhost:3000/metrics`
2. Check Docker network: `docker network ls`
3. On Windows, use `host.docker.internal` instead of `localhost` in prometheus.yml
4. Restart monitoring stack: `docker-compose restart`

### Issue: Alerts Not Firing

**Solutions:**
1. Check alert rules syntax:
   ```bash
   docker-compose exec prometheus promtool check rules /etc/prometheus/alert-rules.yml
   ```
2. View Prometheus logs:
   ```bash
   docker-compose logs prometheus
   ```
3. Verify metrics are being collected:
   - Go to http://localhost:9090
   - Query: `http_errors_total`
4. Check alert evaluation interval in prometheus.yml

### Issue: PDF Generation Failed

**Error:** `Cannot write to reports directory`

**Solutions:**
1. Check if `autoops-backend/reports/` exists
2. Verify write permissions
3. Manually create directory: `mkdir autoops-backend/reports`
4. Reinstall pdfkit: `npm install pdfkit`

## Advanced Configuration

### Custom Alert Rules

Add new alerts in `monitoring/alert-rules.yml`:

```yaml
- alert: CustomAlert
  expr: your_metric > threshold
  for: 1m
  labels:
    severity: warning
  annotations:
    summary: "Custom alert fired"
    description: "Your custom description"
```

### Multiple Monitored Apps

To monitor multiple applications:

1. Update `monitoring/prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'app1'
    static_configs:
      - targets: ['localhost:3000']
  - job_name: 'app2'
    static_configs:
      - targets: ['localhost:3001']
```

2. Update alert rules to specify job labels

### Custom AI Models

To use different watsonx models, edit `autoops-backend/services/watsonx.js`:

```javascript
this.model = 'ibm/granite-20b-code-instruct'; // or other models
```

## Production Deployment

### Security Checklist

- [ ] Use strong, unique API keys
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Use secrets management (AWS Secrets Manager, etc.)
- [ ] Enable rate limiting
- [ ] Set up monitoring alerts
- [ ] Regular security audits
- [ ] Rotate credentials every 90 days

### Performance Optimization

1. **Increase scrape intervals** for production
2. **Use persistent storage** for Prometheus data
3. **Set up log aggregation** (ELK, Splunk)
4. **Enable caching** for AI responses
5. **Use load balancers** for high availability

### Backup Strategy

```bash
# Backup incidents
cp autoops-backend/incidents.json backups/incidents-$(date +%Y%m%d).json

# Backup Prometheus data
docker-compose exec prometheus tar -czf /tmp/prometheus-data.tar.gz /prometheus

# Backup PDF reports
tar -czf reports-backup.tar.gz autoops-backend/reports/
```

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test with demo script
3. ✅ Trigger real errors and verify AI analysis
4. ✅ Review generated PRs and postmortems
5. ✅ Customize alert rules for your needs
6. ✅ Set up production deployment
7. ✅ Monitor and iterate

## Support & Resources

- **Documentation:** See README.md files in each directory
- **IBM watsonx Docs:** https://www.ibm.com/docs/en/watsonx-as-a-service
- **Prometheus Docs:** https://prometheus.io/docs/
- **GitHub API Docs:** https://docs.github.com/en/rest

## Contributing

Found a bug or want to contribute? Please open an issue or PR!

---

**🎉 Congratulations!** You now have a fully functional AI-powered self-healing infrastructure system!

**Built for IBM Bob Hackathon 2026** 🚀