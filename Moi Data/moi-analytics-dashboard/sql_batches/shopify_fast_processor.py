#!/usr/bin/env python3
"""
Fast Shopify CSV Processor - Optimized for Speed
Processes chunks directly and uploads via MCP without generating intermediate files
"""

import pandas as pd
import time
import json
import subprocess
import sys
from pathlib import Path

# Configuration
CSV_FILE_PATH = "/Users/shivangpatel/Downloads/yearly files/Shopify_1st Oct 24 to 26th Oct 25.csv"
BATCH_SIZE = 1000  # Smaller batches for faster processing
TOTAL_RECORDS = 3288227

def create_sql_insert(batch_df):
    """Convert DataFrame batch to SQL INSERT statement"""
    if batch_df.empty:
        return None
        
    values = []
    for _, row in batch_df.iterrows():
        # Handle date
        day_val = f"'{row['Day']}'" if pd.notna(row['Day']) else 'NULL'
        
        # Handle text fields with escaping
        utm_campaign = str(row['UTM campaign']).replace("'", "''") if pd.notna(row['UTM campaign']) else ''
        utm_term = str(row['UTM term']).replace("'", "''") if pd.notna(row['UTM term']) else ''
        utm_content = str(row['UTM content']).replace("'", "''") if pd.notna(row['UTM content']) else ''
        landing_page = str(row['Landing page URL']).replace("'", "''") if pd.notna(row['Landing page URL']) else ''
        
        # Handle numeric fields
        visitors = int(row['Online store visitors']) if pd.notna(row['Online store visitors']) else 0
        completed = int(row['Sessions that completed checkout']) if pd.notna(row['Sessions that completed checkout']) else 0
        reached = int(row['Sessions that reached checkout']) if pd.notna(row['Sessions that reached checkout']) else 0
        cart_adds = int(row['Sessions with cart additions']) if pd.notna(row['Sessions with cart additions']) else 0
        duration = float(row['Average session duration']) if pd.notna(row['Average session duration']) else 0
        pageviews = int(row['Pageviews']) if pd.notna(row['Pageviews']) else 0
        
        value_str = f"({day_val}, '{utm_campaign}', '{utm_term}', '{utm_content}', '{landing_page}', {visitors}, {completed}, {reached}, {cart_adds}, {duration}, {pageviews})"
        values.append(value_str)
    
    if not values:
        return None
        
    sql = f"""INSERT INTO shopify_raw_data (day, utm_campaign, utm_term, utm_content, landing_page_url, online_store_visitors, sessions_completed_checkout, sessions_reached_checkout, sessions_with_cart_additions, average_session_duration, pageviews) VALUES {', '.join(values)} ON CONFLICT (day, utm_campaign, utm_term, utm_content) DO UPDATE SET landing_page_url = EXCLUDED.landing_page_url, online_store_visitors = EXCLUDED.online_store_visitors, sessions_completed_checkout = EXCLUDED.sessions_completed_checkout, sessions_reached_checkout = EXCLUDED.sessions_reached_checkout, sessions_with_cart_additions = EXCLUDED.sessions_with_cart_additions, average_session_duration = EXCLUDED.average_session_duration, pageviews = EXCLUDED.pageviews, processed_at = CURRENT_TIMESTAMP;"""
    
    return sql

def process_batch_range(start_idx, end_idx):
    """Process a specific range of records"""
    try:
        print(f"Processing batch {start_idx:,} to {end_idx:,}")
        
        # Read chunk from CSV
        chunk_df = pd.read_csv(
            CSV_FILE_PATH,
            skiprows=range(1, start_idx + 1) if start_idx > 0 else None,
            nrows=end_idx - start_idx
        )
        
        if chunk_df.empty:
            return {"success": True, "processed": 0}
        
        # Generate SQL
        sql = create_sql_insert(chunk_df)
        if not sql:
            return {"success": True, "processed": 0}
        
        # Save to temp file for MCP execution
        sql_file = f"/tmp/shopify_batch_{start_idx}_{end_idx}.sql"
        with open(sql_file, 'w') as f:
            f.write(sql)
        
        return {
            "success": True,
            "processed": len(chunk_df),
            "sql_file": sql_file,
            "start_idx": start_idx,
            "end_idx": end_idx
        }
        
    except Exception as e:
        return {"success": False, "error": str(e), "start_idx": start_idx}

def main():
    print("=== FAST SHOPIFY CSV PROCESSOR ===")
    print(f"Source: {CSV_FILE_PATH}")
    print(f"Total records: {TOTAL_RECORDS:,}")
    print(f"Batch size: {BATCH_SIZE:,}")
    
    if not Path(CSV_FILE_PATH).exists():
        print(f"✗ CSV file not found: {CSV_FILE_PATH}")
        return
    
    # Process first 10 batches as test
    test_batches = 10
    batch_files = []
    start_time = time.time()
    
    for i in range(test_batches):
        start_idx = i * BATCH_SIZE
        end_idx = min((i + 1) * BATCH_SIZE, TOTAL_RECORDS)
        
        result = process_batch_range(start_idx, end_idx)
        
        if result["success"] and result["processed"] > 0:
            batch_files.append(result["sql_file"])
            print(f"✓ Batch {i+1}: {result['processed']} records -> {result['sql_file']}")
        elif not result["success"]:
            print(f"✗ Failed batch {i+1}: {result['error']}")
    
    elapsed = time.time() - start_time
    print(f"\n=== TEST BATCHES COMPLETE ===")
    print(f"Generated {len(batch_files)} SQL files in {elapsed:.1f}s")
    print(f"Rate: {len(batch_files)/elapsed:.1f} batches/sec")
    
    # Save batch list for MCP execution
    with open("/tmp/shopify_test_batches.json", 'w') as f:
        json.dump(batch_files, f)
    
    print("Ready for MCP parallel execution!")

if __name__ == "__main__":
    main()