"""
Marketing Analytics ML Pipeline - High-Performance API Design
FastAPI-based API with sub-second response times for dashboard data consumption
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncio
import time
import json
import logging
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime, timedelta
import uvicorn
from contextlib import asynccontextmanager

# Performance and Monitoring
from prometheus_fastapi_instrumentator import Instrumentator
import aioredis
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Data Processing
import pandas as pd
import numpy as np
from realtime_aggregation_engine import RealTimeAggregator, AggregationConfig, DashboardQueryOptimizer

# Configuration and Utilities
from functools import lru_cache
import gzip
import orjson

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# Global variables for dependency injection
aggregator: Optional[RealTimeAggregator] = None
query_optimizer: Optional[DashboardQueryOptimizer] = None
redis_client: Optional[aioredis.Redis] = None

# Pydantic Models
class TimeRange(BaseModel):
    start: datetime
    end: datetime
    
    @validator('end')
    def end_after_start(cls, v, values):
        if 'start' in values and v <= values['start']:
            raise ValueError('End time must be after start time')
        return v

class MetricRequest(BaseModel):
    name: str = Field(..., description="Metric name")
    data_type: str = Field(..., description="Data source type")
    dimensions: List[str] = Field(default_factory=list, description="Grouping dimensions")
    aggregation_type: str = Field(default="sum", description="Aggregation method")

class DashboardQuery(BaseModel):
    metrics: List[MetricRequest] = Field(..., description="Metrics to query")
    time_range: TimeRange = Field(..., description="Time range for query")
    granularity: int = Field(default=3600, ge=60, le=86400, description="Time granularity in seconds")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Additional filters")
    limit: Optional[int] = Field(default=1000, ge=1, le=10000, description="Result limit")

class DataUpload(BaseModel):
    data_type: str = Field(..., description="Type of data being uploaded")
    data: List[Dict[str, Any]] = Field(..., description="Data records")
    batch_id: Optional[str] = Field(None, description="Batch identifier")

class PerformanceMetrics(BaseModel):
    query_time: float
    cache_hit_rate: float
    data_points: int
    memory_usage: float

class APIResponse(BaseModel):
    success: bool = True
    data: Any = None
    metadata: Optional[PerformanceMetrics] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

# Startup/Shutdown Events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Marketing Analytics API")
    
    global aggregator, query_optimizer, redis_client
    
    # Initialize aggregation engine
    config = AggregationConfig(
        redis_host="localhost",
        redis_port=6379,
        cache_ttl_short=300,
        cache_ttl_medium=1800,
        enable_prometheus=True
    )
    
    aggregator = RealTimeAggregator(config)
    await aggregator.initialize()
    
    query_optimizer = DashboardQueryOptimizer(aggregator)
    
    # Initialize Redis client for API caching
    redis_client = aioredis.from_url("redis://localhost:6379")
    
    logger.info("Marketing Analytics API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Marketing Analytics API")
    if redis_client:
        await redis_client.close()

# Create FastAPI app
app = FastAPI(
    title="Marketing Analytics ML Pipeline API",
    description="High-performance API for marketing analytics dashboard with sub-second response times",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SlowAPIMiddleware)

# Add rate limiting error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add Prometheus instrumentation
Instrumentator().instrument(app).expose(app)

# Authentication
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Simple token validation - replace with proper authentication in production"""
    # For demo purposes, accept any token
    return {"user_id": "demo_user", "permissions": ["read", "write"]}

# Dependency injection
async def get_aggregator() -> RealTimeAggregator:
    """Get aggregation engine instance"""
    if aggregator is None:
        raise HTTPException(status_code=503, detail="Aggregation engine not initialized")
    return aggregator

async def get_query_optimizer() -> DashboardQueryOptimizer:
    """Get query optimizer instance"""
    if query_optimizer is None:
        raise HTTPException(status_code=503, detail="Query optimizer not initialized")
    return query_optimizer

async def get_redis() -> aioredis.Redis:
    """Get Redis client instance"""
    if redis_client is None:
        raise HTTPException(status_code=503, detail="Redis client not initialized")
    return redis_client

# Utility Functions
def create_cache_key(prefix: str, **kwargs) -> str:
    """Create a cache key from parameters"""
    key_parts = [prefix]
    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}:{v}")
    return ":".join(key_parts)

async def get_cached_response(redis: aioredis.Redis, cache_key: str) -> Optional[Dict[str, Any]]:
    """Get cached response from Redis"""
    try:
        cached_data = await redis.get(cache_key)
        if cached_data:
            return orjson.loads(cached_data)
        return None
    except Exception as e:
        logger.warning(f"Cache retrieval error: {str(e)}")
        return None

async def set_cached_response(redis: aioredis.Redis, cache_key: str, data: Dict[str, Any], ttl: int = 300):
    """Set cached response in Redis"""
    try:
        serialized_data = orjson.dumps(data)
        await redis.setex(cache_key, ttl, serialized_data)
    except Exception as e:
        logger.warning(f"Cache storage error: {str(e)}")

# API Endpoints

@app.get("/", response_model=APIResponse)
async def root():
    """API health check and information"""
    return APIResponse(
        data={
            "service": "Marketing Analytics ML Pipeline API",
            "version": "1.0.0",
            "status": "healthy",
            "features": [
                "Real-time data aggregation",
                "Sub-second query responses",
                "ML-powered data processing",
                "High-performance caching",
                "Scalable architecture"
            ]
        },
        message="Marketing Analytics API is running"
    )

@app.get("/health")
async def health_check(
    aggregator: RealTimeAggregator = Depends(get_aggregator),
    redis: aioredis.Redis = Depends(get_redis)
):
    """Comprehensive health check"""
    
    health_status = {
        "api": "healthy",
        "aggregator": "unknown",
        "redis": "unknown",
        "timestamp": datetime.now().isoformat()
    }
    
    # Check aggregator
    try:
        perf_stats = await aggregator.get_performance_stats()
        health_status["aggregator"] = "healthy"
        health_status["aggregator_stats"] = perf_stats
    except Exception as e:
        health_status["aggregator"] = f"unhealthy: {str(e)}"
    
    # Check Redis
    try:
        await redis.ping()
        health_status["redis"] = "healthy"
    except Exception as e:
        health_status["redis"] = f"unhealthy: {str(e)}"
    
    # Determine overall status
    overall_healthy = all(
        status == "healthy" 
        for key, status in health_status.items() 
        if key in ["api", "aggregator", "redis"]
    )
    
    status_code = 200 if overall_healthy else 503
    
    return JSONResponse(
        status_code=status_code,
        content=health_status
    )

@app.post("/data/upload", response_model=APIResponse)
@limiter.limit("100/minute")
async def upload_data(
    request: HTTPRequest,
    data_upload: DataUpload,
    background_tasks: BackgroundTasks,
    aggregator: RealTimeAggregator = Depends(get_aggregator),
    user = Depends(get_current_user)
):
    """Upload data for real-time processing"""
    
    start_time = time.time()
    
    try:
        # Convert to DataFrame
        df = pd.DataFrame(data_upload.data)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data provided")
        
        # Add to background processing queue
        background_tasks.add_task(
            aggregator.process_data_batch,
            df,
            data_upload.data_type
        )
        
        processing_time = time.time() - start_time
        
        return APIResponse(
            data={
                "batch_id": data_upload.batch_id or f"batch_{int(time.time())}",
                "records_received": len(df),
                "data_type": data_upload.data_type,
                "status": "queued_for_processing"
            },
            metadata=PerformanceMetrics(
                query_time=processing_time,
                cache_hit_rate=0,
                data_points=len(df),
                memory_usage=0
            ),
            message="Data uploaded and queued for processing"
        )
        
    except Exception as e:
        logger.error(f"Data upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/query/dashboard", response_model=APIResponse)
@limiter.limit("1000/minute")
async def query_dashboard_data(
    request: HTTPRequest,
    query: DashboardQuery,
    redis: aioredis.Redis = Depends(get_redis),
    optimizer: DashboardQueryOptimizer = Depends(get_query_optimizer),
    user = Depends(get_current_user)
):
    """Query aggregated data for dashboard consumption with sub-second performance"""
    
    start_time = time.time()
    
    try:
        # Create cache key
        cache_key = create_cache_key(
            "dashboard",
            metrics=str(sorted([m.dict() for m in query.metrics])),
            time_range=f"{query.time_range.start}_{query.time_range.end}",
            granularity=query.granularity,
            filters=str(sorted(query.filters.items())),
            limit=query.limit
        )
        
        # Check cache first
        cached_response = await get_cached_response(redis, cache_key)
        if cached_response:
            # Update cache hit metrics
            cached_response["metadata"]["cache_hit"] = True
            cached_response["metadata"]["total_query_time"] = time.time() - start_time
            
            return APIResponse(**cached_response)
        
        # Build query specification
        query_spec = {
            "metrics": [m.dict() for m in query.metrics],
            "time_range": {
                "start": query.time_range.start.isoformat(),
                "end": query.time_range.end.isoformat()
            },
            "granularity": query.granularity,
            "filters": query.filters
        }
        
        # Execute query
        dashboard_data = await optimizer.get_dashboard_data(query_spec)
        
        # Apply limit if specified
        if query.limit:
            for metric_name, metric_data in dashboard_data["data"].items():
                if isinstance(metric_data, list):
                    dashboard_data["data"][metric_name] = metric_data[:query.limit]
        
        # Prepare response
        total_query_time = time.time() - start_time
        
        response_data = {
            "data": dashboard_data["data"],
            "metadata": PerformanceMetrics(
                query_time=dashboard_data["metadata"]["query_time"],
                cache_hit_rate=dashboard_data["metadata"]["cache_hit_rate"],
                data_points=sum(
                    len(metric_data) if isinstance(metric_data, list) else 1
                    for metric_data in dashboard_data["data"].values()
                ),
                memory_usage=0  # Add memory usage tracking if needed
            ),
            "message": "Dashboard data retrieved successfully"
        }
        
        # Cache response for future requests
        cache_ttl = min(300, query.granularity // 4)  # Cache for 1/4 of granularity, max 5 minutes
        await set_cached_response(redis, cache_key, response_data, cache_ttl)
        
        # Add total query time to metadata
        response_data["metadata"].total_query_time = total_query_time
        response_data["metadata"].cache_hit = False
        
        return APIResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Dashboard query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.get("/metrics/{metric_name}/timeseries", response_model=APIResponse)
@limiter.limit("500/minute")
async def get_metric_timeseries(
    request: HTTPRequest,
    metric_name: str,
    data_type: str = Query(..., description="Data source type"),
    start_time: datetime = Query(..., description="Start time (ISO format)"),
    end_time: datetime = Query(..., description="End time (ISO format)"),
    granularity: int = Query(3600, ge=60, le=86400, description="Time granularity in seconds"),
    dimensions: List[str] = Query(default=[], description="Grouping dimensions"),
    aggregator: RealTimeAggregator = Depends(get_aggregator),
    redis: aioredis.Redis = Depends(get_redis),
    user = Depends(get_current_user)
):
    """Get time series data for a specific metric"""
    
    start_query_time = time.time()
    
    try:
        # Validate time range
        if end_time <= start_time:
            raise HTTPException(status_code=400, detail="End time must be after start time")
        
        # Create cache key
        cache_key = create_cache_key(
            "timeseries",
            metric=metric_name,
            data_type=data_type,
            start=start_time.isoformat(),
            end=end_time.isoformat(),
            granularity=granularity,
            dimensions=str(sorted(dimensions))
        )
        
        # Check cache
        cached_response = await get_cached_response(redis, cache_key)
        if cached_response:
            cached_response["metadata"]["cache_hit"] = True
            cached_response["metadata"]["total_query_time"] = time.time() - start_query_time
            return APIResponse(**cached_response)
        
        # Query time series data
        time_series = []
        current_time = start_time
        
        while current_time < end_time:
            window_data = await aggregator.query_aggregation(
                metric_name, data_type, granularity, current_time, dimensions
            )
            
            if window_data:
                time_series.append({
                    "timestamp": current_time.isoformat(),
                    "values": window_data["values"],
                    "count": window_data["count"]
                })
            
            current_time += timedelta(seconds=granularity)
        
        total_query_time = time.time() - start_query_time
        
        response_data = {
            "data": {
                "metric_name": metric_name,
                "data_type": data_type,
                "time_series": time_series,
                "granularity": granularity,
                "dimensions": dimensions
            },
            "metadata": PerformanceMetrics(
                query_time=total_query_time,
                cache_hit_rate=0,  # No cache hit since we computed it
                data_points=len(time_series),
                memory_usage=0
            ),
            "message": f"Time series data for {metric_name} retrieved successfully"
        }
        
        # Cache response
        cache_ttl = min(300, granularity // 4)
        await set_cached_response(redis, cache_key, response_data, cache_ttl)
        
        response_data["metadata"].cache_hit = False
        
        return APIResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Time series query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Time series query failed: {str(e)}")

@app.get("/export/csv/{metric_name}")
@limiter.limit("10/minute")
async def export_metric_csv(
    request: HTTPRequest,
    metric_name: str,
    data_type: str = Query(..., description="Data source type"),
    start_time: datetime = Query(..., description="Start time (ISO format)"),
    end_time: datetime = Query(..., description="End time (ISO format)"),
    granularity: int = Query(3600, ge=60, le=86400, description="Time granularity in seconds"),
    aggregator: RealTimeAggregator = Depends(get_aggregator),
    user = Depends(get_current_user)
):
    """Export metric data as CSV with streaming response"""
    
    try:
        async def generate_csv():
            # CSV header
            yield "timestamp,metric_value,count\\n"
            
            # Generate data rows
            current_time = start_time
            while current_time < end_time:
                window_data = await aggregator.query_aggregation(
                    metric_name, data_type, granularity, current_time, []
                )
                
                if window_data and window_data["values"]:
                    # Handle different value structures
                    if isinstance(window_data["values"], dict):
                        for key, value in window_data["values"].items():
                            yield f"{current_time.isoformat()},{value},{window_data['count']}\\n"
                    else:
                        yield f"{current_time.isoformat()},{window_data['values']},{window_data['count']}\\n"
                
                current_time += timedelta(seconds=granularity)
        
        return StreamingResponse(
            generate_csv(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={metric_name}_{data_type}_export.csv"
            }
        )
        
    except Exception as e:
        logger.error(f"CSV export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV export failed: {str(e)}")

@app.get("/stats/performance", response_model=APIResponse)
async def get_performance_stats(
    aggregator: RealTimeAggregator = Depends(get_aggregator),
    redis: aioredis.Redis = Depends(get_redis),
    user = Depends(get_current_user)
):
    """Get comprehensive performance statistics"""
    
    try:
        # Get aggregation engine stats
        perf_stats = await aggregator.get_performance_stats()
        
        # Get Redis info
        redis_info = await redis.info()
        redis_stats = {
            "connected_clients": redis_info.get("connected_clients", 0),
            "used_memory_human": redis_info.get("used_memory_human", "0B"),
            "keyspace_hits": redis_info.get("keyspace_hits", 0),
            "keyspace_misses": redis_info.get("keyspace_misses", 0)
        }
        
        # Calculate Redis hit rate
        total_redis_requests = redis_stats["keyspace_hits"] + redis_stats["keyspace_misses"]
        redis_hit_rate = (
            redis_stats["keyspace_hits"] / total_redis_requests 
            if total_redis_requests > 0 else 0
        )
        
        return APIResponse(
            data={
                "aggregation_engine": perf_stats,
                "redis_cache": {
                    **redis_stats,
                    "hit_rate": redis_hit_rate
                },
                "api_metrics": {
                    "uptime": time.time(),  # Replace with actual uptime tracking
                    "version": "1.0.0"
                }
            },
            message="Performance statistics retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Performance stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve performance stats: {str(e)}")

@app.delete("/cache/clear")
@limiter.limit("5/minute")
async def clear_cache(
    pattern: str = Query(default="*", description="Cache key pattern to clear"),
    redis: aioredis.Redis = Depends(get_redis),
    aggregator: RealTimeAggregator = Depends(get_aggregator),
    user = Depends(get_current_user)
):
    """Clear cache with optional pattern matching"""
    
    try:
        # Clear Redis cache
        keys = await redis.keys(pattern)
        if keys:
            await redis.delete(*keys)
            redis_cleared = len(keys)
        else:
            redis_cleared = 0
        
        # Clear aggregation cache
        await aggregator.cache.invalidate_pattern(pattern)
        
        return APIResponse(
            data={
                "redis_keys_cleared": redis_cleared,
                "pattern": pattern,
                "status": "cache_cleared"
            },
            message=f"Cache cleared for pattern: {pattern}"
        )
        
    except Exception as e:
        logger.error(f"Cache clear error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")

# Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "metadata": None,
            "message": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "metadata": None,
            "message": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }
    )

# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        "high_performance_api:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Set to True for development
        workers=1,  # Increase for production
        loop="uvloop",  # Use uvloop for better performance
        http="h11",
        log_level="info"
    )