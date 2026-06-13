# BobAutoOps - AI-Powered Self-Healing Infrastructure

**IBM Bob Hackathon 2026** | Built in 48 hours by Team BobAutoOps

An intelligent infrastructure monitoring and self-healing system that automatically detects errors, analyzes root causes, generates fixes, and creates GitHub pull requests — all powered by AI.

---

## 🎯 Project Overview

BobAutoOps is a complete end-to-end solution for automated infrastructure healing:

1. **Monitored Application** - Node.js app with intentional error simulation
2. **Prometheus Monitoring** - Real-time metrics collection and alerting
3. **AI Analysis** - Automated root cause analysis using IBM watsonx
4. **Auto-Fix Generation** - AI-generated code fixes
5. **GitHub Integration** - Automatic PR creation with fixes
6. **Postmortem Reports** - PDF documentation of incidents

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BobAutoOps System                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │  Monitored   │──▶│  Prometheus  │───▶│ Alertmanager │           │
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
│         └─────────▶ │  IBM watsonx │    │    GitHub    │  │ PDF │  │
│                      │  AI Analysis │    │   Auto PR    │  │ Gen │  │
│                      └──────────────┘    └──────────────┘  └─────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Full pipeline:** Error occurs → Prometheus detects → Alertmanager fires webhook → AutoOps backend runs watsonx AI analysis → generates code fix → opens GitHub PR → generates PDF postmortem.

---

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
│   ├── package.json
│   └── README.md
│
├── monitoring/                 # Prometheus monitoring stack
│   ├── prometheus.yml         # Prometheus configuration
│   ├── alert-rules.yml        # 10 alert rule definitions
│   ├── alertmanager.yml       # Alertmanager webhook config
│   ├── docker-compose.yml     # Docker setup
│   └── README.md
│
├── autoops-backend/           # AI-powered self-healing backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── alert.js       # Webhook receiver from Alertmanager
│   │   ├── services/
│   │   │   ├── analyzer.js    # IBM watsonx root cause analysis
│   │   │   ├── fixer.js       # AI fix generation
│   │   │   ├── github.js      # GitHub PR creation
│   │   │   └── postmortem.js  # PDF postmortem generation
│   │   └── app.js
│   └── package.json
│
├── dashboard/                  # Grafana dashboards (Phase 4)
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- Docker and Docker Compose
- IBM watsonx API access
- GitHub Personal Access Token

### 1. Start the Monitored Application

```bash
cd monitored-app
npm install
npm start
```

App available at http://localhost:3000

### 2. Start the Monitoring Stack

```bash
cd monitoring
docker-compose up -d
docker-compose ps
```

- **Prometheus:** http://localhost:9090
- **Alertmanager:** http://localhost:9093
- **Grafana:** http://localhost:3001 (admin/admin)

### 3. Start the AutoOps Backend

```bash
cd autoops-backend
cp .env.example .env   # fill in your watsonx and GitHub credentials
npm install
npm start
```

Backend available at http://localhost:4000

### 4. Test the Full Pipeline

```bash
# Trigger a 500 error in the monitored app
curl "http://localhost:3000/users?errorType=500"

# Wait ~15 seconds, then check:
# - Prometheus alerts:   http://localhost:9090/alerts
# - Alertmanager:        http://localhost:9093
# - AutoOps incidents:   http://localhost:4000/incidents
# - Your GitHub repo:    check for a new auto-generated PR
```

---

## 🔧 Features

### Phase 1 — Monitoring Foundation ✅

- Express.js REST API with 7 error types for simulation
- Prometheus metrics via `prom-client` (counters, histograms, gauges)
- 10 comprehensive alert rules (critical + warning)
- Alertmanager webhook integration
- Docker Compose deployment

### Phase 2 — AI Backend ✅

- Webhook receiver at `/alert` triggered by Alertmanager
- IBM watsonx AI integration for root cause analysis
- Codebase analyzer (reads all source files for context)
- AI-powered fix generation tailored to the actual codebase
- Incident management system (create, acknowledge, update)

### Phase 3 — Automation ✅

- GitHub API integration for automatic PR creation
- PR includes AI-generated fix + detailed description
- PDF postmortem generation with incident summary
- Full alert → fix → PR pipeline working end-to-end

### Phase 4 — Dashboard (In Progress)

- Custom Grafana dashboards
- Real-time self-healing activity timeline
- PR status tracking

---

## 📊 Available Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests by method, route, status |
| `http_request_duration_seconds` | Histogram | Request duration in seconds |
| `http_errors_total` | Counter | Total errors by type, route, status |
| `app_info` | Gauge | Application metadata (version, name, env) |
| `process_*` | Various | Node.js process metrics (CPU, memory) |

---

## 🚨 Alert Rules

### Critical (Immediate Trigger)

| Alert | Condition |
|-------|-----------|
| ApplicationErrorDetected | Any error occurs |
| HighErrorRate | > 5 errors/minute |
| DatabaseErrorDetected | DB connection issues |
| InternalServerError | 500 errors |
| ServiceUnavailable | 503 errors |
| ApplicationDown | App stops responding |

### Warning (Monitor)

| Alert | Condition |
|-------|-----------|
| HighResponseTime | 95th percentile > 2s |
| HighMemoryUsage | Memory > 500MB |
| TimeoutErrorDetected | Request timeouts |
| ErrorRateThresholdExceeded | Error rate > 10% |

---

## 🧪 Error Simulation

```bash
curl "http://localhost:3000/users?errorType=500"       # Internal Server Error
curl "http://localhost:3000/users?errorType=db"        # Database Error
curl "http://localhost:3000/users?errorType=timeout"   # Timeout
curl "http://localhost:3000/users?errorType=503"       # Service Unavailable
curl "http://localhost:3000/users?errorType=404"       # Not Found
curl "http://localhost:3000/users?errorType=validation"# Validation Error
curl "http://localhost:3000/users?errorType=auth"      # Auth Error
```

---

## 🔗 API Reference

### Monitored App (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check + uptime |
| `/metrics` | GET | Prometheus metrics |
| `/users` | GET | User list (supports error simulation) |
| `/users/:id` | GET | Get user by ID |
| `/users/errors/types` | GET | List available error types |

### AutoOps Backend (Port 4000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/alert` | POST | Webhook receiver (triggers full AI pipeline) |
| `/incidents` | GET | List all incidents |
| `/incidents/:id` | GET | Incident details |
| `/incidents/:id` | PATCH | Update incident status |
| `/incidents/:id/acknowledge` | POST | Acknowledge incident |
| `/postmortem/:id` | GET | Download PDF postmortem |
| `/health` | GET | Service health check |
| `/config` | GET | Config status (watsonx, GitHub) |

---

## ⚙️ Environment Variables

### Monitored App

```env
PORT=3000
NODE_ENV=development
APP_NAME=BobAutoOps-Monitored-App
APP_VERSION=1.0.0
LOG_LEVEL=info
```

### AutoOps Backend

```env
PORT=4000
NODE_ENV=development

# IBM watsonx (required)
WATSONX_API_KEY=your_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# GitHub (required for PR automation)
GITHUB_TOKEN=your_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main

# Path to monitored app source
MONITORED_APP_PATH=../monitored-app/src
```

See [SETUP.md](./SETUP.md) for full configuration guide.

---

## 🗺️ Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 — Monitoring Foundation | ✅ Complete | Prometheus, Alertmanager, Docker |
| Phase 2 — AI Backend | ✅ Complete | watsonx integration, incident management |
| Phase 3 — Automation | ✅ Complete | GitHub PR auto-creation, PDF postmortem |
| Phase 4 — Dashboard | 🔄 In Progress | Grafana, real-time UI |
| Phase 5 — Enhancements | 🔜 Planned | Slack notifications, rollback, multi-language |

---

## 🛠️ Troubleshooting

**App won't start**
```bash
netstat -ano | findstr :3000   # check if port is in use
```

**Prometheus can't scrape metrics**
```bash
curl http://localhost:3000/metrics
docker network inspect monitoring_bobautoops-network
```

**Alerts not firing**
```bash
docker-compose exec prometheus promtool check rules /etc/prometheus/alert-rules.yml
docker-compose logs prometheus
```

---

## 👥 Team

**BobAutoOps** — IBM Bob Hackathon 2026 (lablab.ai)  
Certificate ID: `CMQAZMJC703BPS601RWEO5HTT`

## 📝 License

MIT License

## 🙏 Acknowledgments

- [IBM watsonx](https://www.ibm.com/products/watsonx-ai) for AI capabilities
- [Prometheus](https://prometheus.io) for monitoring
- [lablab.ai](https://lablab.ai) for organizing IBM Bob Hackathon 2026
