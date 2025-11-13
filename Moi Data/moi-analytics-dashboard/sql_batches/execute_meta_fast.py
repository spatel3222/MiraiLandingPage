#!/usr/bin/env python3
"""
Fast Meta Data Upload - Batch Processor
======================================
Uploads remaining Meta records in optimized chunks
"""

import sys
import time

def execute_meta_batch(start_line, batch_size=50):
    """Execute a batch of Meta records starting from specified line"""
    
    # Read the meta file and extract records
    meta_file = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/meta_final_production.sql"
    
    with open(meta_file, 'r') as f:
        lines = f.readlines()
    
    # Find INSERT VALUES section
    start_idx = None
    for i, line in enumerate(lines):
        if "VALUES" in line:
            start_idx = i + 1
            break
    
    if not start_idx:
        print("❌ Could not find VALUES section")
        return False
    
    # Extract batch records
    records = []
    current_line = start_idx + start_line
    
    for i in range(batch_size):
        if current_line + i < len(lines):
            line = lines[current_line + i].strip()
            if line and not line.startswith('--') and not line.startswith('ON CONFLICT'):
                # Clean up the line
                if line.endswith(','):
                    line = line[:-1]
                if line.endswith(';'):
                    line = line[:-1]
                records.append(line)
    
    if not records:
        print(f"❌ No records found at line {start_line}")
        return False
    
    # Create SQL
    sql = f"""INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name, amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter) VALUES 
{','.join(records)}
ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name) DO UPDATE SET processed_at = CURRENT_TIMESTAMP;"""
    
    print(f"🚀 Executing batch: lines {start_line}-{start_line + len(records)}")
    print(f"📊 Records in batch: {len(records)}")
    
    # Execute via SQL (you'll need to run this manually)
    print("\n" + "="*60)
    print("EXECUTE THIS SQL:")
    print("="*60)
    print(sql[:500] + "..." if len(sql) > 500 else sql)
    print("="*60)
    
    return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 execute_meta_fast.py <start_line>")
        print("Example: python3 execute_meta_fast.py 40")
        sys.exit(1)
    
    start_line = int(sys.argv[1])
    execute_meta_batch(start_line, batch_size=50)