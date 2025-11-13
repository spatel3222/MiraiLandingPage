#!/usr/bin/env python3
"""
Execute all SQL batch files systematically
"""

import os
import glob
import time
import requests
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = "https://nbclorobfotxrpbmyapi.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY2xvcm9iZm90eHJwYm15YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwMDkwMzIsImV4cCI6MjA0NTU4NTAzMn0.VfkLDYoQlFgP3jxJGHw6_VLyWUfxqCXJgzELYpLnQ1g"

def execute_sql_via_api(query):
    """Execute SQL query via Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/sql"
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {"query": query}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        if response.status_code in [200, 204]:
            return True, None
        else:
            return False, f"HTTP {response.status_code}: {response.text}"
    except Exception as e:
        return False, str(e)

def execute_batch_files(pattern, dataset_name):
    """Execute all batch files matching the pattern"""
    batch_dir = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/"
    
    files = sorted(glob.glob(os.path.join(batch_dir, pattern)))
    logger.info(f"Found {len(files)} {dataset_name} batch files")
    
    successful = 0
    failed = 0
    
    for i, file_path in enumerate(files):
        try:
            with open(file_path, 'r') as f:
                sql_content = f.read()
            
            success, error = execute_sql_via_api(sql_content)
            
            if success:
                successful += 1
                if (i + 1) % 10 == 0:
                    logger.info(f"{dataset_name}: Executed {i + 1}/{len(files)} batches")
            else:
                failed += 1
                logger.error(f"{dataset_name} batch {i+1} failed: {error}")
            
            # Small delay to avoid rate limiting
            time.sleep(0.2)
            
        except Exception as e:
            failed += 1
            logger.error(f"Error processing {dataset_name} batch {i+1}: {e}")
    
    logger.info(f"{dataset_name} complete: {successful} successful, {failed} failed")
    return successful, failed

def main():
    """Execute all batch files in order"""
    logger.info("Starting batch execution process")
    
    total_successful = 0
    total_failed = 0
    
    # Execute Google batches
    logger.info("=" * 50)
    logger.info("EXECUTING GOOGLE BATCHES")
    logger.info("=" * 50)
    
    google_success, google_failed = execute_batch_files("google_batch_*.sql", "Google")
    total_successful += google_success
    total_failed += google_failed
    
    # Execute Meta batches
    logger.info("=" * 50)
    logger.info("EXECUTING META BATCHES")
    logger.info("=" * 50)
    
    meta_success, meta_failed = execute_batch_files("meta_batch_*.sql", "Meta")
    total_successful += meta_success
    total_failed += meta_failed
    
    # Execute Shopify sample batches
    logger.info("=" * 50)
    logger.info("EXECUTING SHOPIFY SAMPLE BATCHES")
    logger.info("=" * 50)
    
    shopify_success, shopify_failed = execute_batch_files("shopify_sample_batch_*.sql", "Shopify")
    total_successful += shopify_success
    total_failed += shopify_failed
    
    # Final summary
    logger.info("=" * 50)
    logger.info("BATCH EXECUTION COMPLETE")
    logger.info("=" * 50)
    logger.info(f"Google batches: {google_success} successful, {google_failed} failed")
    logger.info(f"Meta batches: {meta_success} successful, {meta_failed} failed")
    logger.info(f"Shopify batches: {shopify_success} successful, {shopify_failed} failed")
    logger.info(f"Total: {total_successful} successful, {total_failed} failed")

if __name__ == "__main__":
    main()