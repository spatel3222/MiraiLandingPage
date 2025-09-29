"""
Marketing Analytics ML Pipeline - Real-time Aggregation & Caching Engine
High-performance real-time data aggregation with sub-second response optimization
"""

import asyncio
import time
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Union, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict, deque
import hashlib
import pickle
from concurrent.futures import ThreadPoolExecutor
import threading

# Data Processing
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool

# Caching and Messaging
import redis
import redis.asyncio as aioredis
from redis.client import Pipeline
import aiocache
from aiocache.serializers import PickleSerializer

# Time Series Database
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS, ASYNCHRONOUS

# Performance Monitoring
import psutil
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
CACHE_HITS = Counter('cache_hits_total', 'Total cache hits')
CACHE_MISSES = Counter('cache_misses_total', 'Total cache misses')
QUERY_DURATION = Histogram('query_duration_seconds', 'Query execution time')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active database connections')
AGGREGATION_LATENCY = Histogram('aggregation_latency_seconds', 'Aggregation processing time')

@dataclass
class AggregationConfig:
    """Configuration for real-time aggregation engine"""
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_pool_size: int = 20
    
    influxdb_url: str = "http://localhost:8086"
    influxdb_token: str = "your_token"
    influxdb_org: str = "your_org"
    influxdb_bucket: str = "marketing_analytics"
    
    cache_ttl_short: int = 300  # 5 minutes
    cache_ttl_medium: int = 1800  # 30 minutes
    cache_ttl_long: int = 7200  # 2 hours
    
    aggregation_window_sizes: List[int] = field(default_factory=lambda: [60, 300, 900, 3600, 86400])  # 1m, 5m, 15m, 1h, 1d
    max_memory_usage: float = 0.8
    batch_size: int = 1000
    parallel_workers: int = 4
    
    enable_prometheus: bool = True
    prometheus_port: int = 8000

@dataclass
class MetricDefinition:
    """Definition for an aggregated metric"""
    name: str
    aggregation_type: str  # sum, avg, count, min, max, percentile
    source_column: str
    filters: Dict[str, Any] = field(default_factory=dict)
    dimensions: List[str] = field(default_factory=list)
    percentile: Optional[float] = None

class TimeWindowManager:
    """Manage time-based aggregation windows"""
    
    def __init__(self, window_sizes: List[int]):
        self.window_sizes = sorted(window_sizes)
        
    def get_time_boundaries(self, timestamp: datetime, window_size: int) -> Tuple[datetime, datetime]:
        """Get start and end boundaries for a time window"""
        # Align to window boundaries
        epoch = timestamp.timestamp()
        aligned_epoch = (epoch // window_size) * window_size
        
        start_time = datetime.fromtimestamp(aligned_epoch)
        end_time = start_time + timedelta(seconds=window_size)
        
        return start_time, end_time
    
    def get_current_windows(self, timestamp: datetime) -> List[Tuple[int, datetime, datetime]]:
        """Get all current time windows for a timestamp"""
        windows = []
        for window_size in self.window_sizes:
            start_time, end_time = self.get_time_boundaries(timestamp, window_size)
            windows.append((window_size, start_time, end_time))
        return windows

class HighPerformanceCache:
    """High-performance caching layer with multiple strategies"""
    
    def __init__(self, config: AggregationConfig):
        self.config = config
        self.redis_pool = None
        self.local_cache = {}
        self.cache_stats = {"hits": 0, "misses": 0, "sets": 0}
        self.lock = threading.RLock()
        
    async def initialize(self):
        """Initialize async Redis connection pool"""
        self.redis_pool = aioredis.ConnectionPool.from_url(
            f"redis://{self.config.redis_host}:{self.config.redis_port}/{self.config.redis_db}",
            max_connections=self.config.redis_pool_size,
            encoding="utf-8",
            decode_responses=True
        )
        self.redis_client = aioredis.Redis(connection_pool=self.redis_pool)
        
    async def get(self, key: str, use_local: bool = True) -> Optional[Any]:
        """Get value from cache with multi-level strategy"""
        start_time = time.time()
        
        try:
            # Level 1: Local in-memory cache
            if use_local and key in self.local_cache:
                value, expiry = self.local_cache[key]
                if time.time() < expiry:
                    self.cache_stats["hits"] += 1
                    CACHE_HITS.inc()
                    return value
                else:
                    # Expired, remove from local cache
                    with self.lock:
                        self.local_cache.pop(key, None)
            
            # Level 2: Redis cache
            cached_data = await self.redis_client.get(key)
            if cached_data:
                try:
                    value = pickle.loads(cached_data.encode('latin1'))
                    
                    # Store in local cache for faster future access
                    if use_local:
                        with self.lock:
                            self.local_cache[key] = (value, time.time() + 60)  # 1 minute local TTL
                    
                    self.cache_stats["hits"] += 1
                    CACHE_HITS.inc()
                    return value
                except Exception as e:
                    logger.warning(f"Failed to deserialize cached data for key {key}: {str(e)}")
            
            # Cache miss
            self.cache_stats["misses"] += 1
            CACHE_MISSES.inc()
            return None
            
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {str(e)}")
            return None
        finally:
            QUERY_DURATION.observe(time.time() - start_time)
    
    async def set(self, key: str, value: Any, ttl: int, use_local: bool = True):
        """Set value in cache with TTL"""
        try:
            # Serialize value
            serialized_value = pickle.dumps(value).decode('latin1')
            
            # Store in Redis
            await self.redis_client.setex(key, ttl, serialized_value)
            
            # Store in local cache
            if use_local:
                with self.lock:
                    local_ttl = min(ttl, 300)  # Maximum 5 minutes in local cache
                    self.local_cache[key] = (value, time.time() + local_ttl)
            
            self.cache_stats["sets"] += 1
            
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {str(e)}")
    
    async def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching a pattern"""
        try:
            # Clear from Redis
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
            
            # Clear from local cache
            with self.lock:
                keys_to_remove = [k for k in self.local_cache.keys() if pattern.replace('*', '') in k]
                for key in keys_to_remove:
                    self.local_cache.pop(key, None)
                    
        except Exception as e:
            logger.error(f"Cache invalidation error for pattern {pattern}: {str(e)}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        hit_rate = (self.cache_stats["hits"] / total_requests) if total_requests > 0 else 0
        
        return {
            **self.cache_stats,
            "hit_rate": hit_rate,
            "local_cache_size": len(self.local_cache)
        }

class RealTimeAggregator:
    """Real-time data aggregation engine with sub-second performance"""
    
    def __init__(self, config: AggregationConfig):
        self.config = config
        self.cache = HighPerformanceCache(config)
        self.window_manager = TimeWindowManager(config.aggregation_window_sizes)
        self.metrics_registry = {}
        self.active_computations = {}
        self.computation_lock = asyncio.Lock()
        
        # Performance tracking
        self.performance_stats = {
            "queries_processed": 0,
            "avg_latency": 0,
            "cache_hit_rate": 0
        }
        
    async def initialize(self):
        """Initialize the aggregation engine"""
        await self.cache.initialize()
        
        if self.config.enable_prometheus:
            start_http_server(self.config.prometheus_port)
            logger.info(f"Prometheus metrics server started on port {self.config.prometheus_port}")
        
        logger.info("Real-time aggregation engine initialized")
    
    def register_metric(self, metric: MetricDefinition):
        """Register a new metric for aggregation"""
        self.metrics_registry[metric.name] = metric
        logger.info(f"Registered metric: {metric.name}")
    
    async def process_data_batch(self, data: pd.DataFrame, data_type: str):
        """Process a batch of data for real-time aggregation"""
        start_time = time.time()
        
        try:
            if data.empty:
                return
            
            # Process each registered metric
            for metric_name, metric_def in self.metrics_registry.items():
                await self._process_metric_batch(data, metric_def, data_type)
            
            # Update performance stats
            processing_time = time.time() - start_time
            AGGREGATION_LATENCY.observe(processing_time)
            
            logger.info(f"Processed batch of {len(data)} records in {processing_time:.3f}s")
            
        except Exception as e:
            logger.error(f"Error processing data batch: {str(e)}")
    
    async def _process_metric_batch(self, data: pd.DataFrame, metric: MetricDefinition, data_type: str):
        """Process a specific metric for a data batch"""
        
        # Apply filters
        filtered_data = data.copy()
        for filter_col, filter_val in metric.filters.items():
            if filter_col in filtered_data.columns:
                filtered_data = filtered_data[filtered_data[filter_col] == filter_val]
        
        if filtered_data.empty or metric.source_column not in filtered_data.columns:
            return
        
        # Get current timestamp
        current_time = datetime.now()
        
        # Process for each time window
        for window_size, start_time, end_time in self.window_manager.get_current_windows(current_time):
            await self._aggregate_metric_window(
                filtered_data, metric, data_type, window_size, start_time, end_time
            )
    
    async def _aggregate_metric_window(self, data: pd.DataFrame, metric: MetricDefinition,
                                     data_type: str, window_size: int, start_time: datetime, end_time: datetime):
        """Aggregate a metric for a specific time window"""
        
        # Create cache key
        cache_key = self._create_cache_key(metric.name, data_type, window_size, start_time, metric.dimensions)
        
        # Check if computation is already in progress
        async with self.computation_lock:
            if cache_key in self.active_computations:
                return
            self.active_computations[cache_key] = True
        
        try:
            # Get existing aggregation from cache
            existing_agg = await self.cache.get(cache_key)
            
            # Compute new aggregation
            new_agg = await self._compute_aggregation(data, metric)
            
            # Merge with existing aggregation
            if existing_agg:
                merged_agg = await self._merge_aggregations(existing_agg, new_agg, metric.aggregation_type)
            else:
                merged_agg = new_agg
            
            # Determine TTL based on window size
            ttl = self._get_cache_ttl(window_size)
            
            # Store in cache
            await self.cache.set(cache_key, merged_agg, ttl)
            
        finally:
            # Remove from active computations
            async with self.computation_lock:
                self.active_computations.pop(cache_key, None)
    
    async def _compute_aggregation(self, data: pd.DataFrame, metric: MetricDefinition) -> Dict[str, Any]:
        """Compute aggregation for a metric"""
        
        result = {}
        
        if metric.dimensions:
            # Group by dimensions
            grouped = data.groupby(metric.dimensions)
            
            if metric.aggregation_type == 'sum':
                result = grouped[metric.source_column].sum().to_dict()
            elif metric.aggregation_type == 'avg':
                result = grouped[metric.source_column].mean().to_dict()
            elif metric.aggregation_type == 'count':
                result = grouped.size().to_dict()
            elif metric.aggregation_type == 'min':
                result = grouped[metric.source_column].min().to_dict()
            elif metric.aggregation_type == 'max':
                result = grouped[metric.source_column].max().to_dict()
            elif metric.aggregation_type == 'percentile' and metric.percentile:
                result = grouped[metric.source_column].quantile(metric.percentile / 100).to_dict()
        else:
            # Aggregate entire dataset
            if metric.aggregation_type == 'sum':
                result = {'total': data[metric.source_column].sum()}
            elif metric.aggregation_type == 'avg':
                result = {'average': data[metric.source_column].mean()}
            elif metric.aggregation_type == 'count':
                result = {'count': len(data)}
            elif metric.aggregation_type == 'min':
                result = {'minimum': data[metric.source_column].min()}
            elif metric.aggregation_type == 'max':
                result = {'maximum': data[metric.source_column].max()}
            elif metric.aggregation_type == 'percentile' and metric.percentile:
                result = {'percentile': data[metric.source_column].quantile(metric.percentile / 100)}
        
        return {
            'values': result,
            'count': len(data),
            'timestamp': datetime.now().isoformat()
        }
    
    async def _merge_aggregations(self, existing: Dict[str, Any], new: Dict[str, Any], agg_type: str) -> Dict[str, Any]:
        """Merge existing and new aggregations"""
        
        if agg_type == 'sum':
            # Add values
            merged_values = {}
            for key in set(existing['values'].keys()) | set(new['values'].keys()):
                existing_val = existing['values'].get(key, 0)
                new_val = new['values'].get(key, 0)
                merged_values[key] = existing_val + new_val
        
        elif agg_type == 'count':
            # Add counts
            merged_values = {}
            for key in set(existing['values'].keys()) | set(new['values'].keys()):
                existing_val = existing['values'].get(key, 0)
                new_val = new['values'].get(key, 0)
                merged_values[key] = existing_val + new_val
        
        elif agg_type == 'avg':
            # Weighted average
            merged_values = {}
            total_count = existing['count'] + new['count']
            
            for key in set(existing['values'].keys()) | set(new['values'].keys()):
                existing_val = existing['values'].get(key, 0)
                new_val = new['values'].get(key, 0)
                
                if total_count > 0:
                    weighted_avg = (
                        (existing_val * existing['count'] + new_val * new['count']) / total_count
                    )
                    merged_values[key] = weighted_avg
                else:
                    merged_values[key] = 0
        
        elif agg_type in ['min', 'max']:
            # Min/Max values
            merged_values = {}
            for key in set(existing['values'].keys()) | set(new['values'].keys()):
                existing_val = existing['values'].get(key)
                new_val = new['values'].get(key)
                
                if existing_val is None:
                    merged_values[key] = new_val
                elif new_val is None:
                    merged_values[key] = existing_val
                else:
                    if agg_type == 'min':
                        merged_values[key] = min(existing_val, new_val)
                    else:  # max
                        merged_values[key] = max(existing_val, new_val)
        
        else:
            # Default: use new values
            merged_values = new['values']
        
        return {
            'values': merged_values,
            'count': existing['count'] + new['count'],
            'timestamp': new['timestamp']
        }
    
    def _create_cache_key(self, metric_name: str, data_type: str, window_size: int,
                         start_time: datetime, dimensions: List[str]) -> str:
        """Create a cache key for an aggregation"""
        
        # Create deterministic key
        key_parts = [
            metric_name,
            data_type,
            str(window_size),
            start_time.strftime('%Y%m%d_%H%M%S'),
            '_'.join(sorted(dimensions))
        ]
        
        key_string = ':'.join(key_parts)
        return f"agg:{hashlib.md5(key_string.encode()).hexdigest()}"
    
    def _get_cache_ttl(self, window_size: int) -> int:
        """Get appropriate TTL based on window size"""
        
        if window_size <= 300:  # 5 minutes or less
            return self.config.cache_ttl_short
        elif window_size <= 3600:  # 1 hour or less
            return self.config.cache_ttl_medium
        else:
            return self.config.cache_ttl_long
    
    async def query_aggregation(self, metric_name: str, data_type: str, 
                              window_size: int, start_time: datetime,
                              dimensions: List[str] = None, filters: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Query aggregated data with sub-second performance"""
        
        query_start_time = time.time()
        
        try:
            # Create cache key
            cache_key = self._create_cache_key(metric_name, data_type, window_size, start_time, dimensions or [])
            
            # Get from cache
            result = await self.cache.get(cache_key)
            
            # Apply additional filters if needed
            if result and filters:
                result = self._apply_query_filters(result, filters)
            
            # Update performance stats
            query_time = time.time() - query_start_time
            QUERY_DURATION.observe(query_time)
            
            self.performance_stats["queries_processed"] += 1
            self.performance_stats["avg_latency"] = (
                (self.performance_stats["avg_latency"] * (self.performance_stats["queries_processed"] - 1) + query_time) /
                self.performance_stats["queries_processed"]
            )
            
            logger.debug(f"Query completed in {query_time:.3f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Query error: {str(e)}")
            return None
    
    def _apply_query_filters(self, data: Dict[str, Any], filters: Dict[str, Any]) -> Dict[str, Any]:
        """Apply additional filters to query results"""
        
        # This is a simple implementation - in practice, you might need more sophisticated filtering
        filtered_values = {}
        
        for key, value in data['values'].items():
            # Apply filters based on key patterns or values
            include = True
            for filter_key, filter_val in filters.items():
                if filter_key in str(key) and str(filter_val) not in str(key):
                    include = False
                    break
            
            if include:
                filtered_values[key] = value
        
        return {
            **data,
            'values': filtered_values
        }
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get aggregation engine performance statistics"""
        
        cache_stats = self.cache.get_stats()
        memory_info = psutil.virtual_memory()
        
        return {
            "aggregation_stats": self.performance_stats,
            "cache_stats": cache_stats,
            "memory_usage": {
                "percent": memory_info.percent,
                "available_gb": memory_info.available / (1024**3)
            },
            "active_computations": len(self.active_computations)
        }

class DashboardQueryOptimizer:
    """Optimize queries for dashboard consumption"""
    
    def __init__(self, aggregator: RealTimeAggregator):
        self.aggregator = aggregator
        self.query_cache = {}
        
    async def get_dashboard_data(self, query_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Get optimized data for dashboard consumption"""
        
        start_time = time.time()
        
        # Extract query parameters
        metrics = query_spec.get('metrics', [])
        time_range = query_spec.get('time_range', {})
        filters = query_spec.get('filters', {})
        granularity = query_spec.get('granularity', 3600)  # 1 hour default
        
        # Determine optimal time windows
        start_dt = datetime.fromisoformat(time_range['start'])
        end_dt = datetime.fromisoformat(time_range['end'])
        
        # Build aggregated response
        response = {
            'data': {},
            'metadata': {
                'query_time': 0,
                'cache_hit_rate': 0,
                'data_points': 0
            }
        }
        
        # Process each metric
        for metric_spec in metrics:
            metric_name = metric_spec['name']
            data_type = metric_spec.get('data_type', 'unknown')
            dimensions = metric_spec.get('dimensions', [])
            
            # Query aggregated data
            metric_data = await self._query_metric_time_series(
                metric_name, data_type, start_dt, end_dt, granularity, dimensions, filters
            )
            
            response['data'][metric_name] = metric_data
        
        # Update metadata
        response['metadata']['query_time'] = time.time() - start_time
        response['metadata']['cache_hit_rate'] = self.aggregator.cache.get_stats()['hit_rate']
        
        return response
    
    async def _query_metric_time_series(self, metric_name: str, data_type: str,
                                      start_time: datetime, end_time: datetime,
                                      granularity: int, dimensions: List[str],
                                      filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Query time series data for a metric"""
        
        time_series = []
        current_time = start_time
        
        while current_time < end_time:
            # Query aggregation for this time window
            window_data = await self.aggregator.query_aggregation(
                metric_name, data_type, granularity, current_time, dimensions, filters
            )
            
            if window_data:
                time_series.append({
                    'timestamp': current_time.isoformat(),
                    'values': window_data['values'],
                    'count': window_data['count']
                })
            
            current_time += timedelta(seconds=granularity)
        
        return time_series

async def main():
    """Main function demonstrating the real-time aggregation engine"""
    
    config = AggregationConfig(
        cache_ttl_short=300,
        cache_ttl_medium=1800,
        cache_ttl_long=7200,
        aggregation_window_sizes=[60, 300, 900, 3600, 86400],
        enable_prometheus=True
    )
    
    # Initialize aggregation engine
    aggregator = RealTimeAggregator(config)
    await aggregator.initialize()
    
    # Register metrics
    metrics = [
        MetricDefinition("total_spend", "sum", "spend", dimensions=["campaign_name"]),
        MetricDefinition("avg_ctr", "avg", "ctr", dimensions=["utm_source"]),
        MetricDefinition("conversion_count", "count", "conversions", dimensions=["utm_campaign"]),
        MetricDefinition("max_roas", "max", "roas", dimensions=["platform"])
    ]
    
    for metric in metrics:
        aggregator.register_metric(metric)
    
    # Initialize dashboard query optimizer
    optimizer = DashboardQueryOptimizer(aggregator)
    
    # Simulate data processing
    sample_data = pd.DataFrame({
        'campaign_name': ['campaign_a', 'campaign_b'] * 500,
        'utm_source': ['google', 'facebook'] * 500,
        'utm_campaign': ['summer_sale', 'winter_promo'] * 500,
        'platform': ['meta_ads', 'google_ads'] * 500,
        'spend': np.random.uniform(10, 1000, 1000),
        'ctr': np.random.uniform(0.01, 0.1, 1000),
        'conversions': np.random.randint(0, 50, 1000),
        'roas': np.random.uniform(0.5, 5.0, 1000)
    })
    
    logger.info("Processing sample data batch")
    await aggregator.process_data_batch(sample_data, 'meta_ads')
    
    # Simulate dashboard query
    query_spec = {
        'metrics': [
            {'name': 'total_spend', 'data_type': 'meta_ads', 'dimensions': ['campaign_name']},
            {'name': 'avg_ctr', 'data_type': 'meta_ads', 'dimensions': ['utm_source']}
        ],
        'time_range': {
            'start': (datetime.now() - timedelta(hours=1)).isoformat(),
            'end': datetime.now().isoformat()
        },
        'granularity': 3600,
        'filters': {}
    }
    
    logger.info("Executing dashboard query")
    dashboard_data = await optimizer.get_dashboard_data(query_spec)
    
    # Get performance stats
    perf_stats = await aggregator.get_performance_stats()
    
    logger.info(f"Dashboard query completed in {dashboard_data['metadata']['query_time']:.3f}s")
    logger.info(f"Cache hit rate: {perf_stats['cache_stats']['hit_rate']:.2%}")
    logger.info(f"Memory usage: {perf_stats['memory_usage']['percent']:.1f}%")
    
    logger.info("Real-time aggregation engine demonstration completed")

if __name__ == "__main__":
    asyncio.run(main())