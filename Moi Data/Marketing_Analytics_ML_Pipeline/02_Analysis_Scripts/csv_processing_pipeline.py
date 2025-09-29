"""
Marketing Analytics ML Pipeline - Memory-Efficient CSV Processing
Enterprise-scale data processing with streaming capabilities for 100k+ row datasets
"""

import pandas as pd
import numpy as np
from typing import Iterator, Dict, List, Any, Optional, Tuple
import asyncio
import aiofiles
import json
import hashlib
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import dask.dataframe as dd
from dask.distributed import Client
import pyarrow as pa
import pyarrow.parquet as pq
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import IsolationForest
import redis
import psutil
import gc
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ProcessingConfig:
    """Configuration for CSV processing pipeline"""
    chunk_size: int = 10000
    max_memory_usage: float = 0.7  # 70% of available memory
    parallel_workers: int = min(4, psutil.cpu_count())
    cache_ttl: int = 3600  # 1 hour
    redis_host: str = "localhost"
    redis_port: int = 6379
    enable_ml_cleaning: bool = True
    enable_streaming: bool = True

class MemoryMonitor:
    """Monitor and manage memory usage during processing"""
    
    def __init__(self, max_usage: float = 0.7):
        self.max_usage = max_usage
        
    def check_memory(self) -> bool:
        """Check if memory usage is within limits"""
        memory_percent = psutil.virtual_memory().percent / 100
        return memory_percent < self.max_usage
    
    def force_gc(self):
        """Force garbage collection to free memory"""
        gc.collect()
        
    def get_memory_info(self) -> Dict[str, float]:
        """Get current memory usage information"""
        memory = psutil.virtual_memory()
        return {
            "total": memory.total / (1024**3),  # GB
            "available": memory.available / (1024**3),  # GB
            "percent": memory.percent,
            "used": memory.used / (1024**3)  # GB
        }

class StreamingCSVProcessor:
    """High-performance CSV processor with streaming capabilities"""
    
    def __init__(self, config: ProcessingConfig):
        self.config = config
        self.memory_monitor = MemoryMonitor(config.max_memory_usage)
        self.redis_client = redis.Redis(host=config.redis_host, port=config.redis_port, decode_responses=True)
        self.ml_models = {}
        self.data_schemas = {}
        
    async def process_csv_stream(self, file_path: str, data_type: str) -> Iterator[pd.DataFrame]:
        """
        Stream process large CSV files with memory optimization
        
        Args:
            file_path: Path to CSV file
            data_type: Type of data (shopify, meta_ads, google_ads)
            
        Yields:
            Processed DataFrame chunks
        """
        logger.info(f"Starting streaming processing of {file_path} (type: {data_type})")
        
        # Validate schema and infer data types
        schema = await self._infer_schema(file_path, data_type)
        self.data_schemas[data_type] = schema
        
        chunk_count = 0
        total_rows = 0
        
        try:
            # Process CSV in chunks
            async for chunk in self._read_csv_chunks(file_path, schema):
                if not self.memory_monitor.check_memory():
                    logger.warning("Memory usage high, forcing garbage collection")
                    self.memory_monitor.force_gc()
                    await asyncio.sleep(0.1)  # Brief pause for memory cleanup
                
                # Clean and validate chunk
                cleaned_chunk = await self._clean_chunk(chunk, data_type)
                
                # Apply ML-based data quality checks
                if self.config.enable_ml_cleaning:
                    cleaned_chunk = await self._ml_data_cleaning(cleaned_chunk, data_type)
                
                # Cache processed chunk
                chunk_key = f"{data_type}:chunk:{chunk_count}"
                await self._cache_chunk(chunk_key, cleaned_chunk)
                
                chunk_count += 1
                total_rows += len(cleaned_chunk)
                
                logger.info(f"Processed chunk {chunk_count}, rows: {len(cleaned_chunk)}, total: {total_rows}")
                yield cleaned_chunk
                
        except Exception as e:
            logger.error(f"Error processing CSV stream: {str(e)}")
            raise
            
        logger.info(f"Completed streaming processing: {chunk_count} chunks, {total_rows} total rows")

    async def _read_csv_chunks(self, file_path: str, schema: Dict) -> Iterator[pd.DataFrame]:
        """Read CSV file in optimized chunks"""
        
        # Determine optimal chunk size based on available memory
        memory_info = self.memory_monitor.get_memory_info()
        optimal_chunk_size = min(
            self.config.chunk_size,
            int(memory_info['available'] * 1024 * 1024 * 0.1)  # 10% of available memory
        )
        
        dtype_mapping = schema.get('dtypes', {})
        
        try:
            chunk_reader = pd.read_csv(
                file_path,
                chunksize=optimal_chunk_size,
                dtype=dtype_mapping,
                parse_dates=schema.get('date_columns', []),
                low_memory=False,
                engine='c'  # Use C engine for better performance
            )
            
            for chunk in chunk_reader:
                yield chunk
                
        except Exception as e:
            logger.error(f"Error reading CSV chunks: {str(e)}")
            raise

    async def _infer_schema(self, file_path: str, data_type: str) -> Dict:
        """Infer optimal schema for CSV processing"""
        
        # Read small sample to infer schema
        sample_df = pd.read_csv(file_path, nrows=1000)
        
        schema = {
            'dtypes': {},
            'date_columns': [],
            'numeric_columns': [],
            'categorical_columns': []
        }
        
        for column in sample_df.columns:
            # Detect data types
            if sample_df[column].dtype == 'object':
                # Check if it's a date column
                if any(keyword in column.lower() for keyword in ['date', 'time', 'created', 'updated']):
                    schema['date_columns'].append(column)
                else:
                    # Check if it's actually numeric
                    try:
                        pd.to_numeric(sample_df[column].dropna(), errors='raise')
                        schema['dtypes'][column] = 'float64'
                        schema['numeric_columns'].append(column)
                    except:
                        schema['dtypes'][column] = 'category'
                        schema['categorical_columns'].append(column)
            else:
                schema['numeric_columns'].append(column)
                
        # Apply data type specific optimizations
        schema = self._optimize_schema_for_data_type(schema, data_type)
        
        return schema

    def _optimize_schema_for_data_type(self, schema: Dict, data_type: str) -> Dict:
        """Optimize schema based on data source type"""
        
        if data_type == 'shopify':
            # Shopify-specific optimizations
            for col in ['customer_id', 'session_id', 'order_id']:
                if col in schema['dtypes']:
                    schema['dtypes'][col] = 'category'
                    
        elif data_type == 'meta_ads':
            # Meta Ads optimizations
            for col in ['campaign_id', 'adset_id', 'ad_id']:
                if col in schema['dtypes']:
                    schema['dtypes'][col] = 'category'
                    
        elif data_type == 'google_ads':
            # Google Ads optimizations
            for col in ['campaign_id', 'ad_group_id', 'keyword_id']:
                if col in schema['dtypes']:
                    schema['dtypes'][col] = 'category'
                    
        return schema

    async def _clean_chunk(self, chunk: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Clean and standardize chunk data"""
        
        # Remove duplicates
        chunk = chunk.drop_duplicates()
        
        # Handle missing values based on column type
        for column in chunk.columns:
            if chunk[column].dtype in ['float64', 'int64']:
                # Fill numeric missing values with median
                chunk[column] = chunk[column].fillna(chunk[column].median())
            else:
                # Fill categorical missing values with mode or 'unknown'
                mode_val = chunk[column].mode()
                fill_val = mode_val[0] if len(mode_val) > 0 else 'unknown'
                chunk[column] = chunk[column].fillna(fill_val)
        
        # Standardize column names
        chunk.columns = [col.lower().strip().replace(' ', '_') for col in chunk.columns]
        
        # Apply data-type specific cleaning
        chunk = await self._apply_data_type_cleaning(chunk, data_type)
        
        return chunk

    async def _apply_data_type_cleaning(self, chunk: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Apply cleaning rules specific to data source type"""
        
        if data_type == 'shopify':
            # Shopify-specific cleaning
            if 'email' in chunk.columns:
                chunk['email'] = chunk['email'].str.lower().str.strip()
            if 'total_price' in chunk.columns:
                chunk['total_price'] = pd.to_numeric(chunk['total_price'], errors='coerce')
                
        elif data_type == 'meta_ads':
            # Meta Ads cleaning
            if 'spend' in chunk.columns:
                chunk['spend'] = pd.to_numeric(chunk['spend'], errors='coerce')
            if 'impressions' in chunk.columns:
                chunk['impressions'] = pd.to_numeric(chunk['impressions'], errors='coerce').astype('Int64')
                
        elif data_type == 'google_ads':
            # Google Ads cleaning
            if 'cost' in chunk.columns:
                chunk['cost'] = pd.to_numeric(chunk['cost'], errors='coerce')
            if 'clicks' in chunk.columns:
                chunk['clicks'] = pd.to_numeric(chunk['clicks'], errors='coerce').astype('Int64')
                
        return chunk

    async def _ml_data_cleaning(self, chunk: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Apply machine learning-based data cleaning and outlier detection"""
        
        if data_type not in self.ml_models:
            # Initialize ML models for this data type
            self.ml_models[data_type] = {
                'outlier_detector': IsolationForest(contamination=0.1, random_state=42),
                'scalers': {}
            }
        
        # Identify numeric columns for outlier detection
        numeric_cols = chunk.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) > 0:
            # Fit outlier detector if not already fitted
            if not hasattr(self.ml_models[data_type]['outlier_detector'], 'decision_function'):
                # Prepare data for fitting
                numeric_data = chunk[numeric_cols].fillna(0)
                self.ml_models[data_type]['outlier_detector'].fit(numeric_data)
            
            # Detect outliers
            numeric_data = chunk[numeric_cols].fillna(0)
            outlier_labels = self.ml_models[data_type]['outlier_detector'].predict(numeric_data)
            
            # Mark outliers (optional: remove or flag)
            chunk['is_outlier'] = outlier_labels == -1
            
            # Log outlier statistics
            outlier_count = sum(outlier_labels == -1)
            if outlier_count > 0:
                logger.info(f"Detected {outlier_count} outliers in {data_type} chunk")
        
        return chunk

    async def _cache_chunk(self, key: str, chunk: pd.DataFrame):
        """Cache processed chunk in Redis"""
        try:
            # Convert DataFrame to JSON for caching
            chunk_json = chunk.to_json(orient='records')
            
            # Set with TTL
            self.redis_client.setex(
                key, 
                self.config.cache_ttl,
                chunk_json
            )
            
        except Exception as e:
            logger.warning(f"Failed to cache chunk {key}: {str(e)}")

    async def get_cached_chunk(self, key: str) -> Optional[pd.DataFrame]:
        """Retrieve cached chunk from Redis"""
        try:
            cached_data = self.redis_client.get(key)
            if cached_data:
                return pd.read_json(cached_data, orient='records')
            return None
            
        except Exception as e:
            logger.warning(f"Failed to retrieve cached chunk {key}: {str(e)}")
            return None

class UTMCampaignConsolidator:
    """Consolidate UTM campaigns across multiple platforms"""
    
    def __init__(self, processor: StreamingCSVProcessor):
        self.processor = processor
        
    async def consolidate_campaigns(self, platform_data: Dict[str, List[pd.DataFrame]]) -> pd.DataFrame:
        """
        Consolidate campaign data across platforms using UTM parameters
        
        Args:
            platform_data: Dictionary with platform name and list of DataFrames
            
        Returns:
            Consolidated DataFrame with unified campaign view
        """
        logger.info("Starting UTM campaign consolidation")
        
        consolidated_chunks = []
        
        for platform, chunks in platform_data.items():
            for chunk in chunks:
                # Extract and standardize UTM parameters
                standardized_chunk = await self._standardize_utm_parameters(chunk, platform)
                consolidated_chunks.append(standardized_chunk)
        
        # Combine all chunks
        if consolidated_chunks:
            consolidated_df = pd.concat(consolidated_chunks, ignore_index=True)
            
            # Group by UTM parameters and aggregate metrics
            consolidated_df = await self._aggregate_campaign_metrics(consolidated_df)
            
            logger.info(f"Consolidated {len(consolidated_df)} campaign records")
            return consolidated_df
        
        return pd.DataFrame()

    async def _standardize_utm_parameters(self, chunk: pd.DataFrame, platform: str) -> pd.DataFrame:
        """Standardize UTM parameters across platforms"""
        
        # Add platform identifier
        chunk['platform'] = platform
        
        # Standardize UTM column names
        utm_mapping = {
            'utm_source': ['source', 'utm_source', 'traffic_source'],
            'utm_medium': ['medium', 'utm_medium', 'traffic_medium'],
            'utm_campaign': ['campaign', 'utm_campaign', 'campaign_name'],
            'utm_term': ['term', 'utm_term', 'keyword'],
            'utm_content': ['content', 'utm_content', 'ad_content']
        }
        
        for standard_name, possible_names in utm_mapping.items():
            for col_name in possible_names:
                if col_name in chunk.columns:
                    chunk[standard_name] = chunk[col_name]
                    break
            
            # Fill missing UTM parameters
            if standard_name not in chunk.columns:
                chunk[standard_name] = f'unknown_{platform}'
        
        # Create unified campaign identifier
        chunk['campaign_key'] = (
            chunk['utm_source'].astype(str) + '_' +
            chunk['utm_medium'].astype(str) + '_' +
            chunk['utm_campaign'].astype(str)
        )
        
        return chunk

    async def _aggregate_campaign_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Aggregate metrics by campaign across platforms"""
        
        # Define aggregation rules for different metric types
        agg_rules = {
            'impressions': 'sum',
            'clicks': 'sum',
            'spend': 'sum',
            'cost': 'sum',
            'conversions': 'sum',
            'revenue': 'sum',
            'sessions': 'sum',
            'users': 'sum'
        }
        
        # Apply aggregation only to columns that exist
        available_agg_rules = {k: v for k, v in agg_rules.items() if k in df.columns}
        
        if available_agg_rules:
            # Group by campaign and aggregate
            grouped = df.groupby(['campaign_key', 'utm_source', 'utm_medium', 'utm_campaign']).agg(available_agg_rules).reset_index()
            
            # Calculate derived metrics
            if 'clicks' in grouped.columns and 'impressions' in grouped.columns:
                grouped['ctr'] = (grouped['clicks'] / grouped['impressions']).fillna(0)
            
            if 'spend' in grouped.columns and 'clicks' in grouped.columns:
                grouped['cpc'] = (grouped['spend'] / grouped['clicks']).fillna(0)
            
            if 'conversions' in grouped.columns and 'clicks' in grouped.columns:
                grouped['conversion_rate'] = (grouped['conversions'] / grouped['clicks']).fillna(0)
            
            if 'revenue' in grouped.columns and 'spend' in grouped.columns:
                grouped['roas'] = (grouped['revenue'] / grouped['spend']).fillna(0)
            
            return grouped
        
        return df

class PerformanceOptimizer:
    """Optimize processing performance for large datasets"""
    
    def __init__(self, config: ProcessingConfig):
        self.config = config
        
    @lru_cache(maxsize=128)
    def get_optimal_chunk_size(self, file_size: int, memory_available: float) -> int:
        """Calculate optimal chunk size based on file size and available memory"""
        
        # Base chunk size on available memory and file size
        memory_based_chunk = int(memory_available * 0.1 * 1024 * 1024)  # 10% of available memory
        file_based_chunk = max(1000, int(file_size / 100))  # 1% of file size, minimum 1000
        
        return min(memory_based_chunk, file_based_chunk, self.config.chunk_size)
    
    async def parallel_chunk_processing(self, chunks: List[pd.DataFrame], 
                                      processing_func, *args) -> List[pd.DataFrame]:
        """Process chunks in parallel for better performance"""
        
        with ThreadPoolExecutor(max_workers=self.config.parallel_workers) as executor:
            # Submit all chunk processing tasks
            futures = [
                executor.submit(processing_func, chunk, *args) 
                for chunk in chunks
            ]
            
            # Collect results as they complete
            results = []
            for future in futures:
                try:
                    result = future.result(timeout=300)  # 5 minute timeout per chunk
                    results.append(result)
                except Exception as e:
                    logger.error(f"Chunk processing failed: {str(e)}")
                    
        return results

async def main():
    """Main function demonstrating the CSV processing pipeline"""
    
    config = ProcessingConfig(
        chunk_size=10000,
        max_memory_usage=0.7,
        parallel_workers=4,
        enable_ml_cleaning=True,
        enable_streaming=True
    )
    
    processor = StreamingCSVProcessor(config)
    consolidator = UTMCampaignConsolidator(processor)
    
    # Example usage
    sample_files = {
        'shopify': 'sample_shopify_data.csv',
        'meta_ads': 'sample_meta_ads.csv',
        'google_ads': 'sample_google_ads.csv'
    }
    
    platform_data = {}
    
    for platform, file_path in sample_files.items():
        try:
            chunks = []
            async for chunk in processor.process_csv_stream(file_path, platform):
                chunks.append(chunk)
            platform_data[platform] = chunks
            
        except FileNotFoundError:
            logger.warning(f"Sample file {file_path} not found, skipping {platform}")
    
    # Consolidate campaigns if we have data
    if platform_data:
        consolidated_data = await consolidator.consolidate_campaigns(platform_data)
        logger.info(f"Final consolidated dataset shape: {consolidated_data.shape}")
    
    logger.info("CSV processing pipeline demonstration completed")

if __name__ == "__main__":
    asyncio.run(main())