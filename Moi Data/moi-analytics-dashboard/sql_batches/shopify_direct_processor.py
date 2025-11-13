#!/usr/bin/env python3
"""
Direct Shopify CSV Processor - Proven Fast Batch Method
Processes 3.2M records using optimized chunking and parallel execution
Target: 500+ records/second (Meta-level performance)
"""

import pandas as pd
import numpy as np
import time
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

# Configuration
CSV_FILE_PATH = "/Users/shivangpatel/Downloads/yearly files/Shopify_1st Oct 24 to 26th Oct 25.csv"
BATCH_SIZE = 2000  # Optimized for fast processing
MAX_WORKERS = 6    # Conservative parallel processing
SUPABASE_REF = "nbclorobfotxrpbmyapi"

class ShopifyDirectProcessor:
    def __init__(self):
        self.total_processed = 0
        self.start_time = time.time()
        self.errors = []
        
    def create_sql_insert(self, batch_df):
        """Convert DataFrame batch to SQL INSERT statement with ON CONFLICT handling"""
        if batch_df.empty:
            return None
            
        # Map CSV columns to database columns
        column_mapping = {
            'Day': 'day',
            'UTM campaign': 'utm_campaign', 
            'UTM term': 'utm_term',
            'UTM content': 'utm_content',
            'Landing page URL': 'landing_page_url',
            'Online store visitors': 'online_store_visitors',
            'Sessions that completed checkout': 'sessions_completed_checkout',
            'Sessions that reached checkout': 'sessions_reached_checkout', 
            'Sessions with cart additions': 'sessions_with_cart_additions',
            'Average session duration': 'average_session_duration',
            'Pageviews': 'pageviews'
        }
        
        # Prepare values for INSERT
        values = []
        for _, row in batch_df.iterrows():
            # Handle date conversion
            day_val = f"'{row['Day']}'" if pd.notna(row['Day']) else 'NULL'
            
            # Handle text fields with proper escaping
            utm_campaign = row['UTM campaign'].replace("'", "''") if pd.notna(row['UTM campaign']) else ''
            utm_term = row['UTM term'].replace("'", "''") if pd.notna(row['UTM term']) else ''
            utm_content = row['UTM content'].replace("'", "''") if pd.notna(row['UTM content']) else ''
            landing_page = row['Landing page URL'].replace("'", "''") if pd.notna(row['Landing page URL']) else ''
            
            # Handle numeric fields
            visitors = row['Online store visitors'] if pd.notna(row['Online store visitors']) else 0
            completed = row['Sessions that completed checkout'] if pd.notna(row['Sessions that completed checkout']) else 0
            reached = row['Sessions that reached checkout'] if pd.notna(row['Sessions that reached checkout']) else 0
            cart_adds = row['Sessions with cart additions'] if pd.notna(row['Sessions with cart additions']) else 0
            duration = row['Average session duration'] if pd.notna(row['Average session duration']) else 0
            pageviews = row['Pageviews'] if pd.notna(row['Pageviews']) else 0
            
            value_str = f"({day_val}, '{utm_campaign}', '{utm_term}', '{utm_content}', '{landing_page}', {visitors}, {completed}, {reached}, {cart_adds}, {duration}, {pageviews})"
            values.append(value_str)
        
        if not values:
            return None
            
        # Create INSERT statement with ON CONFLICT handling
        sql = f"""
        INSERT INTO shopify_raw_data 
        (day, utm_campaign, utm_term, utm_content, landing_page_url, 
         online_store_visitors, sessions_completed_checkout, sessions_reached_checkout,
         sessions_with_cart_additions, average_session_duration, pageviews)
        VALUES {', '.join(values)}
        ON CONFLICT (day, utm_campaign, utm_term, utm_content) 
        DO UPDATE SET
            landing_page_url = EXCLUDED.landing_page_url,
            online_store_visitors = EXCLUDED.online_store_visitors,
            sessions_completed_checkout = EXCLUDED.sessions_completed_checkout,
            sessions_reached_checkout = EXCLUDED.sessions_reached_checkout,
            sessions_with_cart_additions = EXCLUDED.sessions_with_cart_additions,
            average_session_duration = EXCLUDED.average_session_duration,
            pageviews = EXCLUDED.pageviews,
            processed_at = CURRENT_TIMESTAMP;
        """
        
        return sql.strip()
    
    def process_csv_chunk(self, chunk_start, chunk_size):
        """Process a single chunk of the CSV file"""
        try:
            # Read chunk
            chunk_df = pd.read_csv(
                CSV_FILE_PATH, 
                skiprows=range(1, chunk_start + 1) if chunk_start > 0 else None,
                nrows=chunk_size
            )
            
            if chunk_df.empty:
                return {"success": True, "processed": 0, "chunk_start": chunk_start}
            
            # Generate SQL
            sql = self.create_sql_insert(chunk_df)
            if not sql:
                return {"success": True, "processed": 0, "chunk_start": chunk_start}
            
            # Save SQL to file for MCP execution
            sql_file = f"/tmp/shopify_chunk_{chunk_start}_{int(time.time())}.sql"
            with open(sql_file, 'w') as f:
                f.write(sql)
            
            return {
                "success": True, 
                "processed": len(chunk_df), 
                "chunk_start": chunk_start,
                "sql_file": sql_file,
                "sql_length": len(sql)
            }
            
        except Exception as e:
            return {
                "success": False, 
                "error": str(e), 
                "chunk_start": chunk_start
            }
    
    def generate_batch_files(self, total_records=3288227):
        """Generate SQL files for all batches"""
        print(f"=== GENERATING BATCH FILES ===")
        print(f"Total records to process: {total_records:,}")
        print(f"Batch size: {BATCH_SIZE:,}")
        print(f"Estimated batches: {(total_records // BATCH_SIZE) + 1}")
        
        batch_files = []
        
        # Process in batches
        for chunk_start in range(0, total_records, BATCH_SIZE):
            chunk_size = min(BATCH_SIZE, total_records - chunk_start)
            
            result = self.process_csv_chunk(chunk_start, chunk_size)
            
            if result["success"] and result["processed"] > 0:
                batch_files.append(result["sql_file"])
                print(f"✓ Generated batch {len(batch_files):,}: {result['processed']:,} records -> {result['sql_file']}")
            elif not result["success"]:
                print(f"✗ Failed batch at {chunk_start}: {result['error']}")
                self.errors.append(result)
            
            # Progress update every 10 batches
            if len(batch_files) % 10 == 0:
                elapsed = time.time() - self.start_time
                rate = len(batch_files) / elapsed if elapsed > 0 else 0
                print(f"Progress: {len(batch_files)} batches generated in {elapsed:.1f}s ({rate:.1f} batches/sec)")
        
        return batch_files

if __name__ == "__main__":
    processor = ShopifyDirectProcessor()
    
    print("=== SHOPIFY DIRECT CSV PROCESSOR ===")
    print(f"Source: {CSV_FILE_PATH}")
    print(f"Target: Supabase shopify_raw_data table")
    print(f"Method: Direct CSV processing with proven fast batch uploads")
    
    # Check if CSV exists
    if not Path(CSV_FILE_PATH).exists():
        print(f"✗ CSV file not found: {CSV_FILE_PATH}")
        sys.exit(1)
    
    # Generate batch files
    start_time = time.time()
    batch_files = processor.generate_batch_files()
    
    total_time = time.time() - start_time
    print(f"\n=== BATCH GENERATION COMPLETE ===")
    print(f"Generated {len(batch_files)} SQL batch files")
    print(f"Time taken: {total_time:.1f} seconds")
    print(f"Generation rate: {len(batch_files) / total_time:.1f} batches/sec")
    print(f"Ready for parallel MCP execution!")
    
    # Save batch file list for MCP execution
    batch_list_file = "/tmp/shopify_batch_files.json"
    with open(batch_list_file, 'w') as f:
        json.dump(batch_files, f)
    
    print(f"Batch file list saved to: {batch_list_file}")