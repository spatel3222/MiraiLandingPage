#!/usr/bin/env python3
"""
Continue systematic execution of remaining Meta batch files from meta_batch_0002.sql to meta_batch_0690.sql
Optimized for parallel processing and progress tracking
"""

import os
import glob
import time
import requests
import json
import logging
import concurrent.futures
import threading
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase configuration - Updated with correct credentials
SUPABASE_URL = "https://fvyghgvshobufpgaclbs.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eWdoZ3ZzaG9idWZwZ2FjbGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDI1MjgsImV4cCI6MjA3MjcxODUyOH0.RR_PavED-XHko85FsuLVWfWapVIJZ3l3vRPq4lszmfM"

# Thread-safe counter for progress tracking
class ProgressTracker:
    def __init__(self):
        self.lock = threading.Lock()
        self.successful = 0
        self.failed = 0
        self.total_processed = 0
    
    def increment_success(self):
        with self.lock:
            self.successful += 1
            self.total_processed += 1
    
    def increment_failed(self):
        with self.lock:
            self.failed += 1
            self.total_processed += 1
    
    def get_stats(self):
        with self.lock:
            return self.successful, self.failed, self.total_processed

def execute_sql_via_api(query, timeout=60):
    """Execute SQL query via Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/sql"
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {"query": query}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=timeout)
        if response.status_code in [200, 204]:
            return True, None
        else:
            return False, f"HTTP {response.status_code}: {response.text}"
    except Exception as e:
        return False, str(e)

def execute_single_batch(file_path, progress_tracker):
    """Execute a single batch file"""
    try:
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        success, error = execute_sql_via_api(sql_content)
        
        if success:
            progress_tracker.increment_success()
            return True, None
        else:
            progress_tracker.increment_failed()
            return False, error
            
    except Exception as e:
        progress_tracker.increment_failed()
        return False, str(e)

def execute_batch_group(batch_files, group_name, max_workers=15):
    """Execute a group of batch files in parallel"""
    logger.info(f"Starting {group_name}: {len(batch_files)} files")
    progress_tracker = ProgressTracker()
    failed_files = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_file = {
            executor.submit(execute_single_batch, file_path, progress_tracker): file_path
            for file_path in batch_files
        }
        
        # Process results as they complete
        for future in concurrent.futures.as_completed(future_to_file):
            file_path = future_to_file[future]
            filename = os.path.basename(file_path)
            
            try:
                success, error = future.result()
                if not success:
                    failed_files.append((filename, error))
                    logger.error(f"Failed {filename}: {error}")
                
                # Progress update every 5 files
                successful, failed, total = progress_tracker.get_stats()
                if total % 5 == 0:
                    logger.info(f"{group_name} progress: {total}/{len(batch_files)} "
                              f"({successful} success, {failed} failed)")
                    
            except Exception as e:
                failed_files.append((filename, str(e)))
                logger.error(f"Exception processing {filename}: {e}")
    
    successful, failed, total = progress_tracker.get_stats()
    logger.info(f"{group_name} complete: {successful} successful, {failed} failed")
    
    return successful, failed, failed_files

def main():
    """Execute remaining Meta batch files systematically"""
    logger.info("Starting systematic Meta batch execution from meta_batch_0002.sql")
    
    batch_dir = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/"
    
    # Define batch groups for parallel processing
    batch_groups = [
        (range(2, 21), "Group 1 (0002-0020)"),
        (range(21, 51), "Group 2 (0021-0050)"), 
        (range(51, 101), "Group 3 (0051-0100)"),
        (range(101, 201), "Group 4 (0101-0200)"),
        (range(201, 301), "Group 5 (0201-0300)"),
        (range(301, 401), "Group 6 (0301-0400)"),
        (range(401, 501), "Group 7 (0401-0500)"),
        (range(501, 601), "Group 8 (0501-0600)"),
        (range(601, 691), "Group 9 (0601-0690)")
    ]
    
    total_successful = 0
    total_failed = 0
    all_failed_files = []
    
    for batch_range, group_name in batch_groups:
        logger.info("=" * 60)
        logger.info(f"EXECUTING {group_name}")
        logger.info("=" * 60)
        
        # Build file list for this group
        batch_files = []
        for i in batch_range:
            file_path = os.path.join(batch_dir, f"meta_batch_{i:04d}.sql")
            if os.path.exists(file_path):
                batch_files.append(file_path)
            else:
                logger.warning(f"File not found: meta_batch_{i:04d}.sql")
        
        if not batch_files:
            logger.warning(f"No files found for {group_name}")
            continue
            
        # Execute this group
        group_successful, group_failed, group_failed_files = execute_batch_group(
            batch_files, group_name
        )
        
        total_successful += group_successful
        total_failed += group_failed
        all_failed_files.extend(group_failed_files)
        
        # Brief pause between groups
        time.sleep(2)
    
    # Final summary
    logger.info("=" * 60)
    logger.info("META BATCH EXECUTION COMPLETE")
    logger.info("=" * 60)
    logger.info(f"Total files processed: {total_successful + total_failed}")
    logger.info(f"Successful: {total_successful}")
    logger.info(f"Failed: {total_failed}")
    
    if all_failed_files:
        logger.info("\nFailed files:")
        for filename, error in all_failed_files[:10]:  # Show first 10 failures
            logger.info(f"  {filename}: {error}")
        if len(all_failed_files) > 10:
            logger.info(f"  ... and {len(all_failed_files) - 10} more")
    
    # Write summary to file
    summary_file = os.path.join(batch_dir, "meta_execution_summary.json")
    summary_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_successful": total_successful,
        "total_failed": total_failed,
        "failed_files": all_failed_files
    }
    
    with open(summary_file, 'w') as f:
        json.dump(summary_data, f, indent=2)
    
    logger.info(f"Execution summary saved to: {summary_file}")
    
    return total_successful, total_failed

if __name__ == "__main__":
    main()