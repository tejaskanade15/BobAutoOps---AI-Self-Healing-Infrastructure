# BobAutoOps - AI-Powered Self-Healing Infrastructure

**IBM Bob Hackathon 2026**

An intelligent infrastructure monitoring and self-healing system that automatically detects errors, analyzes root causes, generates fixes, and creates GitHub pull requests - all powered by AI.

## 🎯 Project Overview

BobAutoOps is a complete end-to-end solution for automated infrastructure healing:

1. **Monitored Application** - Node.js app with intentional error simulation
2. **Prometheus Monitoring** - Real-time metrics collection and alerting
3. **AI Analysis** - Automated root cause analysis using IBM watsonx
4. **Auto-Fix Generation** - AI-generated code fixes
5. **GitHub Integration** - Automatic PR creation with fixes
6. **Postmortem Reports** - PDF documentation of incidents

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BobAutoOps System                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │  Monitored   │───▶│  Prometheus  │───▶│ Alertmanager │          │
│  │     App      │    │   Scrapes    │    │   Detects    │           │
│  │   :3000      │    │   Metrics    │    │   Errors     │           │
│  └──────────────┘    └──────────────┘    └──────┬───────┘           │
│         │                                         │                 │
│         │                                         │ Webhook         │
│         │                                         ▼                 │
│         │                                 ┌──────────────┐          │
│         │                                 │   AutoOps    │          │
│         │                                 │   Backend    │          │
│         │                                 │   :4000      │          │
│         │                                 └──────┬───────┘          │
│         │                                         │                 │
│         │                    ┌────────────────────┼────────────┐    │
│         │                    │                    │            │    │
│         │                    ▼                    ▼            ▼    │
│         │            ┌──────────────┐    ┌──────────────┐  ┌─────┐  │
│         └──────────▶│  IBM watsonx │    │    GitHub    │  │ PDF │  │
│                      │  AI Analysis │    │   Auto PR    │  │ Gen │  │
│                      └──────────────┘    └──────────────┘  └─────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
bob-autoops/
├── monitored-app/              # Node.js application with error simulation
│   ├── src/
│   │   ├── app.js             # Express application
│   │   ├── config/            # Configuration management
│   │   ├── middleware/        # Prometheus metrics & error handling
│   │   ├── routes/            # API endpoints (/users, /health, /metrics)
│   │   └── utils/             # Error simulation utilities
│   ├── index.js               # Application entry point
│   ├── package.json           # Dependencies
│   └── README.md              # App documentation
│
├── monitoring/                 # Prometheus monitoring stack
│   ├── prometheus.yml         # Prometheus configuration
│   ├── alert-rules.yml        # Alert rule definitions
│   ├── alertmanager.yml       # Alertmanager webhook config
│   ├── docker-compose.yml     # Docker setup for monitoring
│   └── README.md              # Monitoring documentation
│
├── autoops-backend/           # AI-powered backend (TODO)
│   ├── src/
│   │   ├── routes/
│   │   │   └── alert.js       # Webhook receiver
│   │   ├── services/
│   │   │   ├── analyzer.js    # AI root cause analysis
│   │   │   ├── fixer.js       # AI fix generation
│   │   │   ├── github.js      # GitHub PR creation
│   │   │   └── postmortem.js  # PDF generation
│   │   └── app.js
│   └── package.json
│
├── dashboard/                  # Monitoring dashboard (TODO)
│   └── grafana/               # Grafana dashboards
│
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- Docker and Docker Compose
- Git
- IBM watsonx API access (for AI features)
- GitHub Personal Access Token (for PR creation)

### 1. Start the Monitored Application

```bash
# Navigate to monitored-app
cd monitored-app

# Install dependencies
npm install

# Start the application
npm start
```

The app will be available at http://localhost:3000

### 2. Start the Monitoring Stack

```bash
# Navigate to monitoring directory
cd monitoring

# Start Prometheus, Alertmanager, and Grafana
docker-compose up -d

# Verify services are running
docker-compose ps
```

Access the monitoring tools:
- **Prometheus:** http://localhost:9090
- **Alertmanager:** http://localhost:9093
- **Grafana:** http://localhost:3001 (admin/admin)

### 3. Test Error Detection

```bash
# Trigger an error in the monitored app
curl "http://localhost:3000/users?errorType=500"

# Wait 10-15 seconds, then check Prometheus alerts
open http://localhost:9090/alerts

# Check Alertmanager
open http://localhost:9093
```

## 🔧 Features

### ✅ Completed

#### Monitored Application
- ✅ Express.js REST API with multiple endpoints
- ✅ Prometheus metrics integration (prom-client)
- ✅ Comprehensive error simulation (7 error types)
- ✅ Health check endpoint
- ✅ Request/error tracking middleware
- ✅ Detailed error logging

#### Monitoring Stack
- ✅ Prometheus configuration with 10s scrape interval
- ✅ 10 comprehensive alert rules
- ✅ Alertmanager webhook integration
- ✅ Docker Compose setup for easy deployment
- ✅ Grafana for visualization (optional)

### ✅ Completed - Phase 2

#### AutoOps Backend
- [x] Webhook receiver endpoint (/alert)
- [x] IBM watsonx integration for AI analysis
- [x] Codebase analyzer (reads all files)
- [x] Root cause identification
- [x] AI-powered fix generation
- [x] GitHub API integration
- [x] Automatic PR creation
- [x] PDF postmortem generation (professional reports)

#### Dashboard
- [ ] Custom Grafana dashboards
- [ ] Real-time error visualization
- [ ] Self-healing activity timeline
- [ ] PR status tracking

## 📊 Available Metrics

The monitored app exposes these Prometheus metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests by method, route, status |
| `http_request_duration_seconds` | Histogram | Request duration in seconds |
| `http_errors_total` | Counter | Total errors by type, route, status |
| `app_info` | Gauge | Application metadata (version, name, env) |
| `process_*` | Various | Node.js process metrics (CPU, memory, etc.) |

## 🚨 Alert Rules

### Critical Alerts (Immediate Action)

1. **ApplicationErrorDetected** - Any error occurs
2. **HighErrorRate** - More than 5 errors/minute
3. **DatabaseErrorDetected** - Database connection issues
4. **InternalServerError** - 500 errors
5. **ServiceUnavailable** - 503 errors
6. **ApplicationDown** - App stops responding

### Warning Alerts (Monitor)

7. **HighResponseTime** - 95th percentile > 2s
8. **HighMemoryUsage** - Memory > 500MB
9. **TimeoutErrorDetected** - Request timeouts
10. **ErrorRateThresholdExceeded** - Error rate > 10%

## 🧪 Testing Error Simulation

The monitored app supports intentional error simulation via query parameters:

```bash
# 500 Internal Server Error
curl "http://localhost:3000/users?errorType=500"

# Database Connection Error
curl "http://localhost:3000/users?errorType=db"

# Timeout Error
curl "http://localhost:3000/users?errorType=timeout"

# Service Unavailable (503)
curl "http://localhost:3000/users?errorType=503"

# Not Found (404)
curl "http://localhost:3000/users?errorType=404"

# Validation Error (400)
curl "http://localhost:3000/users?errorType=validation"

# Authentication Error (401)
curl "http://localhost:3000/users?errorType=auth"
```

## 📈 Monitoring Workflow

1. **Error Occurs** → User triggers error or real error happens
2. **Metrics Collected** → Prometheus scrapes `/metrics` endpoint
3. **Alert Evaluated** → Alert rules check for error conditions
4. **Alert Fires** → Prometheus sends alert to Alertmanager
5. **Webhook Sent** → Alertmanager sends webhook to autoops-backend
6. **AI Analysis** → Backend analyzes codebase and identifies root cause
7. **Fix Generated** → AI generates code fix
8. **PR Created** → Automatic GitHub PR with fix
9. **Postmortem** → PDF report generated

## 🔗 API Endpoints

### Monitored App (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information |
| `/health` | GET | Health check with uptime |
| `/metrics` | GET | Prometheus metrics |
| `/users` | GET | User list (supports error simulation) |
| `/users/:id` | GET | Get user by ID |
| `/users/errors/types` | GET | Available error types |

### AutoOps Backend (Port 4000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/alert` | POST | Webhook receiver from Alertmanager (triggers AI workflow) |
| `/incidents` | GET | List all incidents |
| `/incidents/:id` | GET | Get specific incident details |
| `/incidents/:id` | PATCH | Update incident status |
| `/incidents/:id/acknowledge` | POST | Acknowledge an incident |
| `/postmortem/:id` | GET | Download PDF postmortem report |
| `/health` | GET | Health check and service status |
| `/config` | GET | Configuration status (watsonx, GitHub, etc.) |

## 🛠️ Development

### Environment Variables

#### Monitored App (.env)
```env
PORT=3000
NODE_ENV=development
APP_NAME=BobAutoOps-Monitored-App
APP_VERSION=1.0.0
LOG_LEVEL=info
```

#### AutoOps Backend (.env)
```env
PORT=4000
NODE_ENV=development

# IBM watsonx AI (REQUIRED)
WATSONX_API_KEY=your_watsonx_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# GitHub (REQUIRED for PR automation)
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main

# Monitored Application Path
MONITORED_APP_PATH=../monitored-app/src
```

**Setup Instructions:** See [SETUP.md](./SETUP.md) for detailed configuration guide.

### Running in Development

```bash
# Terminal 1: Monitored App
cd monitored-app
npm run dev

# Terminal 2: Monitoring Stack
cd monitoring
docker-compose up

# Terminal 3: AutoOps Backend (TODO)
cd autoops-backend
npm run dev
```

## 📚 Documentation

- [Complete Setup Guide](./SETUP.md) - **START HERE**
- [AutoOps Backend Documentation](./autoops-backend/README.md)
- [Monitored App Documentation](./monitored-app/README.md)
- [Monitoring Stack Documentation](./monitoring/README.md)

## 🎓 Learning Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [IBM watsonx Documentation](https://www.ibm.com/products/watsonx-ai)
- [GitHub API Documentation](https://docs.github.com/en/rest)

## 🐛 Troubleshooting

### Monitored App Issues

**Problem:** App won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process or change PORT in .env
```

### Monitoring Issues

**Problem:** Prometheus can't scrape metrics
```bash
# Verify metrics endpoint
curl http://localhost:3000/metrics

# Check Docker network
docker network inspect monitoring_bobautoops-network
```

**Problem:** Alerts not firing
```bash
# Check alert rules syntax
docker-compose exec prometheus promtool check rules /etc/prometheus/alert-rules.yml

# View Prometheus logs
docker-compose logs prometheus
```

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Monitored application with error simulation
- [x] Prometheus metrics integration
- [x] Alert rules configuration
- [x] Alertmanager webhook setup
- [x] Docker Compose deployment

### Phase 2: AI Backend ✅ COMPLETE
- [x] Webhook receiver implementation
- [x] IBM watsonx integration
- [x] Codebase analysis engine
- [x] Root cause identification
- [x] AI-powered fix generation

### Phase 3: Automation ✅ COMPLETE
- [x] GitHub API integration
- [x] Automatic PR creation
- [x] Postmortem PDF generation
- [ ] Code review automation (future)
- [ ] Notification system (future)

### Phase 4: Dashboard 📊
- [ ] Custom Grafana dashboards
- [ ] Real-time monitoring UI
- [ ] Self-healing activity log
- [ ] Performance analytics

### Phase 5: Enhancement 🚀
- [ ] Multi-language support
- [ ] Advanced AI models
- [ ] Rollback capabilities
- [ ] A/B testing integration
- [ ] Slack/Teams notifications

## 👥 Team

BobAutoOps Team - IBM Bob Hackathon 2026

## 📝 License

MIT License

## 🙏 Acknowledgments

- IBM watsonx for AI capabilities
- Prometheus community for monitoring tools
- Express.js for the web framework
- Docker for containerization

---

**Built for the IBM Bob Hackathon 2026** 🚀

**Status:** Phase 1 Complete ✅ | Phase 2 Complete ✅ | Phase 3 Complete ✅

## 🎉 All Core Features Implemented!

The project now includes:
- ✅ Real IBM watsonx AI integration for root cause analysis
- ✅ AI-powered automatic fix generation
- ✅ GitHub PR automation with detailed descriptions
- ✅ Professional PDF postmortem reports
- ✅ Complete incident management system
- ✅ Full monitoring stack with Prometheus & Alertmanager

**Ready for production use!** See [SETUP.md](./SETUP.md) for configuration instructions.
