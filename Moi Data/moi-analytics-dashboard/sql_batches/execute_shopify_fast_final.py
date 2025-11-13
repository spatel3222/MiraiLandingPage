#!/usr/bin/env python3
"""
IMMEDIATE COMPLETE SHOPIFY UPLOAD - FAST MCP METHOD
Execute all 330 Shopify batch files using proven high-velocity parallel processing
Target: Upload all 3,288,227 Shopify records to shopify_raw_data table
Performance: Achieve 500+ records/second like Meta upload
"""

import os
import sys
import time
import concurrent.futures
import threading
from pathlib import Path

# Add the parent directory to sys.path to import mcp modules
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

try:
    from mcp_rube import RUBE_MULTI_EXECUTE_TOOL
    print("✅ Successfully imported RUBE_MULTI_EXECUTE_TOOL")
except ImportError as e:
    print(f"❌ Failed to import MCP module: {e}")
    print("Attempting to initialize MCP connection...")
    # This will fail gracefully and show the user what to do
    
# Configuration
SUPABASE_REF = "nbclorobfotxrpbmyapi"
SESSION_ID = "talk"
BATCH_DIR = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/shopify_full_batches"
MAX_PARALLEL = 8  # Optimized for high throughput
BATCH_SIZE = 10   # Files per parallel batch

class ShopifyFastUploader:
    def __init__(self):
        self.uploaded_count = 0
        self.failed_count = 0
        self.total_files = 0
        self.start_time = None
        self.lock = threading.Lock()
        
    def get_batch_files(self):
        """Get all Shopify batch files sorted by number"""
        files = []
        for file_path in Path(BATCH_DIR).glob("shopify_chunk_*.sql"):
            files.append(str(file_path))
        
        # Sort by chunk number
        files.sort(key=lambda x: int(x.split('_')[-1].split('.')[0]))
        return files
    
    def read_sql_file(self, file_path):
        """Read SQL content from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    return content
                else:
                    print(f"⚠️  Empty file: {file_path}")
                    return None
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")
            return None
    
    def execute_sql_batch(self, sql_query, file_name):
        """Execute a single SQL batch using MCP"""
        try:
            tools = [{
                "tool_slug": "SUPABASE_BETA_RUN_SQL_QUERY",
                "arguments": {
                    "ref": SUPABASE_REF,
                    "query": sql_query
                }
            }]
            
            result = RUBE_MULTI_EXECUTE_TOOL(
                tools=tools,
                session_id=SESSION_ID,
                current_step="UPLOADING_SHOPIFY_DATA",
                current_step_metric=f"{self.uploaded_count}/{self.total_files} files",
                next_step="UPLOADING_SHOPIFY_DATA",
                thought=f"Executing {file_name} with fast MCP upload",
                sync_response_to_workbench=False,
                memory={"supabase": [f"Uploading Shopify batch {file_name} to shopify_raw_data table"]}
            )
            
            if result and 'error' not in str(result).lower():
                with self.lock:
                    self.uploaded_count += 1
                print(f"✅ {file_name} - Success ({self.uploaded_count}/{self.total_files})")
                return True
            else:
                with self.lock:
                    self.failed_count += 1
                print(f"❌ {file_name} - Failed: {result}")
                return False
                
        except Exception as e:
            with self.lock:
                self.failed_count += 1
            print(f"❌ {file_name} - Exception: {e}")
            return False
    
    def process_file_batch(self, file_paths):
        """Process a batch of files in parallel"""
        results = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as executor:
            futures = []
            
            for file_path in file_paths:
                file_name = os.path.basename(file_path)
                sql_content = self.read_sql_file(file_path)
                
                if sql_content:
                    future = executor.submit(self.execute_sql_batch, sql_content, file_name)
                    futures.append((future, file_name))
                else:
                    print(f"⚠️  Skipping empty file: {file_name}")
            
            # Collect results
            for future, file_name in futures:
                try:
                    success = future.result(timeout=120)  # 2 minute timeout per file
                    results.append(success)
                except concurrent.futures.TimeoutError:
                    print(f"⏰ Timeout executing {file_name}")
                    results.append(False)
                except Exception as e:
                    print(f"❌ Error executing {file_name}: {e}")
                    results.append(False)
        
        return results
    
    def execute_fast_upload(self):
        """Execute complete fast upload of all Shopify batches"""
        print("🚀 STARTING IMMEDIATE COMPLETE SHOPIFY UPLOAD")
        print("=" * 60)
        
        # Get all batch files
        batch_files = self.get_batch_files()
        self.total_files = len(batch_files)
        
        if self.total_files == 0:
            print("❌ No Shopify batch files found!")
            return False
        
        print(f"📁 Found {self.total_files} Shopify batch files")
        print(f"🎯 Target: Upload 3,288,227 records to shopify_raw_data")
        print(f"⚡ Strategy: {MAX_PARALLEL} parallel threads, {BATCH_SIZE} files per batch")
        print()
        
        self.start_time = time.time()
        
        # Process files in batches for maximum throughput
        for i in range(0, len(batch_files), BATCH_SIZE):
            batch = batch_files[i:i + BATCH_SIZE]
            batch_num = (i // BATCH_SIZE) + 1
            total_batches = (len(batch_files) + BATCH_SIZE - 1) // BATCH_SIZE
            
            print(f"📦 Processing batch {batch_num}/{total_batches} ({len(batch)} files)")
            
            # Execute batch with high-speed parallel processing
            batch_results = self.process_file_batch(batch)
            
            # Show progress
            elapsed = time.time() - self.start_time
            rate = self.uploaded_count / elapsed if elapsed > 0 else 0
            
            print(f"⚡ Progress: {self.uploaded_count}/{self.total_files} files")
            print(f"📊 Rate: {rate:.1f} files/second")
            print(f"⏱️  Elapsed: {elapsed:.1f}s")
            
            if self.failed_count > 0:
                print(f"⚠️  Failed: {self.failed_count} files")
            print()
        
        # Final summary
        self.print_final_summary()
        return self.failed_count == 0
    
    def print_final_summary(self):
        """Print final upload summary"""
        elapsed = time.time() - self.start_time
        success_rate = (self.uploaded_count / self.total_files * 100) if self.total_files > 0 else 0
        avg_rate = self.uploaded_count / elapsed if elapsed > 0 else 0
        
        print("=" * 60)
        print("🎉 SHOPIFY FAST UPLOAD COMPLETE!")
        print("=" * 60)
        print(f"📊 Files Processed: {self.total_files}")
        print(f"✅ Successful: {self.uploaded_count}")
        print(f"❌ Failed: {self.failed_count}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"⚡ Average Rate: {avg_rate:.1f} files/second")
        print(f"⏱️  Total Time: {elapsed:.1f} seconds")
        print()
        
        if self.uploaded_count == self.total_files:
            print("🎯 ALL SHOPIFY DATA UPLOADED SUCCESSFULLY!")
            print("📈 Expected ~3.4M total records in shopify_raw_data table")
        else:
            print(f"⚠️  {self.failed_count} files failed - check errors above")

def main():
    """Main execution function"""
    try:
        uploader = ShopifyFastUploader()
        success = uploader.execute_fast_upload()
        
        if success:
            print("🎉 MISSION ACCOMPLISHED: Complete Shopify upload successful!")
            return 0
        else:
            print("⚠️  Upload completed with some failures - check logs above")
            return 1
            
    except KeyboardInterrupt:
        print("\n⏹️  Upload interrupted by user")
        return 1
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)