#!/usr/bin/env python3
"""
Create final Meta SQL file with proper multi-line record parsing
"""

import os
import glob
import re

def create_final_meta_sql_v3():
    output_file = "meta_final_production.sql"
    processed_meta_dir = "processed_meta"
    
    print(f"🔧 Creating final Meta SQL file with multi-line parsing")
    
    # Get all meta batch files, sorted numerically
    meta_files = sorted(glob.glob(f"{processed_meta_dir}/meta_batch_*.sql"), 
                       key=lambda x: int(re.search(r'meta_batch_(\d+)\.sql', x).group(1)))
    
    print(f"📁 Processing {len(meta_files)} Meta batch files")
    
    with open(output_file, 'w', encoding='utf-8') as out_f:
        # Write header
        out_f.write("-- ================================================================\n")
        out_f.write("-- MOI Analytics Dashboard - Meta Advertising Data Production Import\n")
        out_f.write("-- ================================================================\n")
        out_f.write("-- Generated: November 2, 2024\n")
        out_f.write(f"-- Source Files: {len(meta_files)} Meta batch files\n")
        out_f.write("-- Expected Records: ~34,550 Meta advertising campaign records\n")
        out_f.write("-- Ref Parameter: nbclorobfotxrpbmyapi\n")
        out_f.write("-- Table: meta_raw_data\n")
        out_f.write("-- ================================================================\n\n")
        
        # Table creation
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
        
        # Indexes
        out_f.write("-- Create performance indexes\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_campaign_name ON meta_raw_data(campaign_name);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_ref_parameter ON meta_raw_data(ref_parameter);\n")
        out_f.write("CREATE INDEX IF NOT EXISTS idx_meta_processed_at ON meta_raw_data(processed_at);\n\n")
        
        out_f.write("-- Begin data insertion\n\n")
        
        total_records = 0
        files_processed = 0
        
        # Process all files into one large INSERT
        all_records = []
        
        for file_path in meta_files:
            file_name = os.path.basename(file_path)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                
                # Parse multi-line records
                lines = content.split('\n')
                in_values = False
                current_record_lines = []
                
                for line in lines:
                    line = line.strip()
                    
                    if line == 'VALUES':
                        in_values = True
                        continue
                    elif in_values:
                        if line.startswith('('):
                            # Start of a new record
                            if current_record_lines:
                                # Process previous record
                                record = process_record(current_record_lines)
                                if record:
                                    all_records.append(record)
                                    total_records += 1
                            
                            current_record_lines = [line]
                        elif current_record_lines:
                            # Continuation of current record
                            current_record_lines.append(line)
                
                # Process the last record
                if current_record_lines:
                    record = process_record(current_record_lines)
                    if record:
                        all_records.append(record)
                        total_records += 1
                
                files_processed += 1
                
            except Exception as e:
                print(f"⚠️  Warning: Could not process {file_name}: {e}")
                continue
        
        # Write all records in batches
        if all_records:
            out_f.write(f"-- Inserting {total_records:,} Meta advertising records\n")
            out_f.write("INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name,\n")
            out_f.write("                           amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter)\n")
            out_f.write("VALUES\n")
            
            batch_size = 500  # Write in batches for better performance
            for i, record in enumerate(all_records):
                if i == len(all_records) - 1:
                    # Last record
                    out_f.write(f"    {record}\n")
                else:
                    out_f.write(f"    {record},\n")
                
                # Create new INSERT statement every batch_size records
                if (i + 1) % batch_size == 0 and i < len(all_records) - 1:
                    out_f.write("ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name)\n")
                    out_f.write("DO UPDATE SET\n")
                    out_f.write("    amount_spent_inr = EXCLUDED.amount_spent_inr,\n")
                    out_f.write("    cmp_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,\n")
                    out_f.write("    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,\n")
                    out_f.write("    processed_at = CURRENT_TIMESTAMP;\n\n")
                    
                    out_f.write(f"-- Batch {(i+1)//batch_size + 1}\n")
                    out_f.write("INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name,\n")
                    out_f.write("                           amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter)\n")
                    out_f.write("VALUES\n")
            
            # Final conflict resolution
            out_f.write("ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name)\n")
            out_f.write("DO UPDATE SET\n")
            out_f.write("    amount_spent_inr = EXCLUDED.amount_spent_inr,\n")
            out_f.write("    cpm_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,\n")
            out_f.write("    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,\n")
            out_f.write("    processed_at = CURRENT_TIMESTAMP;\n")
    
    file_size = os.path.getsize(output_file)
    print(f"✅ Final production SQL file created: {output_file}")
    print(f"📊 Files processed: {files_processed}/{len(meta_files)}")
    print(f"📊 Total records: {total_records:,}")
    print(f"📊 File size: {file_size:,} bytes ({file_size/1024/1024:.1f} MB)")
    
    return output_file, total_records, files_processed

def process_record(record_lines):
    """Process multi-line record into a single formatted record"""
    try:
        # Join all lines and clean up
        full_record = ' '.join(record_lines)
        
        # Remove trailing comma or semicolon
        if full_record.endswith('),'):
            full_record = full_record[:-2] + ')'
        elif full_record.endswith(');'):
            full_record = full_record[:-2] + ')'
        elif full_record.endswith(','):
            full_record = full_record[:-1]
        elif full_record.endswith(';'):
            full_record = full_record[:-1]
        
        # Add ref_parameter if not already present
        if full_record.endswith(')'):
            full_record = full_record[:-1] + ", 'nbclorobfotxrpbmyapi')"
        
        return full_record
        
    except Exception as e:
        print(f"Error processing record: {e}")
        return None

if __name__ == "__main__":
    output_file, records, files = create_final_meta_sql_v3()
    print(f"\n🚀 Production file ready: {output_file}")
    print(f"🎯 Ready for database execution with {records:,} records")