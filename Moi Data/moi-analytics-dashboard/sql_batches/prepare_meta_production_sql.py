#!/usr/bin/env python3
"""
Prepare production-ready Meta SQL file from batch files
This creates a clean, executable SQL file with proper formatting
"""

import os
import glob
import re

def prepare_meta_production_sql():
    output_file = "meta_production_ready.sql"
    processed_meta_dir = "processed_meta"
    
    print(f"🔧 Preparing production-ready Meta SQL file")
    
    # Get all meta batch files, sorted numerically
    meta_files = sorted(glob.glob(f"{processed_meta_dir}/meta_batch_*.sql"), 
                       key=lambda x: int(re.search(r'meta_batch_(\d+)\.sql', x).group(1)))
    
    print(f"📁 Processing {len(meta_files)} Meta batch files")
    
    with open(output_file, 'w', encoding='utf-8') as out_f:
        # Write comprehensive header
        out_f.write("-- ================================================================\n")
        out_f.write("-- MOI Analytics Dashboard - Meta Advertising Data Import\n")
        out_f.write("-- ================================================================\n")
        out_f.write("-- Generated: November 2, 2024\n")
        out_f.write(f"-- Source Files: {len(meta_files)} Meta batch files\n")
        out_f.write("-- Expected Records: ~34,550 Meta advertising campaign records\n")
        out_f.write("-- Ref Parameter: nbclorobfotxrpbmyapi\n")
        out_f.write("-- Table: meta_raw_data\n")
        out_f.write("-- Features: Conflict resolution, indexing, audit trail\n")
        out_f.write("-- ================================================================\n\n")
        
        # Table creation with comprehensive schema
        out_f.write("-- Create Meta raw data table with optimized schema\n")
        out_f.write("CREATE TABLE IF NOT EXISTS meta_raw_data (\n")
        out_f.write("    id SERIAL PRIMARY KEY,\n")
        out_f.write("    reporting_starts DATE NOT NULL,\n")
        out_f.write("    campaign_name TEXT NOT NULL,\n")
        out_f.write("    ad_set_name TEXT NOT NULL,\n")
        out_f.write("    ad_name TEXT NOT NULL,\n")
        out_f.write("    amount_spent_inr DECIMAL(10,2) DEFAULT 0,\n")
        out_f.write("    cpm_cost_per_1000_impressions DECIMAL(10,8) DEFAULT 0,\n")
        out_f.write("    ctr_link_click_through_rate DECIMAL(10,8) DEFAULT 0,\n")
        out_f.write("    ref_parameter TEXT DEFAULT 'nbclorobfotxrpbmyapi',\n")
        out_f.write("    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n")
        out_f.write("    CONSTRAINT unique_meta_record UNIQUE(reporting_starts, campaign_name, ad_set_name, ad_name)\n")
        out_f.write(");\n\n")
        
        # Performance indexes
        out_f.write("-- Create optimized indexes for analytics queries\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_campaign_name ON meta_raw_data(campaign_name);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_ref_parameter ON meta_raw_data(ref_parameter);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_processed_at ON meta_raw_data(processed_at);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_amount_spent ON meta_raw_data(amount_spent_inr);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_campaign_date ON meta_raw_data(campaign_name, reporting_starts);\n\n")
        
        out_f.write("-- Begin batch data insertion with conflict resolution\n")
        out_f.write("-- Processing all Meta advertising campaign records\n\n")
        
        total_records = 0
        files_processed = 0
        batch_size = 10  # Group files for better performance
        
        for i in range(0, len(meta_files), batch_size):
            batch_files = meta_files[i:i + batch_size]
            batch_records = []
            
            # Process files in current batch
            for file_path in batch_files:
                file_name = os.path.basename(file_path)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                    
                    # Extract data rows from the file
                    if 'VALUES' in content:
                        lines = content.split('\n')
                        in_values = False
                        
                        for line in lines:
                            line = line.strip()
                            if line == 'VALUES':
                                in_values = True
                                continue
                            elif in_values and line.startswith('('):
                                # Clean up the data row
                                clean_row = line
                                if clean_row.endswith('),'):
                                    clean_row = clean_row[:-2] + ')'
                                elif clean_row.endswith(');'):
                                    clean_row = clean_row[:-2] + ')'
                                
                                # Add ref_parameter to the row
                                if clean_row.endswith(')'):
                                    row_with_ref = clean_row[:-1] + ", 'nbclorobfotxrpbmyapi')"
                                    batch_records.append(row_with_ref)
                                    total_records += 1
                        
                        files_processed += 1
                    
                except Exception as e:
                    print(f"⚠️  Warning: Could not process {file_name}: {e}")
                    continue
            
            # Write batch INSERT statement
            if batch_records:
                out_f.write(f"-- Batch {i//batch_size + 1}: Files {i + 1}-{min(i + batch_size, len(meta_files))} ({len(batch_records)} records)\n")
                out_f.write("INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name,\n")
                out_f.write("                           amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter)\n")
                out_f.write("VALUES\n")
                
                # Write all records in this batch
                for j, record in enumerate(batch_records):
                    if j == len(batch_records) - 1:
                        out_f.write(f"    {record}\n")
                    else:
                        out_f.write(f"    {record},\n")
                
                # Add conflict resolution
                out_f.write("ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name)\n")
                out_f.write("DO UPDATE SET\n")
                out_f.write("    amount_spent_inr = EXCLUDED.amount_spent_inr,\n")
                out_f.write("    cpm_cost_per_1000_impressions = EXCLUDED.cmp_cost_per_1000_impressions,\n")
                out_f.write("    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,\n")
                out_f.write("    processed_at = CURRENT_TIMESTAMP;\n\n")
    
    file_size = os.path.getsize(output_file)
    print(f"✅ Production SQL file created: {output_file}")
    print(f"📊 Files processed: {files_processed}/{len(meta_files)}")
    print(f"📊 Total records: {total_records:,}")
    print(f"📊 File size: {file_size:,} bytes ({file_size/1024/1024:.1f} MB)")
    
    return output_file, total_records, files_processed

if __name__ == "__main__":
    output_file, records, files = prepare_meta_production_sql()
    print(f"\n🚀 Production file ready: {output_file}")
    print(f"🎯 Ready for database execution with {records:,} records")