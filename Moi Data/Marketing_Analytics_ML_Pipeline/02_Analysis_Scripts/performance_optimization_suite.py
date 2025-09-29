"""
Marketing Analytics ML Pipeline - Performance Optimization Suite
Advanced optimization techniques for processing 100k+ row datasets with enterprise-grade performance
"""

import time
import logging
import asyncio
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from typing import Dict, List, Any, Optional, Tuple, Callable
import psutil
import gc
from dataclasses import dataclass, field
from functools import wraps, lru_cache
import cProfile
import pstats
import io
from contextlib import contextmanager

# Data Processing Libraries
import pandas as pd
import numpy as np
import dask.dataframe as dd
from dask.distributed import Client, LocalCluster
import polars as pl
import pyarrow as pa
import pyarrow.parquet as pq
import pyarrow.csv as pv

# Machine Learning Optimization
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import IncrementalPCA
from sklearn.cluster import MiniBatchKMeans
import numba
from numba import jit, cuda
import cudf  # RAPIDS GPU acceleration (if available)
import cupy as cp  # GPU arrays

# Memory Management
import tracemalloc
from pympler import tracker, muppy, summary

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PerformanceConfig:
    """Configuration for performance optimization"""
    # Memory optimization
    max_memory_usage_percent: float = 70.0
    chunk_size_mb: int = 100
    enable_memory_mapping: bool = True
    
    # CPU optimization
    use_multiprocessing: bool = True
    max_workers: int = min(8, mp.cpu_count())
    use_gpu_acceleration: bool = False
    
    # Data optimization
    use_categorical_optimization: bool = True
    use_sparse_matrices: bool = True
    enable_compression: bool = True
    
    # Caching
    enable_intermediate_caching: bool = True
    cache_directory: str = "/tmp/ml_pipeline_cache"
    
    # Monitoring
    enable_profiling: bool = True
    enable_memory_tracking: bool = True
    performance_log_interval: int = 10

class MemoryOptimizer:
    """Advanced memory optimization techniques"""
    
    def __init__(self, config: PerformanceConfig):
        self.config = config
        self.memory_tracker = tracker.SummaryTracker()
        
    @contextmanager
    def memory_monitor(self, operation_name: str):
        """Monitor memory usage for operations"""
        if self.config.enable_memory_tracking:
            tracemalloc.start()
            initial_memory = psutil.virtual_memory().used
            
        yield
        
        if self.config.enable_memory_tracking:
            current, peak = tracemalloc.get_traced_memory()
            final_memory = psutil.virtual_memory().used
            tracemalloc.stop()
            
            logger.info(f"{operation_name} - Memory: Initial={initial_memory/1024**3:.2f}GB, "
                       f"Final={final_memory/1024**3:.2f}GB, Peak={peak/1024**3:.2f}GB")
    
    def optimize_dataframe_memory(self, df: pd.DataFrame) -> pd.DataFrame:
        """Optimize DataFrame memory usage"""
        logger.info(f"Optimizing DataFrame memory. Initial size: {df.memory_usage(deep=True).sum()/1024**2:.2f} MB")
        
        optimized_df = df.copy()
        
        # Optimize numeric columns
        for col in optimized_df.select_dtypes(include=[np.number]).columns:
            col_min = optimized_df[col].min()
            col_max = optimized_df[col].max()
            
            if optimized_df[col].dtype == 'int64':
                if col_min > np.iinfo(np.int8).min and col_max < np.iinfo(np.int8).max:
                    optimized_df[col] = optimized_df[col].astype(np.int8)
                elif col_min > np.iinfo(np.int16).min and col_max < np.iinfo(np.int16).max:
                    optimized_df[col] = optimized_df[col].astype(np.int16)
                elif col_min > np.iinfo(np.int32).min and col_max < np.iinfo(np.int32).max:
                    optimized_df[col] = optimized_df[col].astype(np.int32)
                    
            elif optimized_df[col].dtype == 'float64':
                if col_min > np.finfo(np.float16).min and col_max < np.finfo(np.float16).max:
                    optimized_df[col] = optimized_df[col].astype(np.float32)
        
        # Optimize categorical columns
        if self.config.use_categorical_optimization:
            for col in optimized_df.select_dtypes(include=['object']).columns:
                num_unique_values = len(optimized_df[col].unique())
                num_total_values = len(optimized_df[col])
                
                if num_unique_values / num_total_values < 0.5:  # Less than 50% unique
                    optimized_df[col] = optimized_df[col].astype('category')
        
        final_size = optimized_df.memory_usage(deep=True).sum() / 1024**2
        initial_size = df.memory_usage(deep=True).sum() / 1024**2
        reduction = (1 - final_size / initial_size) * 100
        
        logger.info(f"Memory optimization complete. Final size: {final_size:.2f} MB. "
                   f"Reduction: {reduction:.1f}%")
        
        return optimized_df
    
    def get_optimal_chunk_size(self, df_size_mb: float) -> int:
        """Calculate optimal chunk size based on available memory"""
        available_memory_gb = psutil.virtual_memory().available / 1024**3
        max_memory_for_processing = available_memory_gb * (self.config.max_memory_usage_percent / 100)
        
        # Calculate chunk size to use ~20% of available memory per chunk
        target_chunk_memory_gb = max_memory_for_processing * 0.2
        chunk_size = int((target_chunk_memory_gb * 1024) / (df_size_mb / 1000))  # Convert to rows
        
        return max(1000, min(chunk_size, 100000))  # Ensure reasonable bounds

class CPUOptimizer:
    """CPU and parallel processing optimization"""
    
    def __init__(self, config: PerformanceConfig):
        self.config = config
        self.cpu_count = mp.cpu_count()
        
    @staticmethod
    @jit(nopython=True)
    def numba_vectorized_operation(arr: np.ndarray) -> np.ndarray:
        """Example of Numba-optimized operation"""
        result = np.zeros(len(arr))
        for i in range(len(arr)):
            result[i] = arr[i] * 2 + 1  # Example operation
        return result
    
    def parallel_dataframe_operation(self, df: pd.DataFrame, 
                                   operation_func: Callable, 
                                   *args, **kwargs) -> pd.DataFrame:
        """Apply operation to DataFrame in parallel chunks"""
        
        if not self.config.use_multiprocessing or len(df) < 10000:
            return operation_func(df, *args, **kwargs)
        
        # Calculate chunk size
        chunk_size = len(df) // self.config.max_workers
        chunks = [df[i:i + chunk_size] for i in range(0, len(df), chunk_size)]
        
        with ProcessPoolExecutor(max_workers=self.config.max_workers) as executor:
            futures = [executor.submit(operation_func, chunk, *args, **kwargs) for chunk in chunks]
            results = [future.result() for future in as_completed(futures)]
        
        return pd.concat(results, ignore_index=True)
    
    async def async_parallel_processing(self, data_chunks: List[pd.DataFrame],
                                      async_operation: Callable) -> List[Any]:
        """Process data chunks asynchronously"""
        
        semaphore = asyncio.Semaphore(self.config.max_workers)
        
        async def process_chunk(chunk):
            async with semaphore:
                return await async_operation(chunk)
        
        tasks = [process_chunk(chunk) for chunk in data_chunks]
        results = await asyncio.gather(*tasks)
        
        return results

class GPUAccelerator:
    """GPU acceleration for compatible operations"""
    
    def __init__(self, config: PerformanceConfig):
        self.config = config
        self.gpu_available = self._check_gpu_availability()
        
    def _check_gpu_availability(self) -> bool:
        """Check if GPU acceleration is available"""
        try:
            import cudf
            import cupy as cp
            cp.cuda.Device(0).compute_capability
            return True
        except:
            logger.warning("GPU acceleration not available, falling back to CPU")
            return False
    
    def process_with_gpu(self, df: pd.DataFrame, operation: str) -> pd.DataFrame:
        """Process DataFrame operations on GPU when available"""
        
        if not self.gpu_available or not self.config.use_gpu_acceleration:
            return self._fallback_cpu_operation(df, operation)
        
        try:
            # Convert to cuDF for GPU processing
            gpu_df = cudf.from_pandas(df)
            
            if operation == 'groupby_sum':
                # Example GPU-accelerated groupby
                result = gpu_df.groupby('category').sum()
            elif operation == 'sort':
                result = gpu_df.sort_values('value')
            elif operation == 'filter':
                result = gpu_df[gpu_df['value'] > gpu_df['value'].mean()]
            else:
                result = gpu_df
            
            # Convert back to pandas
            return result.to_pandas()
            
        except Exception as e:
            logger.warning(f"GPU operation failed: {str(e)}, falling back to CPU")
            return self._fallback_cpu_operation(df, operation)
    
    def _fallback_cpu_operation(self, df: pd.DataFrame, operation: str) -> pd.DataFrame:
        """Fallback CPU operations"""
        if operation == 'groupby_sum':
            return df.groupby('category').sum().reset_index()
        elif operation == 'sort':
            return df.sort_values('value')
        elif operation == 'filter':
            return df[df['value'] > df['value'].mean()]
        else:
            return df

class DataFormatOptimizer:
    """Optimize data formats for performance"""
    
    def __init__(self, config: PerformanceConfig):
        self.config = config
        
    def optimize_for_analytics(self, df: pd.DataFrame, filename: str) -> str:
        """Convert DataFrame to optimized format for analytics"""
        
        # Convert to Apache Parquet for better compression and query performance
        parquet_path = f"{filename}.parquet"
        
        # Optimize schema
        schema_optimized_df = self._optimize_schema(df)
        
        # Write with compression
        schema_optimized_df.to_parquet(
            parquet_path,
            compression='snappy',
            index=False,
            engine='pyarrow'
        )
        
        original_size = df.memory_usage(deep=True).sum()
        parquet_size = pa.parquet.read_metadata(parquet_path).serialized_size
        
        logger.info(f"Converted to Parquet: {original_size/1024**2:.2f}MB -> {parquet_size/1024**2:.2f}MB")
        
        return parquet_path
    
    def _optimize_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        """Optimize DataFrame schema for Parquet storage"""
        
        optimized_df = df.copy()
        
        # Convert string categories to categorical
        for col in optimized_df.select_dtypes(include=['object']).columns:
            if optimized_df[col].nunique() / len(optimized_df) < 0.5:
                optimized_df[col] = optimized_df[col].astype('category')
        
        # Optimize datetime columns
        for col in optimized_df.select_dtypes(include=['datetime64']).columns:
            # Store as timestamp for better compression
            optimized_df[col] = optimized_df[col].astype('datetime64[ms]')
        
        return optimized_df
    
    def read_optimized(self, file_path: str, columns: Optional[List[str]] = None,
                      filters: Optional[List[Tuple]] = None) -> pd.DataFrame:
        """Read data with optimizations"""
        
        if file_path.endswith('.parquet'):
            return pd.read_parquet(
                file_path,
                columns=columns,
                filters=filters,
                engine='pyarrow'
            )
        elif file_path.endswith('.csv'):
            return self._read_csv_optimized(file_path, columns)
        else:
            return pd.read_csv(file_path)
    
    def _read_csv_optimized(self, file_path: str, columns: Optional[List[str]] = None) -> pd.DataFrame:
        """Optimized CSV reading using PyArrow"""
        
        # Use PyArrow for faster CSV reading
        table = pv.read_csv(
            file_path,
            convert_options=pv.ConvertOptions(
                column_types={},  # Auto-infer but could be specified
                strings_can_be_null=True
            ),
            read_options=pv.ReadOptions(
                use_threads=True,
                block_size=self.config.chunk_size_mb * 1024 * 1024
            )
        )
        
        df = table.to_pandas()
        
        if columns:
            df = df[columns]
        
        return df

class AdvancedCachingSystem:
    """Advanced caching for intermediate results"""
    
    def __init__(self, config: PerformanceConfig):
        self.config = config
        self.cache_dir = config.cache_directory
        self._ensure_cache_dir()
        
    def _ensure_cache_dir(self):
        """Ensure cache directory exists"""
        import os
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def cache_dataframe(self, df: pd.DataFrame, cache_key: str) -> str:
        """Cache DataFrame to disk with compression"""
        
        if not self.config.enable_intermediate_caching:
            return ""
        
        cache_path = f"{self.cache_dir}/{cache_key}.parquet"
        
        df.to_parquet(
            cache_path,
            compression='lz4',  # Fast compression for intermediate results
            index=False,
            engine='pyarrow'
        )
        
        return cache_path
    
    def load_cached_dataframe(self, cache_key: str) -> Optional[pd.DataFrame]:
        """Load cached DataFrame if it exists"""
        
        if not self.config.enable_intermediate_caching:
            return None
        
        cache_path = f"{self.cache_dir}/{cache_key}.parquet"
        
        try:
            import os
            if os.path.exists(cache_path):
                return pd.read_parquet(cache_path, engine='pyarrow')
            return None
        except Exception as e:
            logger.warning(f"Failed to load cache {cache_key}: {str(e)}")
            return None

class PerformanceProfiler:
    """Performance profiling and monitoring"""
    
    def __init__(self, config: PerformanceConfig):
        self.config = config
        self.profiler = cProfile.Profile()
        
    @contextmanager
    def profile_operation(self, operation_name: str):
        """Profile an operation and log results"""
        
        if not self.config.enable_profiling:
            yield
            return
        
        start_time = time.time()
        self.profiler.enable()
        
        yield
        
        self.profiler.disable()
        end_time = time.time()
        
        # Generate profiling report
        s = io.StringIO()
        ps = pstats.Stats(self.profiler, stream=s).sort_stats('cumulative')
        ps.print_stats(20)  # Top 20 functions
        
        logger.info(f"{operation_name} completed in {end_time - start_time:.3f}s")
        logger.debug(f"Profiling report for {operation_name}:\\n{s.getvalue()}")

class OptimizedDataProcessor:
    """Main optimized data processing pipeline"""
    
    def __init__(self, config: PerformanceConfig):
        self.config = config
        self.memory_optimizer = MemoryOptimizer(config)
        self.cpu_optimizer = CPUOptimizer(config)
        self.gpu_accelerator = GPUAccelerator(config)
        self.format_optimizer = DataFormatOptimizer(config)
        self.cache_system = AdvancedCachingSystem(config)
        self.profiler = PerformanceProfiler(config)
        
    async def process_large_dataset(self, file_path: str, 
                                  processing_operations: List[str]) -> pd.DataFrame:
        """Process large dataset with all optimizations"""
        
        with self.profiler.profile_operation("complete_dataset_processing"):
            # Check cache first
            cache_key = f"processed_{hash(file_path + str(processing_operations))}"
            cached_result = self.cache_system.load_cached_dataframe(cache_key)
            
            if cached_result is not None:
                logger.info("Loaded result from cache")
                return cached_result
            
            # Load data with optimizations
            with self.memory_optimizer.memory_monitor("data_loading"):
                df = self.format_optimizer.read_optimized(file_path)
                df = self.memory_optimizer.optimize_dataframe_memory(df)
            
            # Process in chunks if dataset is large
            if len(df) > 100000:
                result = await self._process_in_chunks(df, processing_operations)
            else:
                result = await self._process_single_batch(df, processing_operations)
            
            # Cache result
            self.cache_system.cache_dataframe(result, cache_key)
            
            return result
    
    async def _process_in_chunks(self, df: pd.DataFrame, 
                               operations: List[str]) -> pd.DataFrame:
        """Process large DataFrame in optimized chunks"""
        
        chunk_size = self.memory_optimizer.get_optimal_chunk_size(
            df.memory_usage(deep=True).sum() / 1024**2
        )
        
        chunks = [df[i:i + chunk_size] for i in range(0, len(df), chunk_size)]
        
        logger.info(f"Processing {len(chunks)} chunks of size ~{chunk_size}")
        
        # Process chunks in parallel
        processed_chunks = await self.cpu_optimizer.async_parallel_processing(
            chunks, lambda chunk: self._apply_operations(chunk, operations)
        )
        
        # Combine results
        with self.memory_optimizer.memory_monitor("chunk_combination"):
            result = pd.concat(processed_chunks, ignore_index=True)
        
        return result
    
    async def _process_single_batch(self, df: pd.DataFrame, 
                                  operations: List[str]) -> pd.DataFrame:
        """Process smaller DataFrame in single batch"""
        
        return await self._apply_operations(df, operations)
    
    async def _apply_operations(self, df: pd.DataFrame, operations: List[str]) -> pd.DataFrame:
        """Apply processing operations to DataFrame"""
        
        result = df.copy()
        
        for operation in operations:
            if operation == 'gpu_aggregation':
                result = self.gpu_accelerator.process_with_gpu(result, 'groupby_sum')
            elif operation == 'memory_optimize':
                result = self.memory_optimizer.optimize_dataframe_memory(result)
            elif operation == 'parallel_transform':
                # Example transformation using parallel processing
                result = self.cpu_optimizer.parallel_dataframe_operation(
                    result, self._example_transformation
                )
            elif operation == 'numba_vectorization':
                # Apply Numba-optimized operations
                if 'numeric_column' in result.columns:
                    result['optimized_column'] = self.cpu_optimizer.numba_vectorized_operation(
                        result['numeric_column'].values
                    )
        
        return result
    
    def _example_transformation(self, df: pd.DataFrame) -> pd.DataFrame:
        """Example transformation function"""
        # This would be replaced with actual business logic
        return df.copy()

class PerformanceBenchmark:
    """Benchmark different optimization techniques"""
    
    def __init__(self):
        self.results = {}
        
    async def benchmark_processing_methods(self, sample_data: pd.DataFrame):
        """Benchmark different processing methods"""
        
        methods = {
            'standard_pandas': self._standard_pandas_processing,
            'optimized_memory': self._memory_optimized_processing,
            'parallel_processing': self._parallel_processing,
            'gpu_accelerated': self._gpu_accelerated_processing
        }
        
        for method_name, method_func in methods.items():
            start_time = time.time()
            
            try:
                result = await method_func(sample_data.copy())
                processing_time = time.time() - start_time
                
                self.results[method_name] = {
                    'time': processing_time,
                    'memory_usage': result.memory_usage(deep=True).sum() / 1024**2,
                    'rows_processed': len(result),
                    'success': True
                }
                
                logger.info(f"{method_name}: {processing_time:.3f}s")
                
            except Exception as e:
                logger.error(f"{method_name} failed: {str(e)}")
                self.results[method_name] = {
                    'time': -1,
                    'success': False,
                    'error': str(e)
                }
        
        return self.results
    
    async def _standard_pandas_processing(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standard pandas processing"""
        result = df.groupby('category').agg({'value': 'sum', 'count': 'mean'}).reset_index()
        return result
    
    async def _memory_optimized_processing(self, df: pd.DataFrame) -> pd.DataFrame:
        """Memory-optimized processing"""
        config = PerformanceConfig()
        optimizer = MemoryOptimizer(config)
        
        optimized_df = optimizer.optimize_dataframe_memory(df)
        result = optimized_df.groupby('category').agg({'value': 'sum', 'count': 'mean'}).reset_index()
        return result
    
    async def _parallel_processing(self, df: pd.DataFrame) -> pd.DataFrame:
        """Parallel processing"""
        config = PerformanceConfig(use_multiprocessing=True, max_workers=4)
        cpu_optimizer = CPUOptimizer(config)
        
        def group_operation(chunk_df):
            return chunk_df.groupby('category').agg({'value': 'sum', 'count': 'mean'}).reset_index()
        
        result = cpu_optimizer.parallel_dataframe_operation(df, group_operation)
        return result
    
    async def _gpu_accelerated_processing(self, df: pd.DataFrame) -> pd.DataFrame:
        """GPU-accelerated processing if available"""
        config = PerformanceConfig(use_gpu_acceleration=True)
        gpu_accelerator = GPUAccelerator(config)
        
        result = gpu_accelerator.process_with_gpu(df, 'groupby_sum')
        return result

async def main():
    """Main function demonstrating performance optimization techniques"""
    
    logger.info("Starting Performance Optimization Suite demonstration")
    
    # Create sample large dataset
    np.random.seed(42)
    n_rows = 200000
    
    sample_data = pd.DataFrame({
        'category': np.random.choice(['A', 'B', 'C', 'D', 'E'], n_rows),
        'value': np.random.randn(n_rows) * 100,
        'count': np.random.randint(1, 100, n_rows),
        'date': pd.date_range('2024-01-01', periods=n_rows, freq='T'),
        'text_field': [f"item_{i}" for i in range(n_rows)]
    })
    
    logger.info(f"Generated sample dataset: {sample_data.shape}")
    
    # Initialize optimized processor
    config = PerformanceConfig(
        max_memory_usage_percent=70.0,
        use_multiprocessing=True,
        max_workers=4,
        use_gpu_acceleration=False,  # Set to True if GPU available
        enable_profiling=True
    )
    
    processor = OptimizedDataProcessor(config)
    
    # Process with optimizations
    processing_operations = [
        'memory_optimize',
        'parallel_transform',
        'numba_vectorization'
    ]
    
    # Save sample data for processing
    sample_file = "/tmp/sample_marketing_data.csv"
    sample_data.to_csv(sample_file, index=False)
    
    # Process dataset
    start_time = time.time()
    processed_data = await processor.process_large_dataset(sample_file, processing_operations)
    total_time = time.time() - start_time
    
    logger.info(f"Dataset processing completed in {total_time:.3f}s")
    logger.info(f"Processed {len(processed_data)} rows")
    
    # Run benchmark
    benchmark = PerformanceBenchmark()
    benchmark_results = await benchmark.benchmark_processing_methods(sample_data.head(50000))
    
    logger.info("Benchmark Results:")
    for method, results in benchmark_results.items():
        if results['success']:
            logger.info(f"  {method}: {results['time']:.3f}s, {results['memory_usage']:.2f}MB")
        else:
            logger.info(f"  {method}: Failed - {results.get('error', 'Unknown error')}")
    
    logger.info("Performance optimization demonstration completed")

if __name__ == "__main__":
    asyncio.run(main())