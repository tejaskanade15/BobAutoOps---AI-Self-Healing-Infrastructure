# BobAutoOps Monitored Application

AI-powered self-healing infrastructure monitored application for the IBM Bob Hackathon.

## 🎯 Overview

This is a Node.js Express application designed to be monitored by Prometheus. It includes intentional error simulation capabilities for demonstrating the self-healing infrastructure system.

## 🏗️ Architecture

```
monitored-app/
├── index.js                    # Application entry point
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
├── README.md                   # This file
└── src/
    ├── app.js                  # Express app configuration
    ├── config/
    │   └── index.js            # Configuration management
    ├── middleware/
    │   ├── metrics.js          # Prometheus metrics collection
    │   └── errorHandler.js     # Global error handling
    ├── routes/
    │   ├── users.js            # Users endpoint with error simulation
    │   ├── health.js           # Health check endpoint
    │   └── metrics.js          # Prometheus metrics endpoint
    └── utils/
        └── errorSimulator.js   # Error simulation utility
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

1. Clone the repository and navigate to the monitored-app directory:
```bash
cd monitored-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Start the application:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📡 API Endpoints

### Root Endpoint
- **GET** `/`
- Returns service information and available endpoints

**Example Response:**
```json
{
  "service": "BobAutoOps-Monitored-App",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "metrics": "/metrics",
    "users": "/users"
  }
}
```

### Health Check
- **GET** `/health`
- Returns application health status and uptime

**Example Response:**
```json
{
  "status": "healthy",
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "timestamp": "2026-05-16T08:00:00.000Z",
  "service": "BobAutoOps-Monitored-App",
  "version": "1.0.0",
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  }
}
```

### Prometheus Metrics
- **GET** `/metrics`
- Returns Prometheus metrics in text format for scraping

**Metrics Tracked:**
- `http_requests_total` - Total HTTP requests (labeled by method, route, status)
- `http_request_duration_seconds` - Request duration histogram
- `http_errors_total` - Total errors (labeled by error type, route, status)
- `app_info` - Application metadata
- Default Node.js metrics (CPU, memory, etc.)

### Users Endpoint
- **GET** `/users`
- Returns list of mock users
- **Supports error simulation via query parameters**

**Normal Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "admin"
    }
  ],
  "timestamp": "2026-05-16T08:00:00.000Z"
}
```

### Get User by ID
- **GET** `/users/:id`
- Returns a specific user by ID
- Also supports error simulation

### Error Types Information
- **GET** `/users/errors/types`
- Returns available error types for simulation

## 🔧 Error Simulation

The `/users` endpoint supports intentional error simulation for testing and demonstration purposes.

### Usage

Add the `errorType` query parameter to trigger specific errors:

```bash
# Simulate 500 Internal Server Error
curl http://localhost:3000/users?errorType=500

# Simulate Database Connection Error
curl http://localhost:3000/users?errorType=db

# Simulate Timeout Error
curl http://localhost:3000/users?errorType=timeout
```

### Available Error Types

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| `500` or `internal` | 500 | Internal Server Error |
| `404` or `notfound` | 404 | Resource Not Found |
| `503` or `unavailable` | 503 | Service Unavailable |
| `db` or `database` | 500 | Database Connection Error |
| `timeout` | 504 | Request Timeout |
| `validation` | 400 | Validation Error |
| `auth` or `unauthorized` | 401 | Authentication Error |

### Error Response Format

```json
{
  "error": {
    "message": "Database Connection Error: Unable to connect to database server",
    "type": "database_error",
    "statusCode": 500,
    "timestamp": "2026-05-16T08:00:00.000Z",
    "path": "/users",
    "method": "GET"
  }
}
```

## 📊 Prometheus Integration

### Configuration

Add this job to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'bobautoops-monitored-app'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

### Metrics Examples

**Query total requests:**
```promql
http_requests_total
```

**Query error rate:**
```promql
rate(http_errors_total[5m])
```

**Query 95th percentile response time:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## 🧪 Testing

### Manual Testing

1. **Test normal operation:**
```bash
curl http://localhost:3000/users
```

2. **Test error simulation:**
```bash
curl http://localhost:3000/users?errorType=500
```

3. **Check metrics:**
```bash
curl http://localhost:3000/metrics
```

4. **Check health:**
```bash
curl http://localhost:3000/health
```

### Load Testing

Use tools like Apache Bench or k6 to generate load:

```bash
# Apache Bench - 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:3000/users

# With error simulation
ab -n 100 -c 5 "http://localhost:3000/users?errorType=500"
```

## 🔍 Monitoring & Observability

### Key Metrics to Monitor

1. **Request Rate:** `rate(http_requests_total[5m])`
2. **Error Rate:** `rate(http_errors_total[5m])`
3. **Response Time:** `http_request_duration_seconds`
4. **Error Types:** `http_errors_total` (by error_type label)

### Alert Examples

```yaml
# High error rate alert
- alert: HighErrorRate
  expr: rate(http_errors_total[5m]) > 0.1
  for: 5m
  annotations:
    summary: "High error rate detected"
```

## 🛠️ Development

### Environment Variables

Create a `.env` file with:

```env
PORT=3000
NODE_ENV=development
APP_NAME=BobAutoOps-Monitored-App
APP_VERSION=1.0.0
LOG_LEVEL=info
```

### Scripts

- `npm start` - Start the application
- `npm run dev` - Start with auto-reload (nodemon)

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use, change the `PORT` in your `.env` file:

```env
PORT=3001
```

### Metrics Not Showing

1. Verify the `/metrics` endpoint is accessible
2. Check Prometheus configuration
3. Ensure Prometheus can reach the application

### Errors Not Being Tracked

1. Check that the metrics middleware is applied
2. Verify error handler is the last middleware
3. Check console logs for error details

## 📝 License

MIT

## 👥 Authors

BobAutoOps Team - IBM Bob Hackathon 2026

## 🔗 Related Projects

- **autoops-backend** - AI analysis and fix generation
- **monitoring** - Prometheus and Grafana setup
- **dashboard** - Monitoring dashboard

---

**For the IBM Bob Hackathon** 🚀