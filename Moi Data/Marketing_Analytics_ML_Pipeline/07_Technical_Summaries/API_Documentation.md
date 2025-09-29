# Marketing Analytics ML Pipeline - API Documentation

## 🚀 API Overview

The Marketing Analytics ML Pipeline API is a high-performance FastAPI-based service designed to provide sub-second access to processed marketing data with enterprise-grade scalability and reliability.

### Base Information
- **Base URL**: `https://api.marketing-analytics.crtx.in/v1`
- **Protocol**: HTTPS only
- **Authentication**: JWT Bearer Token
- **Rate Limiting**: 1000 requests/minute per user
- **Response Format**: JSON
- **API Version**: 1.0.0

---

## 🔐 Authentication

### JWT Token Authentication

All API endpoints require authentication using JWT Bearer tokens.

```http
Authorization: Bearer <jwt_token>
```

### Token Endpoints

#### Get Access Token
```http
POST /auth/token
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

---

## 📊 Core API Endpoints

### 1. Health Check

#### GET /health
Check API and system health status.

**Response:**
```json
{
  "api": "healthy",
  "aggregator": "healthy",
  "redis": "healthy",
  "timestamp": "2025-09-29T10:30:00Z",
  "aggregator_stats": {
    "queries_processed": 1543,
    "avg_latency": 0.234,
    "cache_hit_rate": 0.952
  }
}
```

### 2. Data Upload

#### POST /data/upload
Upload marketing data for real-time processing.

**Request Body:**
```json
{
  "data_type": "meta_ads",
  "data": [
    {
      "campaign_name": "Summer Sale 2024",
      "impressions": 15000,
      "clicks": 450,
      "spend": 299.99,
      "conversions": 23,
      "date": "2024-09-29T00:00:00Z"
    }
  ],
  "batch_id": "batch_20240929_001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": "batch_20240929_001",
    "records_received": 1,
    "data_type": "meta_ads",
    "status": "queued_for_processing"
  },
  "metadata": {
    "query_time": 0.045,
    "cache_hit_rate": 0,
    "data_points": 1,
    "memory_usage": 0
  },
  "message": "Data uploaded and queued for processing",
  "timestamp": "2025-09-29T10:30:00Z"
}
```

### 3. Dashboard Query

#### POST /query/dashboard
Query aggregated data for dashboard consumption with sub-second performance.

**Request Body:**
```json
{
  "metrics": [
    {
      "name": "total_spend",
      "data_type": "meta_ads",
      "dimensions": ["campaign_name"],
      "aggregation_type": "sum"
    },
    {
      "name": "avg_ctr",
      "data_type": "meta_ads", 
      "dimensions": ["utm_source"],
      "aggregation_type": "avg"
    }
  ],
  "time_range": {
    "start": "2024-09-28T00:00:00Z",
    "end": "2024-09-29T23:59:59Z"
  },
  "granularity": 3600,
  "filters": {
    "campaign_status": "active"
  },
  "limit": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_spend": [
      {
        "timestamp": "2024-09-29T00:00:00Z",
        "values": {
          "Summer Sale 2024": 1245.67,
          "Fall Campaign": 892.34
        },
        "count": 156
      }
    ],
    "avg_ctr": [
      {
        "timestamp": "2024-09-29T00:00:00Z", 
        "values": {
          "google": 0.0234,
          "facebook": 0.0189
        },
        "count": 89
      }
    ]
  },
  "metadata": {
    "query_time": 0.342,
    "cache_hit_rate": 0.95,
    "data_points": 245,
    "memory_usage": 0,
    "cache_hit": false,
    "total_query_time": 0.367
  },
  "message": "Dashboard data retrieved successfully",
  "timestamp": "2025-09-29T10:30:00Z"
}
```

### 4. Time Series Data

#### GET /metrics/{metric_name}/timeseries
Get time series data for a specific metric.

**Parameters:**
- `metric_name` (path): Name of the metric
- `data_type` (query): Data source type (required)
- `start_time` (query): Start time in ISO format (required)
- `end_time` (query): End time in ISO format (required)
- `granularity` (query): Time granularity in seconds (default: 3600)
- `dimensions` (query): Grouping dimensions (optional, multiple allowed)

**Example Request:**
```http
GET /metrics/total_spend/timeseries?data_type=meta_ads&start_time=2024-09-29T00:00:00Z&end_time=2024-09-29T23:59:59Z&granularity=3600&dimensions=campaign_name
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metric_name": "total_spend",
    "data_type": "meta_ads",
    "time_series": [
      {
        "timestamp": "2024-09-29T00:00:00Z",
        "values": {
          "Summer Sale 2024": 345.67,
          "Fall Campaign": 234.89
        },
        "count": 45
      },
      {
        "timestamp": "2024-09-29T01:00:00Z",
        "values": {
          "Summer Sale 2024": 412.34,
          "Fall Campaign": 189.23
        },
        "count": 52
      }
    ],
    "granularity": 3600,
    "dimensions": ["campaign_name"]
  },
  "metadata": {
    "query_time": 0.234,
    "cache_hit_rate": 0,
    "data_points": 2,
    "memory_usage": 0,
    "cache_hit": false
  },
  "message": "Time series data for total_spend retrieved successfully",
  "timestamp": "2025-09-29T10:30:00Z"
}
```

### 5. CSV Export

#### GET /export/csv/{metric_name}
Export metric data as CSV with streaming response.

**Parameters:**
- `metric_name` (path): Name of the metric
- `data_type` (query): Data source type (required)
- `start_time` (query): Start time in ISO format (required)
- `end_time` (query): End time in ISO format (required)
- `granularity` (query): Time granularity in seconds (default: 3600)

**Example Request:**
```http
GET /export/csv/total_spend?data_type=meta_ads&start_time=2024-09-29T00:00:00Z&end_time=2024-09-29T23:59:59Z&granularity=3600
```

**Response:**
```csv
timestamp,metric_value,count
2024-09-29T00:00:00Z,345.67,45
2024-09-29T01:00:00Z,412.34,52
2024-09-29T02:00:00Z,289.12,38
```

### 6. Performance Statistics

#### GET /stats/performance
Get comprehensive performance statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "aggregation_engine": {
      "aggregation_stats": {
        "queries_processed": 1543,
        "avg_latency": 0.234,
        "cache_hit_rate": 0.952
      },
      "cache_stats": {
        "hits": 1468,
        "misses": 75,
        "sets": 89,
        "hit_rate": 0.951,
        "local_cache_size": 245
      },
      "memory_usage": {
        "percent": 68.5,
        "available_gb": 14.2
      },
      "active_computations": 3
    },
    "redis_cache": {
      "connected_clients": 12,
      "used_memory_human": "256.4M",
      "keyspace_hits": 15673,
      "keyspace_misses": 823,
      "hit_rate": 0.950
    },
    "api_metrics": {
      "uptime": 1698672600,
      "version": "1.0.0"
    }
  },
  "message": "Performance statistics retrieved successfully",
  "timestamp": "2025-09-29T10:30:00Z"
}
```

### 7. Cache Management

#### DELETE /cache/clear
Clear cache with optional pattern matching.

**Parameters:**
- `pattern` (query): Cache key pattern to clear (default: "*")

**Example Request:**
```http
DELETE /cache/clear?pattern=dashboard:*
```

**Response:**
```json
{
  "success": true,
  "data": {
    "redis_keys_cleared": 156,
    "pattern": "dashboard:*",
    "status": "cache_cleared"
  },
  "message": "Cache cleared for pattern: dashboard:*",
  "timestamp": "2025-09-29T10:30:00Z"
}
```

---

## 📋 Data Models

### TimeRange
```json
{
  "start": "2024-09-29T00:00:00Z",
  "end": "2024-09-29T23:59:59Z"
}
```

### MetricRequest
```json
{
  "name": "total_spend",
  "data_type": "meta_ads",
  "dimensions": ["campaign_name"],
  "aggregation_type": "sum"
}
```

### DashboardQuery
```json
{
  "metrics": [MetricRequest],
  "time_range": TimeRange,
  "granularity": 3600,
  "filters": {},
  "limit": 1000
}
```

### DataUpload
```json
{
  "data_type": "meta_ads",
  "data": [{}],
  "batch_id": "optional_batch_id"
}
```

### APIResponse
```json
{
  "success": true,
  "data": {},
  "metadata": {
    "query_time": 0.234,
    "cache_hit_rate": 0.95,
    "data_points": 100,
    "memory_usage": 0
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-09-29T10:30:00Z"
}
```

---

## ⚡ Performance Guidelines

### Rate Limits

| Endpoint | Rate Limit | Burst Limit |
|----------|------------|-------------|
| `/data/upload` | 100/minute | 10/second |
| `/query/dashboard` | 1000/minute | 50/second |
| `/metrics/*/timeseries` | 500/minute | 25/second |
| `/export/csv/*` | 10/minute | 2/second |
| All others | 1000/minute | 100/second |

### Response Times

| Operation | Target | Typical |
|-----------|--------|---------|
| Health Check | <50ms | 10-20ms |
| Data Upload | <200ms | 50-150ms |
| Dashboard Query | <500ms | 200-400ms |
| Time Series | <1000ms | 300-800ms |
| CSV Export | Streaming | Real-time |
| Performance Stats | <100ms | 30-80ms |

### Optimization Tips

1. **Use Appropriate Granularity**: Larger granularity values (3600s vs 60s) result in faster queries
2. **Limit Time Ranges**: Shorter time ranges improve response times significantly
3. **Cache-Friendly Queries**: Repeated queries with same parameters benefit from 95%+ cache hit rates
4. **Batch Data Uploads**: Upload data in batches of 1000-10000 records for optimal performance
5. **Use Dimensions Wisely**: Fewer dimensions in grouping operations improve aggregation speed

---

## 🚨 Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "metadata": null,
  "message": "Detailed error description",
  "timestamp": "2025-09-29T10:30:00Z",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field": "time_range.end",
    "issue": "End time must be after start time"
  }
}
```

### Common Error Scenarios

#### Authentication Errors
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error_code": "AUTHENTICATION_FAILED"
}
```

#### Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

#### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "granularity",
      "message": "must be between 60 and 86400"
    }
  ]
}
```

---

## 🔧 SDK & Integration Examples

### Python SDK Example

```python
import requests
from datetime import datetime, timedelta

class MarketingAnalyticsAPI:
    def __init__(self, base_url, api_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
    
    def query_dashboard(self, metrics, start_time, end_time, granularity=3600):
        payload = {
            'metrics': metrics,
            'time_range': {
                'start': start_time.isoformat(),
                'end': end_time.isoformat()
            },
            'granularity': granularity
        }
        
        response = requests.post(
            f'{self.base_url}/query/dashboard',
            json=payload,
            headers=self.headers
        )
        
        return response.json()
    
    def upload_data(self, data_type, data, batch_id=None):
        payload = {
            'data_type': data_type,
            'data': data,
            'batch_id': batch_id
        }
        
        response = requests.post(
            f'{self.base_url}/data/upload',
            json=payload,
            headers=self.headers
        )
        
        return response.json()

# Usage example
api = MarketingAnalyticsAPI(
    'https://api.marketing-analytics.crtx.in/v1',
    'your_jwt_token'
)

metrics = [
    {
        'name': 'total_spend',
        'data_type': 'meta_ads',
        'dimensions': ['campaign_name'],
        'aggregation_type': 'sum'
    }
]

end_time = datetime.now()
start_time = end_time - timedelta(days=1)

result = api.query_dashboard(metrics, start_time, end_time)
print(f"Query completed in {result['metadata']['query_time']:.3f}s")
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

class MarketingAnalyticsAPI {
  constructor(baseUrl, apiToken) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async queryDashboard(metrics, startTime, endTime, granularity = 3600) {
    const payload = {
      metrics: metrics,
      time_range: {
        start: startTime.toISOString(),
        end: endTime.toISOString()
      },
      granularity: granularity
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/query/dashboard`,
        payload,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.response.data.message}`);
    }
  }

  async uploadData(dataType, data, batchId = null) {
    const payload = {
      data_type: dataType,
      data: data,
      batch_id: batchId
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/data/upload`,
        payload,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`Upload Error: ${error.response.data.message}`);
    }
  }
}

// Usage example
const api = new MarketingAnalyticsAPI(
  'https://api.marketing-analytics.crtx.in/v1',
  'your_jwt_token'
);

const metrics = [{
  name: 'total_spend',
  data_type: 'meta_ads',
  dimensions: ['campaign_name'],
  aggregation_type: 'sum'
}];

const endTime = new Date();
const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

api.queryDashboard(metrics, startTime, endTime)
  .then(result => {
    console.log(`Query completed in ${result.metadata.query_time}s`);
    console.log('Data:', result.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

---

## 📚 Additional Resources

### OpenAPI Specification
- **Swagger UI**: `https://api.marketing-analytics.crtx.in/docs`
- **ReDoc**: `https://api.marketing-analytics.crtx.in/redoc`
- **OpenAPI JSON**: `https://api.marketing-analytics.crtx.in/openapi.json`

### Monitoring & Support
- **Status Page**: `https://status.marketing-analytics.crtx.in`
- **Metrics Dashboard**: `https://metrics.marketing-analytics.crtx.in`
- **Support Email**: api-support@crtx.in
- **Documentation**: `https://docs.marketing-analytics.crtx.in`

### Changelog
- **v1.0.0**: Initial release with core functionality
- **v1.0.1**: Performance optimizations and bug fixes
- **v1.1.0**: Advanced filtering and export capabilities (planned)

---

*API Documentation v1.0.0*  
*Last Updated: 2025-09-29*  
*Generated by: CRTX.in AI Solutions Architecture Team*