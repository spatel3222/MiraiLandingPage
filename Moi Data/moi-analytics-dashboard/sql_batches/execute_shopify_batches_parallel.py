#!/usr/bin/env python3
"""
Shopify Batch SQL Execution Script
Efficiently executes all 20 Shopify batch files in parallel groups
Uses ref parameter "nbclorobfotxrpbmyapi" as specified
Processes files in parallel groups of 8 for optimal performance
"""

import concurrent.futures
import requests
import time
import json
import os
import logging
import threading
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = "https://fvyghgvshobufpgaclbs.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eWdoZ3ZzaG9idWZwZ2FjbGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDI1MjgsImV4cCI6MjA3MjcxODUyOH0.RR_PavED-XHko85FsuLVWfWapVIJZ3l3vRPq4lszmfM"

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

class ShopifyBatchProcessor:
    def __init__(self, ref_param="nbclorobfotxrpbmyapi", max_workers=8):
        self.ref_param = ref_param
        self.max_workers = max_workers
        self.results = []
        self.start_time = None
        self.progress = ProgressTracker()
    
    def create_shopify_table(self):
        """Create the shopify_raw_data table"""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS shopify_raw_data (
            id SERIAL PRIMARY KEY,
            day DATE NOT NULL,
            utm_campaign TEXT,
            utm_term TEXT,
            utm_content TEXT,
            landing_page_url TEXT,
            online_store_visitors INTEGER DEFAULT 0,
            sessions_completed_checkout INTEGER DEFAULT 0,
            sessions_reached_checkout INTEGER DEFAULT 0,
            sessions_with_cart_additions INTEGER DEFAULT 0,
            average_session_duration INTEGER DEFAULT 0,
            pageviews INTEGER DEFAULT 0,
            ref_parameter TEXT DEFAULT 'nbclorobfotxrpbmyapi',
            processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_shopify_day ON shopify_raw_data(day);
        CREATE INDEX IF NOT EXISTS idx_shopify_campaign ON shopify_raw_data(utm_campaign);
        CREATE INDEX IF NOT EXISTS idx_shopify_ref_param ON shopify_raw_data(ref_parameter);
        """
        
        print("🏗️  Creating Shopify table...")
        success, response = self.execute_sql_via_api(create_table_sql)
        
        if success:
            print("✅ Shopify table created successfully")
            return True
        else:
            print(f"❌ Failed to create Shopify table: {response}")
            return False
        
    def execute_sql_via_api(self, query, timeout=120):
        """Execute SQL query via Supabase REST API"""
        url = f"{SUPABASE_URL}/rest/v1/rpc/sql"
        
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        
        payload = {'query': query}
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=timeout)
            
            if response.status_code == 200:
                return True, response.json()
            else:
                return False, f"HTTP {response.status_code}: {response.text}"
                
        except requests.exceptions.Timeout:
            return False, f"Request timeout after {timeout} seconds"
        except requests.exceptions.RequestException as e:
            return False, f"Request error: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error: {str(e)}"

    def execute_sql_file(self, batch_info):
        """Execute a single SQL batch file"""
        batch_num, file_path = batch_info
        start_time = time.time()
        
        try:
            # Read SQL content
            with open(file_path, 'r') as f:
                sql_content = f.read()
            
            # Execute via Supabase API
            success, response = self.execute_sql_via_api(sql_content)
            execution_time = time.time() - start_time
            
            batch_result = {
                'batch_number': batch_num,
                'file_path': file_path,
                'execution_time': execution_time,
                'success': success,
                'response': response,
                'error': None if success else response
            }
            
            # Update progress
            if success:
                self.progress.increment_success()
            else:
                self.progress.increment_failed()
            
            # Print progress
            status = "✅ SUCCESS" if success else "❌ ERROR"
            successful, failed, total = self.progress.get_stats()
            print(f"{status} | Batch {batch_num:02d} | {execution_time:.2f}s | Progress: {total}/20 | {os.path.basename(file_path)}")
            
            if not success:
                print(f"   Error: {response}")
            
            return batch_result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.progress.increment_failed()
            return {
                'batch_number': batch_num,
                'file_path': file_path,
                'execution_time': execution_time,
                'success': False,
                'response': {},
                'error': str(e)
            }
    
    def process_all_batches(self):
        """Process all Shopify batch files in parallel"""
        print("🚀 Starting Shopify Batch Processing...")
        print(f"📊 Processing 20 files with {self.max_workers} parallel workers")
        print(f"🔑 Using ref parameter: {self.ref_param}")
        print("-" * 70)
        
        # Create table first
        if not self.create_shopify_table():
            print("❌ Failed to create table. Aborting...")
            return
        
        self.start_time = time.time()
        
        # Prepare batch files
        batch_files = []
        for i in range(20):
            file_path = f"/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/shopify_sample_batch_{i:04d}.sql"
            if os.path.exists(file_path):
                batch_files.append((i, file_path))
            else:
                print(f"⚠️  Warning: File not found - {file_path}")
        
        if not batch_files:
            print("❌ No batch files found!")
            return
        
        print(f"📁 Found {len(batch_files)} batch files to process")
        print("-" * 70)
        
        # Execute in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_batch = {executor.submit(self.execute_sql_file, batch): batch for batch in batch_files}
            
            for future in concurrent.futures.as_completed(future_to_batch):
                result = future.result()
                self.results.append(result)
        
        # Sort results by batch number
        self.results.sort(key=lambda x: x['batch_number'])
        
        self.generate_report()
    
    def generate_report(self):
        """Generate execution report"""
        total_time = time.time() - self.start_time
        successful_batches = [r for r in self.results if r['success']]
        failed_batches = [r for r in self.results if not r['success']]
        
        print("\n" + "=" * 70)
        print("📋 SHOPIFY BATCH PROCESSING REPORT")
        print("=" * 70)
        print(f"⏱️  Total Execution Time: {total_time:.2f} seconds")
        print(f"✅ Successful Batches: {len(successful_batches)}/20")
        print(f"❌ Failed Batches: {len(failed_batches)}/20")
        print(f"📊 Total Records Processed: {len(successful_batches) * 153} records")
        print(f"⚡ Average Time per Batch: {sum(r['execution_time'] for r in self.results) / len(self.results):.2f}s")
        
        if failed_batches:
            print("\n❌ FAILED BATCHES:")
            for batch in failed_batches:
                print(f"   • Batch {batch['batch_number']:02d}: {batch['error']}")
        
        if successful_batches:
            print("\n✅ SUCCESSFUL BATCHES:")
            for batch in successful_batches[:5]:  # Show first 5
                print(f"   • Batch {batch['batch_number']:02d}: {batch['execution_time']:.2f}s")
            if len(successful_batches) > 5:
                print(f"   ... and {len(successful_batches) - 5} more")
        
        # Save detailed results
        report_file = f"/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/shopify_execution_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump({
                'execution_summary': {
                    'total_time': total_time,
                    'total_batches': len(self.results),
                    'successful_batches': len(successful_batches),
                    'failed_batches': len(failed_batches),
                    'total_records': len(successful_batches) * 153,
                    'ref_parameter': self.ref_param,
                    'timestamp': datetime.now().isoformat()
                },
                'batch_results': self.results
            }, f, indent=2)
        
        print(f"\n📄 Detailed report saved: {os.path.basename(report_file)}")
        print("=" * 70)

def main():
    processor = ShopifyBatchProcessor(
        ref_param="nbclorobfotxrpbmyapi",
        max_workers=8  # Optimal for this workload
    )
    processor.process_all_batches()

if __name__ == "__main__":
    main()