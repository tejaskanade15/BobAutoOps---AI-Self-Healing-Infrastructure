# BobAutoOps - Quick Start Guide

Get the BobAutoOps self-healing infrastructure system up and running in 5 minutes!

## 🚀 Prerequisites Check

Before starting, ensure you have:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Git installed (`git --version`)

## 📦 Step 1: Install Monitored App Dependencies

```bash
# Navigate to the monitored app directory
cd monitored-app

# Install dependencies
npm install

# This should install:
# - express (web framework)
# - prom-client (Prometheus metrics)
# - dotenv (environment variables)
```

## ▶️ Step 2: Start the Monitored Application

```bash
# Still in monitored-app directory
npm start

# You should see:
# 🚀 BobAutoOps-Monitored-App v1.0.0
# 📡 Server running on port 3000
# ✅ All endpoints listed
```

**Keep this terminal open!** The app needs to stay running.

## ✅ Step 3: Verify the App is Working

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test users endpoint
curl http://localhost:3000/users

# Test metrics endpoint
curl http://localhost:3000/metrics
```

All should return JSON responses (except /metrics which returns Prometheus format).

## 🐳 Step 4: Start the Monitoring Stack

Open a new terminal:

```bash
# Navigate to monitoring directory
cd monitoring

# Start Prometheus, Alertmanager, and Grafana
docker-compose up -d

# Wait for containers to start (about 30 seconds)
docker-compose ps

# You should see 3 services running:
# - bobautoops-prometheus (port 9090)
# - bobautoops-alertmanager (port 9093)
# - bobautoops-grafana (port 3001)
```

## 🔍 Step 5: Verify Monitoring is Working

### Check Prometheus

1. Open browser: http://localhost:9090
2. Go to Status → Targets
3. Verify `bobautoops-monitored-app` target is **UP** (green)

### Check Metrics are Being Collected

1. In Prometheus UI, go to Graph tab
2. Enter query: `http_requests_total`
3. Click "Execute"
4. You should see metrics data

## 🚨 Step 6: Test Error Detection

### Trigger an Error

```bash
# Simulate a 500 Internal Server Error
curl "http://localhost:3000/users?errorType=500"

# You should get an error response
```

### Verify Alert Fires

1. Wait 10-15 seconds
2. Open Prometheus: http://localhost:9090/alerts
3. You should see **ApplicationErrorDetected** alert in FIRING state (red)

### Check Alertmanager

1. Open Alertmanager: http://localhost:9093
2. You should see the alert listed
3. The webhook would be sent to http://localhost:4000/alert (backend not running yet)

## 📊 Step 7: Explore Grafana (Optional)

1. Open Grafana: http://localhost:3001
2. Login with: `admin` / `admin`
3. Skip password change (or set a new one)
4. Add Prometheus data source:
   - Configuration → Data Sources → Add data source
   - Select Prometheus
   - URL: `http://prometheus:9090`
   - Click "Save & Test"

## 🧪 Step 8: Test Different Error Types

Try all error types:

```bash
# Database error
curl "http://localhost:3000/users?errorType=db"

# Timeout error
curl "http://localhost:3000/users?errorType=timeout"

# Service unavailable
curl "http://localhost:3000/users?errorType=503"

# Not found
curl "http://localhost:3000/users?errorType=404"

# Validation error
curl "http://localhost:3000/users?errorType=validation"

# Auth error
curl "http://localhost:3000/users?errorType=auth"
```

After each error, check:
- Prometheus alerts: http://localhost:9090/alerts
- Alertmanager: http://localhost:9093

## 📈 Step 9: Monitor Metrics

### Useful Prometheus Queries

In Prometheus UI (http://localhost:9090/graph):

```promql
# Total errors
http_errors_total

# Error rate (errors per second)
rate(http_errors_total[5m])

# Errors by type
sum by (error_type) (http_errors_total)

# Request rate
rate(http_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## 🛑 Stopping Everything

### Stop Monitored App
In the terminal running the app, press `Ctrl+C`

### Stop Monitoring Stack
```bash
cd monitoring
docker-compose down

# To also remove volumes (clears all data):
docker-compose down -v
```

## 🔄 Restarting

### Start Everything Again
```bash
# Terminal 1: Monitored App
cd monitored-app
npm start

# Terminal 2: Monitoring Stack
cd monitoring
docker-compose up -d
```

## 🐛 Troubleshooting

### Problem: Port 3000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Or change port in monitored-app/.env
PORT=3001
```

### Problem: Docker containers won't start

**Solution:**
```bash
# Check Docker is running
docker ps

# View logs
cd monitoring
docker-compose logs

# Restart Docker Desktop (Windows/Mac)
```

### Problem: Prometheus shows target as DOWN

**Solution:**
1. Verify monitored app is running: `curl http://localhost:3000/health`
2. Check Docker network: `docker network ls`
3. Restart monitoring stack: `docker-compose restart`

### Problem: No metrics showing in Prometheus

**Solution:**
1. Check metrics endpoint: `curl http://localhost:3000/metrics`
2. Verify Prometheus config: `docker-compose exec prometheus cat /etc/prometheus/prometheus.yml`
3. Check Prometheus logs: `docker-compose logs prometheus`

### Problem: Alerts not firing

**Solution:**
1. Trigger multiple errors: `for i in {1..5}; do curl "http://localhost:3000/users?errorType=500"; done`
2. Wait 15-20 seconds
3. Check alert rules: `docker-compose exec prometheus promtool check rules /etc/prometheus/alert-rules.yml`
4. View Prometheus logs: `docker-compose logs prometheus`

## ✅ Success Checklist

- [ ] Monitored app running on port 3000
- [ ] Can access http://localhost:3000/health
- [ ] Can access http://localhost:3000/metrics
- [ ] Prometheus running on port 9090
- [ ] Prometheus shows target as UP
- [ ] Can query metrics in Prometheus
- [ ] Alertmanager running on port 9093
- [ ] Errors trigger alerts
- [ ] Alerts appear in Prometheus and Alertmanager
- [ ] Grafana accessible on port 3001 (optional)

## 🎯 Next Steps

Once everything is working:

1. **Build the AutoOps Backend** (Phase 2)
   - Create webhook receiver at http://localhost:4000/alert
   - Integrate IBM watsonx for AI analysis
   - Implement codebase analyzer
   - Generate fixes and create GitHub PRs

2. **Create Custom Dashboards**
   - Build Grafana dashboards
   - Visualize error trends
   - Track self-healing activities

3. **Test End-to-End Flow**
   - Trigger error → Alert fires → Backend analyzes → Fix generated → PR created

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Monitored App Details](./monitored-app/README.md)
- [Monitoring Stack Details](./monitoring/README.md)
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs: `docker-compose logs` or check terminal output
3. Verify all prerequisites are installed
4. Ensure no port conflicts (3000, 9090, 9093, 3001)

---

**You're now ready to build the AI-powered self-healing backend!** 🚀

**Current Status:** Phase 1 Complete ✅
**Next:** Build AutoOps Backend (Phase 2)