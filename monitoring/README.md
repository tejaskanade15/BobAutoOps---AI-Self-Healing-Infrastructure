# BobAutoOps Monitoring Stack

Complete Prometheus monitoring setup for the BobAutoOps self-healing infrastructure system.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BobAutoOps Monitoring Stack                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │  Monitored   │      │  Prometheus  │      │ Alertmanager │  │
│  │     App      │─────▶│   :9090      │─────▶│    :9093     │  │
│  │   :3000      │      │              │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         │                      │                      │          │
│    /metrics              Scrapes every           Sends webhook  │
│    endpoint              10 seconds              to backend     │
│         │                      │                      │          │
│         │                      ▼                      ▼          │
│         │              ┌──────────────┐      ┌──────────────┐  │
│         │              │   Grafana    │      │  AutoOps     │  │
│         └─────────────▶│   :3001      │      │  Backend     │  │
│                        │              │      │   :4000      │  │
│                        └──────────────┘      └──────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Components

### 1. Prometheus (Port 9090)
- Scrapes metrics from the monitored app every 10 seconds
- Evaluates alert rules every 15 seconds
- Stores time-series data for 30 days
- Web UI: http://localhost:9090

### 2. Alertmanager (Port 9093)
- Receives alerts from Prometheus
- Routes alerts to appropriate receivers
- Sends webhook notifications to autoops-backend at http://localhost:4000/alert
- Web UI: http://localhost:9093

### 3. Grafana (Port 3001) - Optional
- Visualizes metrics from Prometheus
- Pre-configured dashboards
- Default credentials: admin/admin
- Web UI: http://localhost:3001

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Monitored app running on port 3000
- AutoOps backend running on port 4000 (to receive alerts)

### Start Monitoring Stack

```bash
# Navigate to monitoring directory
cd monitoring

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Stop Monitoring Stack

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears all data)
docker-compose down -v
```

## 📊 Alert Rules

The monitoring stack includes comprehensive alert rules in `alert-rules.yml`:

### Critical Alerts

1. **ApplicationErrorDetected**
   - Triggers when any error occurs
   - Fires after 10 seconds
   - Sends webhook to autoops-backend

2. **HighErrorRate**
   - Triggers when error rate > 5 errors/minute
   - Fires after 30 seconds

3. **DatabaseErrorDetected**
   - Triggers on database connection errors
   - Immediate notification

4. **InternalServerError**
   - Triggers on 500 errors
   - Immediate notification

5. **ApplicationDown**
   - Triggers when app stops responding
   - Fires after 30 seconds

### Warning Alerts

6. **HighResponseTime**
   - Triggers when 95th percentile > 2 seconds
   - Fires after 1 minute

7. **HighMemoryUsage**
   - Triggers when memory > 500MB
   - Fires after 2 minutes

8. **TimeoutErrorDetected**
   - Triggers on timeout errors
   - Fires after 10 seconds

## 🔔 Webhook Payload

When an alert fires, Alertmanager sends a webhook to `http://localhost:4000/alert` with this payload:

```json
{
  "receiver": "bobautoops-webhook",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "ApplicationErrorDetected",
        "severity": "critical",
        "component": "monitored-app",
        "alert_type": "error_detected",
        "error_type": "database_error",
        "route": "/users",
        "status_code": "500"
      },
      "annotations": {
        "summary": "Application error detected in monitored-app",
        "description": "The monitored application has encountered 1 error(s) in the last minute on route /users with error type database_error",
        "action": "Trigger self-healing analysis"
      },
      "startsAt": "2026-05-16T09:00:00.000Z",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "http://prometheus:9090/graph?g0.expr=..."
    }
  ],
  "groupLabels": {
    "alertname": "ApplicationErrorDetected"
  },
  "commonLabels": {
    "alertname": "ApplicationErrorDetected",
    "severity": "critical"
  },
  "commonAnnotations": {
    "summary": "Application error detected in monitored-app"
  },
  "externalURL": "http://alertmanager:9093",
  "version": "4",
  "groupKey": "{}:{alertname=\"ApplicationErrorDetected\"}"
}
```

## 🧪 Testing the Monitoring Stack

### 1. Verify Prometheus is Scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Or visit in browser
open http://localhost:9090/targets
```

### 2. Trigger an Alert

```bash
# Simulate an error in the monitored app
curl "http://localhost:3000/users?errorType=500"

# Wait 10-15 seconds, then check alerts
curl http://localhost:9090/api/v1/alerts

# Or visit in browser
open http://localhost:9090/alerts
```

### 3. Verify Webhook Delivery

Check your autoops-backend logs to see if the webhook was received:

```bash
# The backend should log the incoming alert
# Expected log: "Received alert webhook: ApplicationErrorDetected"
```

### 4. Query Metrics

```bash
# Get current error count
curl 'http://localhost:9090/api/v1/query?query=http_errors_total'

# Get error rate over last 5 minutes
curl 'http://localhost:9090/api/v1/query?query=rate(http_errors_total[5m])'
```

## 📈 Useful Prometheus Queries

### Error Monitoring

```promql
# Total errors
http_errors_total

# Error rate (errors per second)
rate(http_errors_total[5m])

# Errors by type
sum by (error_type) (http_errors_total)

# Errors by route
sum by (route) (http_errors_total)
```

### Performance Monitoring

```promql
# Request rate
rate(http_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### Application Health

```promql
# Application uptime
up{job="bobautoops-monitored-app"}

# Memory usage
process_resident_memory_bytes / 1024 / 1024

# CPU usage
rate(process_cpu_seconds_total[5m])
```

## 🔧 Configuration

### Modify Scrape Interval

Edit `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'bobautoops-monitored-app'
    scrape_interval: 5s  # Change from 10s to 5s
```

### Add New Alert Rules

Edit `alert-rules.yml`:

```yaml
- alert: MyCustomAlert
  expr: my_metric > threshold
  for: 1m
  labels:
    severity: warning
  annotations:
    summary: "Custom alert description"
```

### Change Webhook URL

Edit `alertmanager.yml`:

```yaml
receivers:
  - name: 'bobautoops-webhook'
    webhook_configs:
      - url: 'http://your-backend:port/alert'
```

## 🐛 Troubleshooting

### Prometheus Can't Scrape Monitored App

**Problem:** Targets show as "DOWN" in Prometheus

**Solutions:**
1. Ensure monitored app is running on port 3000
2. Check if `/metrics` endpoint is accessible: `curl http://localhost:3000/metrics`
3. Verify Docker network configuration
4. Check `host.docker.internal` is resolving correctly

### Alerts Not Firing

**Problem:** Errors occur but no alerts fire

**Solutions:**
1. Check alert rules syntax: `docker-compose exec prometheus promtool check rules /etc/prometheus/alert-rules.yml`
2. Verify metrics are being collected: Visit http://localhost:9090/graph
3. Check evaluation interval in `prometheus.yml`
4. View alert status: http://localhost:9090/alerts

### Webhook Not Received

**Problem:** Alerts fire but backend doesn't receive webhook

**Solutions:**
1. Verify backend is running on port 4000
2. Check backend has `/alert` endpoint
3. View Alertmanager logs: `docker-compose logs alertmanager`
4. Test webhook manually:
   ```bash
   curl -X POST http://localhost:9093/api/v1/alerts \
     -H "Content-Type: application/json" \
     -d '[{"labels":{"alertname":"test"}}]'
   ```

### Grafana Can't Connect to Prometheus

**Problem:** Grafana shows "Data source not found"

**Solutions:**
1. Add Prometheus data source in Grafana
2. URL: `http://prometheus:9090`
3. Access: Server (default)
4. Click "Save & Test"

## 📁 File Structure

```
monitoring/
├── prometheus.yml          # Prometheus configuration
├── alert-rules.yml         # Alert rule definitions
├── alertmanager.yml        # Alertmanager configuration
├── docker-compose.yml      # Docker Compose setup
├── README.md              # This file
└── grafana/               # Grafana provisioning (optional)
    └── provisioning/
        ├── datasources/
        └── dashboards/
```

## 🔗 Useful Links

- **Prometheus UI:** http://localhost:9090
- **Alertmanager UI:** http://localhost:9093
- **Grafana UI:** http://localhost:3001
- **Monitored App:** http://localhost:3000
- **Monitored App Metrics:** http://localhost:3000/metrics
- **AutoOps Backend:** http://localhost:4000

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🎯 Next Steps

1. ✅ Start the monitoring stack
2. ✅ Verify Prometheus is scraping metrics
3. ✅ Test alert firing by triggering errors
4. ✅ Confirm webhook delivery to autoops-backend
5. 🔄 Build the autoops-backend to receive and process alerts
6. 🔄 Implement AI-powered error analysis
7. 🔄 Generate fixes and create GitHub PRs
8. 🔄 Generate postmortem PDFs

---

**For the IBM Bob Hackathon** 🚀