# Marketing Analytics ML Pipeline - Production Deployment Guide

## 🚀 Deployment Overview

This comprehensive deployment guide provides step-by-step instructions for deploying the Marketing Analytics ML Pipeline in production environments with enterprise-grade reliability, security, and performance.

### Deployment Architecture

```
Internet → Load Balancer → API Gateway → Application Cluster → Data Layer
    ↓           ↓            ↓              ↓                ↓
   TLS      Round-Robin   FastAPI      Auto-scaling      Redis/InfluxDB
Security   Distribution  Instances     Containers         Clusters
```

---

## 🏗️ Infrastructure Requirements

### Minimum Production Requirements

| Component | Specification | Purpose |
|-----------|---------------|---------|
| **Application Servers** | 3x 8-core, 32GB RAM, 500GB SSD | API and processing nodes |
| **Database Cluster** | 3x 4-core, 16GB RAM, 1TB SSD | PostgreSQL HA cluster |
| **Redis Cluster** | 3x 4-core, 8GB RAM, 200GB SSD | Caching and session storage |
| **InfluxDB Cluster** | 3x 8-core, 16GB RAM, 2TB SSD | Time-series data storage |
| **Load Balancer** | 2x 4-core, 8GB RAM, 100GB SSD | High availability proxy |
| **Monitoring** | 2x 4-core, 16GB RAM, 500GB SSD | Prometheus/Grafana stack |

### Recommended Cloud Resources

#### AWS Configuration
```yaml
Application Tier:
  - Instance Type: c5.2xlarge (8 vCPU, 16GB RAM)
  - Auto Scaling Group: 3-10 instances
  - Load Balancer: Application Load Balancer (ALB)

Database Tier:
  - RDS PostgreSQL: db.r5.2xlarge Multi-AZ
  - ElastiCache Redis: cache.r5.xlarge cluster mode
  - InfluxDB: r5.2xlarge instances with EBS gp3

Network:
  - VPC with private/public subnets
  - NAT Gateway for outbound traffic
  - Security Groups with minimal access
```

#### Google Cloud Configuration
```yaml
Application Tier:
  - Machine Type: c2-standard-8
  - Managed Instance Group: 3-10 instances  
  - Load Balancer: Global HTTP(S) Load Balancer

Database Tier:
  - Cloud SQL PostgreSQL: db-standard-8 HA
  - Memorystore Redis: standard-8gb
  - Compute Engine for InfluxDB: c2-standard-8

Network:
  - VPC with regional subnets
  - Cloud NAT for egress
  - Firewall rules for security
```

#### Azure Configuration
```yaml
Application Tier:
  - VM Size: Standard_D8s_v3
  - VM Scale Set: 3-10 instances
  - Load Balancer: Application Gateway

Database Tier:
  - Azure Database for PostgreSQL: General Purpose 8vCore
  - Azure Cache for Redis: Premium P3
  - VM for InfluxDB: Standard_D8s_v3

Network:
  - Virtual Network with subnets
  - Azure NAT Gateway
  - Network Security Groups
```

---

## 🐳 Container Deployment

### Docker Configuration

#### Dockerfile for API Service
```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser && \\
    chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "high_performance_api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### Docker Compose for Development
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://user:pass@postgres:5432/marketing_analytics
      - INFLUXDB_URL=http://influxdb:8086
    depends_on:
      - redis
      - postgres
      - influxdb
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: marketing_analytics
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: admin
      DOCKER_INFLUXDB_INIT_PASSWORD: password
      DOCKER_INFLUXDB_INIT_ORG: crtx
      DOCKER_INFLUXDB_INIT_BUCKET: marketing_analytics
    volumes:
      - influxdb_data:/var/lib/influxdb2
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
  influxdb_data:
  prometheus_data:
  grafana_data:
```

---

## ☸️ Kubernetes Deployment

### Kubernetes Manifests

#### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: marketing-analytics
  labels:
    name: marketing-analytics
```

#### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: marketing-analytics
data:
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  POSTGRES_HOST: "postgres-service"
  POSTGRES_PORT: "5432"
  INFLUXDB_HOST: "influxdb-service"
  INFLUXDB_PORT: "8086"
  LOG_LEVEL: "INFO"
  WORKERS: "4"
```

#### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: marketing-analytics
type: Opaque
data:
  POSTGRES_PASSWORD: <base64-encoded-password>
  INFLUXDB_TOKEN: <base64-encoded-token>
  JWT_SECRET: <base64-encoded-secret>
```

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marketing-analytics-api
  namespace: marketing-analytics
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: marketing-analytics-api
  template:
    metadata:
      labels:
        app: marketing-analytics-api
    spec:
      containers:
      - name: api
        image: crtx/marketing-analytics-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: POSTGRES_PASSWORD
        envFrom:
        - configMapRef:
            name: api-config
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: logs
        emptyDir: {}
```

#### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: marketing-analytics-service
  namespace: marketing-analytics
spec:
  selector:
    app: marketing-analytics-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

#### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: marketing-analytics-ingress
  namespace: marketing-analytics
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.marketing-analytics.crtx.in
    secretName: api-tls-secret
  rules:
  - host: api.marketing-analytics.crtx.in
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: marketing-analytics-service
            port:
              number: 80
```

#### HorizontalPodAutoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: marketing-analytics-hpa
  namespace: marketing-analytics
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: marketing-analytics-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 🗄️ Database Setup

### PostgreSQL Configuration

#### High Availability Setup
```sql
-- Create database and user
CREATE DATABASE marketing_analytics;
CREATE USER api_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE marketing_analytics TO api_user;

-- Connect to the database
\\c marketing_analytics;

-- Create tables for metadata
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processing_jobs (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    records_count INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(100),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_used TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_batch_id ON processing_jobs(batch_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
```

#### Performance Tuning
```conf
# postgresql.conf optimizations for analytics workload
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
checkpoint_completion_target = 0.9
wal_buffers = 64MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 32MB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4
```

### Redis Cluster Configuration

#### Redis Sentinel Setup
```conf
# redis-sentinel.conf
port 26379
sentinel announce-ip <sentinel-ip>
sentinel announce-port 26379
sentinel monitor mymaster <redis-master-ip> 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
sentinel auth-pass mymaster <redis-password>
```

#### Redis Performance Configuration
```conf
# redis.conf optimization
maxmemory 6gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
tcp-keepalive 300
timeout 0
tcp-backlog 511
databases 16
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
```

### InfluxDB Setup

#### InfluxDB Configuration
```toml
# influxdb.conf
[http]
  bind-address = ":8086"
  auth-enabled = true
  max-concurrent-queries = 0
  max-enqueued-queries = 0
  enqueued-query-timeout = "5m"

[data]
  dir = "/var/lib/influxdb2/data"
  engine = "tsm1"
  max-series-per-database = 1000000
  max-values-per-tag = 100000

[coordinator]
  write-timeout = "10s"
  max-concurrent-queries = 0
  query-timeout = "0s"
  log-queries-after = "0s"
  max-select-point = 0
  max-select-series = 0
  max-select-buckets = 0

[retention]
  enabled = true
  check-interval = "30m"
```

---

## 🔧 Configuration Management

### Environment Variables

#### Production Environment File
```bash
# .env.production

# Application Configuration
APP_ENV=production
LOG_LEVEL=INFO
DEBUG=false
API_VERSION=v1
SECRET_KEY=<strong-secret-key>

# Database Configuration
POSTGRES_HOST=postgres-cluster.internal
POSTGRES_PORT=5432
POSTGRES_DB=marketing_analytics
POSTGRES_USER=api_user
POSTGRES_PASSWORD=<secure-password>
POSTGRES_POOL_SIZE=20
POSTGRES_MAX_OVERFLOW=0

# Redis Configuration
REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>
REDIS_DB=0
REDIS_POOL_SIZE=20
REDIS_SSL=true

# InfluxDB Configuration
INFLUXDB_URL=https://influxdb-cluster.internal:8086
INFLUXDB_TOKEN=<influxdb-token>
INFLUXDB_ORG=crtx
INFLUXDB_BUCKET=marketing_analytics

# Performance Configuration
MAX_WORKERS=4
CHUNK_SIZE=10000
MAX_MEMORY_USAGE=0.7
ENABLE_GPU=false
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=1800
CACHE_TTL_LONG=7200

# Security Configuration
JWT_SECRET_KEY=<jwt-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
CORS_ORIGINS=https://dashboard.crtx.in,https://admin.crtx.in
ALLOWED_HOSTS=api.marketing-analytics.crtx.in

# Monitoring Configuration
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=8001
ENABLE_PROFILING=false
LOG_REQUESTS=true

# Rate Limiting
RATE_LIMIT_PER_MINUTE=1000
RATE_LIMIT_BURST=100
```

### Kubernetes Secrets Management

#### Using External Secrets Operator
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: marketing-analytics
spec:
  provider:
    vault:
      server: "https://vault.internal"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "marketing-analytics"

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: api-secrets
  namespace: marketing-analytics
spec:
  refreshInterval: 15s
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: api-secrets
    creationPolicy: Owner
  data:
  - secretKey: POSTGRES_PASSWORD
    remoteRef:
      key: marketing-analytics/postgres
      property: password
  - secretKey: JWT_SECRET
    remoteRef:
      key: marketing-analytics/jwt
      property: secret
```

---

## 📊 Monitoring & Observability

### Prometheus Configuration

#### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'marketing-analytics-api'
    static_configs:
      - targets: ['api:8001']
    scrape_interval: 5s
    metrics_path: /metrics

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']

  - job_name: 'influxdb'
    static_configs:
      - targets: ['influxdb:8086']
```

#### Alert Rules
```yaml
groups:
- name: marketing-analytics-alerts
  rules:
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }}s"

  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }}"

  - alert: LowCacheHitRate
    expr: cache_hit_rate < 0.9
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Cache hit rate is low"
      description: "Cache hit rate is {{ $value | humanizePercentage }}"
```

### Grafana Dashboards

#### API Performance Dashboard
```json
{
  "dashboard": {
    "id": null,
    "title": "Marketing Analytics API Performance",
    "tags": ["marketing-analytics"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[1m]))",
            "legendFormat": "Requests per second"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "cache_hit_rate",
            "legendFormat": "Hit Rate"
          }
        ]
      }
    ]
  }
}
```

---

## 🔒 Security Configuration

### SSL/TLS Setup

#### Nginx Reverse Proxy Configuration
```nginx
upstream marketing_analytics_api {
    server api-1:8000;
    server api-2:8000;
    server api-3:8000;
}

server {
    listen 443 ssl http2;
    server_name api.marketing-analytics.crtx.in;

    ssl_certificate /etc/ssl/certs/api.marketing-analytics.crtx.in.crt;
    ssl_certificate_key /etc/ssl/private/api.marketing-analytics.crtx.in.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://marketing_analytics_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.marketing-analytics.crtx.in;
    return 301 https://$server_name$request_uri;
}
```

### Firewall Rules

#### AWS Security Groups
```json
{
  "SecurityGroups": [
    {
      "GroupName": "marketing-analytics-api",
      "Description": "Security group for API servers",
      "IpPermissions": [
        {
          "IpProtocol": "tcp",
          "FromPort": 443,
          "ToPort": 443,
          "IpRanges": [{"CidrIp": "0.0.0.0/0"}]
        },
        {
          "IpProtocol": "tcp", 
          "FromPort": 80,
          "ToPort": 80,
          "IpRanges": [{"CidrIp": "0.0.0.0/0"}]
        },
        {
          "IpProtocol": "tcp",
          "FromPort": 22,
          "ToPort": 22,
          "IpRanges": [{"CidrIp": "10.0.0.0/8"}]
        }
      ]
    },
    {
      "GroupName": "marketing-analytics-db",
      "Description": "Security group for database servers",
      "IpPermissions": [
        {
          "IpProtocol": "tcp",
          "FromPort": 5432,
          "ToPort": 5432,
          "UserIdGroupPairs": [
            {"GroupName": "marketing-analytics-api"}
          ]
        },
        {
          "IpProtocol": "tcp",
          "FromPort": 6379,
          "ToPort": 6379,
          "UserIdGroupPairs": [
            {"GroupName": "marketing-analytics-api"}
          ]
        }
      ]
    }
  ]
}
```

---

## 🚀 Deployment Process

### Automated Deployment Pipeline

#### GitHub Actions Workflow
```yaml
name: Deploy Marketing Analytics API

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: crtx/marketing-analytics-api

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov
    - name: Run tests
      run: pytest --cov=./ --cov-report=xml
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.image.outputs.image }}
    steps:
    - uses: actions/checkout@v3
    - name: Log in to registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to staging
      run: |
        kubectl set image deployment/marketing-analytics-api \\
          api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \\
          --namespace=marketing-analytics-staging
        kubectl rollout status deployment/marketing-analytics-api \\
          --namespace=marketing-analytics-staging

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to production
      run: |
        kubectl set image deployment/marketing-analytics-api \\
          api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \\
          --namespace=marketing-analytics
        kubectl rollout status deployment/marketing-analytics-api \\
          --namespace=marketing-analytics
```

### Manual Deployment Steps

#### 1. Pre-deployment Checklist
```bash
# Verify infrastructure readiness
kubectl get nodes
kubectl get pods -n marketing-analytics
kubectl get services -n marketing-analytics

# Check database connectivity
kubectl exec -it postgres-0 -n marketing-analytics -- psql -U api_user -d marketing_analytics -c "SELECT 1;"

# Verify Redis cluster
kubectl exec -it redis-0 -n marketing-analytics -- redis-cli ping

# Check InfluxDB
kubectl exec -it influxdb-0 -n marketing-analytics -- influx ping
```

#### 2. Database Migration
```bash
# Run database migrations
kubectl apply -f k8s/migration-job.yaml
kubectl wait --for=condition=complete job/db-migration -n marketing-analytics

# Verify migration
kubectl logs job/db-migration -n marketing-analytics
```

#### 3. Application Deployment
```bash
# Deploy new version
kubectl set image deployment/marketing-analytics-api \\
  api=crtx/marketing-analytics-api:v1.0.0 \\
  --namespace=marketing-analytics

# Monitor rollout
kubectl rollout status deployment/marketing-analytics-api -n marketing-analytics

# Verify deployment
kubectl get pods -n marketing-analytics -l app=marketing-analytics-api
```

#### 4. Post-deployment Verification
```bash
# Health check
curl -f https://api.marketing-analytics.crtx.in/health

# Performance test
curl -w "Total time: %{time_total}s\\n" \\
  -H "Authorization: Bearer $API_TOKEN" \\
  https://api.marketing-analytics.crtx.in/stats/performance

# Load test (optional)
ab -n 1000 -c 10 -H "Authorization: Bearer $API_TOKEN" \\
  https://api.marketing-analytics.crtx.in/health
```

---

## 🔄 Backup & Recovery

### Database Backup Strategy

#### PostgreSQL Backup
```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="marketing_analytics_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -h postgres-cluster.internal \\
        -U api_user \\
        -d marketing_analytics \\
        --no-password \\
        --verbose \\
        --format=custom \\
        --file=${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# Upload to cloud storage
aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.gz \\
  s3://marketing-analytics-backups/postgres/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

#### Redis Backup
```bash
#!/bin/bash
# backup-redis.sh

BACKUP_DIR="/backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Save Redis snapshot
redis-cli -h redis-cluster.internal BGSAVE

# Wait for completion
while [ $(redis-cli -h redis-cluster.internal LASTSAVE) -eq $(redis-cli -h redis-cluster.internal LASTSAVE) ]; do
  sleep 1
done

# Copy dump file
scp redis-cluster.internal:/var/lib/redis/dump.rdb \\
  ${BACKUP_DIR}/dump_${TIMESTAMP}.rdb

# Upload to cloud storage
aws s3 cp ${BACKUP_DIR}/dump_${TIMESTAMP}.rdb \\
  s3://marketing-analytics-backups/redis/
```

### Disaster Recovery Plan

#### Recovery Procedures
```bash
# 1. Infrastructure Recovery
# Restore from Infrastructure as Code
terraform apply -var-file=production.tfvars

# 2. Database Recovery
# Restore PostgreSQL from backup
gunzip marketing_analytics_20250929_120000.sql.gz
pg_restore -h postgres-cluster.internal \\
           -U api_user \\
           -d marketing_analytics \\
           --clean \\
           --if-exists \\
           marketing_analytics_20250929_120000.sql

# 3. Redis Recovery
# Copy backup to Redis server
scp dump_20250929_120000.rdb redis-cluster.internal:/var/lib/redis/dump.rdb
# Restart Redis to load backup
kubectl rollout restart statefulset/redis -n marketing-analytics

# 4. Application Recovery
# Deploy latest stable version
kubectl apply -f k8s/
kubectl rollout status deployment/marketing-analytics-api -n marketing-analytics

# 5. Verification
curl -f https://api.marketing-analytics.crtx.in/health
```

---

## 📈 Performance Tuning

### Application Optimization

#### FastAPI Configuration
```python
from fastapi import FastAPI
import uvicorn

app = FastAPI(
    title="Marketing Analytics API",
    docs_url=None,  # Disable in production
    redoc_url=None,  # Disable in production
    openapi_url=None  # Disable in production
)

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        workers=4,
        loop="uvloop",
        http="h11",
        access_log=False,  # Disable for performance
        server_header=False,
        date_header=False
    )
```

#### Redis Optimization
```python
import redis.asyncio as aioredis

# Connection pool configuration
redis_pool = aioredis.ConnectionPool.from_url(
    "redis://redis-cluster.internal:6379",
    max_connections=20,
    socket_connect_timeout=5,
    socket_timeout=5,
    retry_on_timeout=True,
    health_check_interval=30
)
```

### System-level Optimization

#### Linux Kernel Parameters
```bash
# /etc/sysctl.conf optimizations for high-performance API
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
vm.swappiness = 1
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
fs.file-max = 1000000
```

#### Container Resource Limits
```yaml
resources:
  requests:
    memory: "2Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

---

## 🧪 Testing in Production

### Load Testing

#### Artillery Load Test Configuration
```yaml
# load-test.yml
config:
  target: 'https://api.marketing-analytics.crtx.in'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 180
      arrivalRate: 100
  variables:
    api_token: "your_jwt_token"

scenarios:
  - name: "Dashboard Query"
    weight: 70
    flow:
      - post:
          url: "/query/dashboard"
          headers:
            Authorization: "Bearer {{ api_token }}"
          json:
            metrics:
              - name: "total_spend"
                data_type: "meta_ads"
                dimensions: ["campaign_name"]
            time_range:
              start: "2024-09-28T00:00:00Z"
              end: "2024-09-29T23:59:59Z"
            granularity: 3600

  - name: "Health Check"
    weight: 20
    flow:
      - get:
          url: "/health"

  - name: "Performance Stats"
    weight: 10
    flow:
      - get:
          url: "/stats/performance"
          headers:
            Authorization: "Bearer {{ api_token }}"
```

#### Running Load Tests
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml

# Run with custom target
artillery run --target https://staging-api.marketing-analytics.crtx.in load-test.yml
```

### Smoke Tests

#### Post-deployment Smoke Test
```bash
#!/bin/bash
# smoke-test.sh

API_BASE="https://api.marketing-analytics.crtx.in"
API_TOKEN="your_jwt_token"

echo "Running smoke tests..."

# Test 1: Health check
echo "Testing health endpoint..."
response=$(curl -s -w "%{http_code}" "$API_BASE/health")
if [[ ${response: -3} == "200" ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed: $response"
    exit 1
fi

# Test 2: Authentication
echo "Testing authentication..."
response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $API_TOKEN" "$API_BASE/stats/performance")
if [[ ${response: -3} == "200" ]]; then
    echo "✅ Authentication test passed"
else
    echo "❌ Authentication test failed: $response"
    exit 1
fi

# Test 3: Dashboard query
echo "Testing dashboard query..."
payload='{
  "metrics": [{"name": "total_spend", "data_type": "meta_ads", "dimensions": ["campaign_name"]}],
  "time_range": {"start": "2024-09-29T00:00:00Z", "end": "2024-09-29T23:59:59Z"},
  "granularity": 3600
}'
response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d "$payload" "$API_BASE/query/dashboard")
if [[ ${response: -3} == "200" ]]; then
    echo "✅ Dashboard query test passed"
else
    echo "❌ Dashboard query test failed: $response"
    exit 1
fi

echo "All smoke tests passed! 🎉"
```

---

## 📚 Troubleshooting Guide

### Common Issues

#### High Response Times
```bash
# Check API server logs
kubectl logs deployment/marketing-analytics-api -n marketing-analytics

# Check resource usage
kubectl top pods -n marketing-analytics

# Check database performance
kubectl exec -it postgres-0 -n marketing-analytics -- \\
  psql -U api_user -d marketing_analytics -c "
  SELECT query, mean_exec_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;"
```

#### Memory Issues
```bash
# Check memory usage
kubectl describe node

# Check for memory leaks
kubectl exec -it marketing-analytics-api-pod -- \\
  python -c "
  import psutil
  process = psutil.Process()
  print(f'Memory: {process.memory_info().rss / 1024 / 1024:.2f} MB')
  "
```

#### Database Connection Issues
```bash
# Check PostgreSQL connections
kubectl exec -it postgres-0 -n marketing-analytics -- \\
  psql -U api_user -d marketing_analytics -c "
  SELECT count(*) as active_connections 
  FROM pg_stat_activity 
  WHERE state = 'active';"

# Check connection pool
kubectl logs deployment/marketing-analytics-api -n marketing-analytics | grep "pool"
```

### Performance Debugging

#### Enable Debug Mode
```bash
# Temporarily enable debug logging
kubectl set env deployment/marketing-analytics-api LOG_LEVEL=DEBUG -n marketing-analytics

# Check detailed logs
kubectl logs -f deployment/marketing-analytics-api -n marketing-analytics
```

#### Profiling
```python
# Add profiling to specific endpoints
import cProfile
import pstats

def profile_endpoint():
    profiler = cProfile.Profile()
    profiler.enable()
    
    # Your endpoint logic here
    
    profiler.disable()
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(20)
```

---

*Deployment Guide v1.0.0*  
*Last Updated: 2025-09-29*  
*Prepared by: CRTX.in AI Solutions Architecture Team*