#!/usr/bin/env python3
"""
Create corrected Meta SQL from original batch files with proper data handling
"""

import os
import glob
import re

def create_corrected_meta_sql():
    output_file = "meta_execution_ready.sql"
    processed_meta_dir = "processed_meta"
    
    print(f"🔧 Creating corrected Meta SQL file from original batch files")
    
    # Get all meta batch files, sorted numerically
    meta_files = sorted(glob.glob(f"{processed_meta_dir}/meta_batch_*.sql"), 
                       key=lambda x: int(re.search(r'meta_batch_(\d+)\.sql', x).group(1)))
    
    print(f"📁 Found {len(meta_files)} Meta batch files")
    
    with open(output_file, 'w', encoding='utf-8') as out_f:
        # Write header
        out_f.write("-- MOI Analytics Dashboard - Meta Data Execution Ready Import\n")
        out_f.write("-- Generated: November 2, 2024\n")
        out_f.write(f"-- Total Files: {len(meta_files)}\n")
        out_f.write("-- Ref Parameter: nbclorobfotxrpbmyapi\n")
        out_f.write("-- Processing: All Meta advertising campaign batch files\n\n")
        
        # Write table creation
        out_f.write("-- Create Meta raw data table if it doesn't exist\n")
        out_f.write("CREATE TABLE IF NOT EXISTS meta_raw_data (\n")
        out_f.write("    id SERIAL PRIMARY KEY,\n")
        out_f.write("    reporting_starts DATE,\n")
        out_f.write("    campaign_name TEXT,\n")
        out_f.write("    ad_set_name TEXT,\n")
        out_f.write("    ad_name TEXT,\n")
        out_f.write("    amount_spent_inr DECIMAL(10,2),\n")
        out_f.write("    cpm_cost_per_1000_impressions DECIMAL(10,8),\n")
        out_f.write("    ctr_link_click_through_rate DECIMAL(10,8),\n")
        out_f.write("    ref_parameter TEXT DEFAULT 'nbclorobfotxrpbmyapi',\n")
        out_f.write("    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n")
        out_f.write("    UNIQUE(reporting_starts, campaign_name, ad_set_name, ad_name)\n")
        out_f.write(");\n\n")
        
        # Write indexes
        out_f.write("-- Create indexes for optimal query performance\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_campaign_name ON meta_raw_data(campaign_name);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_ref_parameter ON meta_raw_data(ref_parameter);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_processed_at ON meta_raw_data(processed_at);\n\n")
        
        out_f.write("-- Begin data insertion with conflict resolution\n\n")
        
        total_records = 0
        files_with_data = 0
        
        for file_path in meta_files:
            file_name = os.path.basename(file_path)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                
                # Check if file has data (look for INSERT statement)
                if 'INSERT INTO' not in content or 'VALUES' not in content:
                    continue
                
                files_with_data += 1
                
                # Parse the content to extract complete data rows
                lines = content.split('\n')
                in_values = False
                current_record = []
                complete_records = []
                
                for line in lines:
                    line = line.strip()
                    if line == 'VALUES':
                        in_values = True
                        continue
                    elif in_values and (line.startswith('(') or (current_record and not line.startswith('('))):
                        if line.startswith('('):
                            # Start of a new record
                            if current_record:
                                # Save previous record
                                complete_records.append(' '.join(current_record))
                            current_record = [line]
                        else:
                            # Continuation of current record
                            current_record.append(line)
                            
                        # Check if this record is complete (ends with ), or );)
                        if line.endswith('),') or line.endswith(');'):
                            complete_records.append(' '.join(current_record))
                            current_record = []
                
                # Add any remaining record
                if current_record:
                    complete_records.append(' '.join(current_record))
                
                if complete_records:
                    record_count = len(complete_records)
                    out_f.write(f"-- Batch file: {file_name} ({record_count} records)\n")
                    out_f.write("INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name,\n")
                    out_f.write("                           amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter)\n")
                    out_f.write("VALUES\n")
                    
                    # Write each complete record with ref_parameter added
                    for i, record in enumerate(complete_records):
                        # Clean up the record
                        clean_record = record.strip()
                        
                        # Remove trailing ), or );
                        if clean_record.endswith('),'):
                            clean_record = clean_record[:-2]
                        elif clean_record.endswith(');'):
                            clean_record = clean_record[:-2]
                        elif clean_record.endswith(')'):
                            clean_record = clean_record[:-1]
                        
                        # Add ref_parameter to the record
                        record_with_ref = clean_record + ", 'nbclorobfotxrpbmyapi'"
                        
                        if i == len(complete_records) - 1:
                            # Last row - end with semicolon
                            out_f.write(f"    ({record_with_ref});\n")
                        else:
                            # Not last row - end with comma
                            out_f.write(f"    ({record_with_ref}),\n")
                    
                    out_f.write("\n")
                    total_records += record_count
                
            except Exception as e:
                print(f"❌ Error processing {file_name}: {e}")
                continue
    
    file_size = os.path.getsize(output_file)
    print(f"✅ Corrected SQL file created: {output_file}")
    print(f"📊 Files with data: {files_with_data}/{len(meta_files)}")
    print(f"📊 Total records: {total_records:,}")
    print(f"📊 File size: {file_size:,} bytes")
    
    return output_file, total_records, files_with_data

if __name__ == "__main__":
    output_file, records, files = create_corrected_meta_sql()
    print(f"\n🚀 Ready to execute: {output_file}")