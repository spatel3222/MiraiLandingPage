#!/usr/bin/env python3
"""
Execute Meta batch files with proper database handling and progress tracking
"""

import os
import glob
import subprocess
import time
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# Thread-safe progress tracking
progress_lock = Lock()
execution_stats = {
    'total_files': 0,
    'completed': 0,
    'failed': 0,
    'total_records': 0,
    'start_time': None,
    'errors': []
}

def execute_single_meta_batch(file_path, db_name="moi_analytics"):
    """Execute a single Meta batch file with ref_parameter injection"""
    global execution_stats
    
    file_name = os.path.basename(file_path)
    
    try:
        # Read the original file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        # Check if file has data
        if 'INSERT INTO' not in content or 'VALUES' not in content:
            with progress_lock:
                execution_stats['completed'] += 1
            return {'file': file_name, 'status': 'skipped', 'reason': 'no_data'}
        
        # Create modified SQL with ref_parameter and conflict resolution
        lines = content.split('\n')
        modified_lines = []
        
        # Process the INSERT statement to add ref_parameter
        for line in lines:
            if line.strip().startswith('INSERT INTO meta_raw_data'):
                # Modify the column list to include ref_parameter
                modified_lines.append("INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name,")
                modified_lines.append("                                              amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter)")
            elif line.strip() == 'VALUES':
                modified_lines.append("VALUES")
            elif line.strip().startswith('('):
                # This is a data line - add ref_parameter
                original_line = line.strip()
                if original_line.endswith('),'):
                    # Not the last record
                    new_line = original_line[:-2] + ", 'nbclorobfotxrpbmyapi'),"
                elif original_line.endswith(');'):
                    # Last record
                    new_line = original_line[:-2] + ", 'nbclorobfotxrpbmyapi');"
                else:
                    new_line = original_line + ", 'nbclorobfotxrpbmyapi'"
                
                modified_lines.append(new_line)
            else:
                modified_lines.append(line)
        
        # Add conflict resolution
        if modified_lines[-1].endswith(';'):
            modified_lines[-1] = modified_lines[-1][:-1]  # Remove semicolon
            modified_lines.append("ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name)")
            modified_lines.append("DO UPDATE SET")
            modified_lines.append("    amount_spent_inr = EXCLUDED.amount_spent_inr,")
            modified_lines.append("    cpm_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,")
            modified_lines.append("    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,")
            modified_lines.append("    processed_at = CURRENT_TIMESTAMP;")
        
        modified_content = '\n'.join(modified_lines)
        
        # Execute the SQL
        result = subprocess.run(
            ['psql', '-d', db_name, '-c', modified_content],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout per file
        )
        
        if result.returncode == 0:
            # Count records processed
            record_count = content.count('\n    (')  # Count data rows
            
            with progress_lock:
                execution_stats['completed'] += 1
                execution_stats['total_records'] += record_count
            
            return {
                'file': file_name, 
                'status': 'success', 
                'records': record_count,
                'output': result.stdout.strip()
            }
        else:
            with progress_lock:
                execution_stats['failed'] += 1
                execution_stats['errors'].append(f"{file_name}: {result.stderr}")
            
            return {
                'file': file_name, 
                'status': 'failed', 
                'error': result.stderr,
                'output': result.stdout
            }
    
    except Exception as e:
        with progress_lock:
            execution_stats['failed'] += 1
            execution_stats['errors'].append(f"{file_name}: {str(e)}")
        
        return {
            'file': file_name, 
            'status': 'error', 
            'error': str(e)
        }

def execute_all_meta_batches():
    """Execute all Meta batch files in parallel"""
    global execution_stats
    
    processed_meta_dir = "processed_meta"
    
    # Get all meta batch files
    meta_files = sorted(glob.glob(f"{processed_meta_dir}/meta_batch_*.sql"), 
                       key=lambda x: int(re.search(r'meta_batch_(\d+)\.sql', x).group(1)))
    
    execution_stats['total_files'] = len(meta_files)
    execution_stats['start_time'] = time.time()
    
    print(f"🚀 Starting execution of {len(meta_files)} Meta batch files")
    print(f"📊 Using {min(20, len(meta_files))} parallel workers")
    
    # First, ensure the table exists
    create_table_sql = """
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
    
    CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);
    CREATE INDEX IF NOT EXISTS idx_meta_campaign_name ON meta_raw_data(campaign_name);
    CREATE INDEX IF NOT EXISTS idx_meta_ref_parameter ON meta_raw_data(ref_parameter);
    CREATE INDEX IF NOT EXISTS idx_meta_processed_at ON meta_raw_data(processed_at);
    """
    
    subprocess.run(['psql', '-d', 'moi_analytics', '-c', create_table_sql], 
                   capture_output=True, text=True)
    
    # Execute batch files in parallel
    results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        # Submit all tasks
        futures = {executor.submit(execute_single_meta_batch, file_path): file_path 
                  for file_path in meta_files}
        
        # Process completed tasks with progress updates
        for i, future in enumerate(as_completed(futures)):
            result = future.result()
            results.append(result)
            
            # Progress update every 50 files or at the end
            if (i + 1) % 50 == 0 or (i + 1) == len(meta_files):
                elapsed = time.time() - execution_stats['start_time']
                print(f"📈 Progress: {i + 1}/{len(meta_files)} files processed in {elapsed:.1f}s")
                print(f"   ✅ Success: {execution_stats['completed']}")
                print(f"   ❌ Failed: {execution_stats['failed']}")
                print(f"   📊 Records: {execution_stats['total_records']:,}")
    
    # Final summary
    total_time = time.time() - execution_stats['start_time']
    print(f"\n🎉 Meta batch execution completed!")
    print(f"⏱️  Total time: {total_time:.1f} seconds")
    print(f"📊 Results:")
    print(f"   ✅ Successful: {execution_stats['completed']}")
    print(f"   ❌ Failed: {execution_stats['failed']}")
    print(f"   📈 Total records: {execution_stats['total_records']:,}")
    
    # Save detailed results
    results_file = f"meta_execution_results_{int(time.time())}.json"
    with open(results_file, 'w') as f:
        json.dump({
            'execution_stats': execution_stats,
            'results': results,
            'total_time': total_time
        }, f, indent=2)
    
    print(f"📄 Detailed results saved to: {results_file}")
    
    return execution_stats['total_records'], execution_stats['completed'], execution_stats['failed']

if __name__ == "__main__":
    total_records, success_count, fail_count = execute_all_meta_batches()
    print(f"\n🚀 Final Result: {total_records:,} records ingested from {success_count} files")