#!/usr/bin/env python3
"""
Parallel Meta Batch Processor
Efficiently processes all Meta batch SQL files with maximum parallelism
"""

import os
import subprocess
import concurrent.futures
import time
import glob
from pathlib import Path

# Configuration
BASE_DIR = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches"
REF_PARAMETER = "nbclorobfotxrpbmyapi"
MAX_WORKERS = 100  # High parallelism for small Meta files
BATCH_SIZE = 100   # Process 100 files simultaneously

# PostgreSQL connection (adjust as needed)
PG_CONNECTION = "postgresql://username:password@localhost:5432/moi_analytics"

def create_meta_table_sql():
    """Create the meta_raw_data table with ON CONFLICT handling"""
    return """
    CREATE TABLE IF NOT EXISTS meta_raw_data (
        id SERIAL PRIMARY KEY,
        reporting_starts DATE,
        campaign_name TEXT,
        ad_set_name TEXT,
        ad_name TEXT,
        amount_spent_inr DECIMAL(10,2),
        cpm_cost_per_1000_impressions DECIMAL(10,8),
        ctr_link_click_through_rate DECIMAL(10,8),
        ref_parameter TEXT DEFAULT 'nbclorobfotxrpbmyapi',
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reporting_starts, campaign_name, ad_set_name, ad_name)
    );
    
    CREATE INDEX IF NOT EXISTS idx_meta_ref_param ON meta_raw_data(ref_parameter);
    CREATE INDEX IF NOT EXISTS idx_meta_campaign ON meta_raw_data(campaign_name);
    CREATE INDEX IF NOT EXISTS idx_meta_date ON meta_raw_data(reporting_starts);
    """

def modify_sql_file(file_path):
    """Add ON CONFLICT handling and ref parameter to SQL file"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Add ref parameter to INSERT statement
        if 'ref_parameter' not in content:
            # Find the column list
            lines = content.strip().split('\n')
            insert_line = lines[0]
            values_start = lines[2]  # VALUES line
            
            # Modify the INSERT statement to include ref_parameter
            modified_insert = insert_line.replace(
                'ctr_link_click_through_rate)',
                "ctr_link_click_through_rate, ref_parameter)"
            )
            
            # Modify each value line to include ref parameter
            modified_lines = [modified_insert, lines[1]]  # Keep the column format line
            
            for line in lines[2:]:
                if line.strip().endswith(',') or line.strip().endswith(');'):
                    # Add ref parameter before the closing parenthesis
                    if line.strip().endswith(','):
                        modified_line = line.replace('),', f", '{REF_PARAMETER}'),")
                    else:  # ends with );
                        modified_line = line.replace(');', f", '{REF_PARAMETER}');")
                    modified_lines.append(modified_line)
                else:
                    modified_lines.append(line)
            
            # Add ON CONFLICT clause
            modified_content = '\n'.join(modified_lines)
            modified_content = modified_content.replace(
                ');',
                ''') ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name) 
                DO UPDATE SET 
                    amount_spent_inr = EXCLUDED.amount_spent_inr,
                    cpm_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,
                    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,
                    ref_parameter = EXCLUDED.ref_parameter,
                    processed_at = CURRENT_TIMESTAMP;'''
            )
            
            return modified_content
        else:
            return content
            
    except Exception as e:
        print(f"Error modifying {file_path}: {e}")
        return None

def execute_sql_file(file_info):
    """Execute a single SQL file"""
    file_path, file_num, total_files = file_info
    
    try:
        # Modify SQL content
        modified_sql = modify_sql_file(file_path)
        if not modified_sql:
            return {"file": file_path, "status": "error", "message": "Failed to modify SQL"}
        
        # Execute SQL (using psql command - adjust connection as needed)
        process = subprocess.run(
            ['psql', PG_CONNECTION, '-c', modified_sql],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if process.returncode == 0:
            # Remove processed file
            os.remove(file_path)
            return {
                "file": file_path,
                "file_num": file_num,
                "status": "success",
                "message": f"Processed and removed ({file_num}/{total_files})"
            }
        else:
            return {
                "file": file_path,
                "file_num": file_num,
                "status": "error",
                "message": f"SQL error: {process.stderr}"
            }
            
    except subprocess.TimeoutExpired:
        return {
            "file": file_path,
            "file_num": file_num,
            "status": "timeout",
            "message": "Execution timeout"
        }
    except Exception as e:
        return {
            "file": file_path,
            "file_num": file_num,
            "status": "error",
            "message": str(e)
        }

def main():
    print("🚀 Meta Batch Parallel Processor")
    print("=" * 50)
    
    # Find all Meta batch files
    pattern = os.path.join(BASE_DIR, "meta_batch_*.sql")
    meta_files = sorted(glob.glob(pattern))
    
    if not meta_files:
        print("❌ No Meta batch files found!")
        return
    
    total_files = len(meta_files)
    print(f"📊 Found {total_files} Meta batch files")
    print(f"🔧 Using {MAX_WORKERS} parallel workers")
    print(f"📦 Processing in batches of {BATCH_SIZE}")
    print(f"🔑 Ref Parameter: {REF_PARAMETER}")
    print()
    
    # Create table first
    print("🏗️  Creating meta_raw_data table...")
    try:
        subprocess.run(
            ['psql', PG_CONNECTION, '-c', create_meta_table_sql()],
            check=True,
            capture_output=True
        )
        print("✅ Table created successfully")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Table creation warning (may already exist): {e}")
    
    # Prepare file info with numbering
    file_info_list = [(file_path, i+1, total_files) for i, file_path in enumerate(meta_files)]
    
    # Process files in parallel batches
    start_time = time.time()
    success_count = 0
    error_count = 0
    
    print(f"\n🔄 Processing {total_files} files...")
    print("=" * 50)
    
    # Process in chunks for better memory management
    for batch_start in range(0, total_files, BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, total_files)
        batch_files = file_info_list[batch_start:batch_end]
        
        print(f"\n📦 Processing batch {batch_start//BATCH_SIZE + 1}: files {batch_start+1}-{batch_end}")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            batch_start_time = time.time()
            
            # Submit all files in current batch
            future_to_file = {
                executor.submit(execute_sql_file, file_info): file_info 
                for file_info in batch_files
            }
            
            # Process results as they complete
            for future in concurrent.futures.as_completed(future_to_file):
                result = future.result()
                
                if result["status"] == "success":
                    success_count += 1
                    print(f"✅ {result['message']}")
                else:
                    error_count += 1
                    print(f"❌ {result['file']} - {result['message']}")
            
            batch_time = time.time() - batch_start_time
            print(f"⏱️  Batch completed in {batch_time:.2f}s")
    
    # Final summary
    total_time = time.time() - start_time
    print("\n" + "=" * 50)
    print("📊 PROCESSING COMPLETE")
    print("=" * 50)
    print(f"✅ Success: {success_count} files")
    print(f"❌ Errors: {error_count} files")
    print(f"📈 Success Rate: {(success_count/total_files)*100:.1f}%")
    print(f"⏱️  Total Time: {total_time:.2f}s")
    print(f"🚀 Throughput: {total_files/total_time:.1f} files/second")
    print(f"📊 Records Processed: ~{total_files * 50:,} records")
    print(f"🔑 Ref Parameter: {REF_PARAMETER}")
    
    # Check remaining files
    remaining_files = glob.glob(pattern)
    if remaining_files:
        print(f"\n⚠️  {len(remaining_files)} files still remain (check errors)")
    else:
        print(f"\n🎉 ALL META BATCH FILES PROCESSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()