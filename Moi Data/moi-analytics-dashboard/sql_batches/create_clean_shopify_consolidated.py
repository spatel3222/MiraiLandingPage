#!/usr/bin/env python3
"""
Clean Shopify Batch Consolidator
Creates a properly formatted consolidated SQL file with all Shopify batch data
"""

import os
from datetime import datetime

def create_consolidated_sql():
    base_dir = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches"
    ref_param = "nbclorobfotxrpbmyapi"
    
    # Output file
    output_file = f"{base_dir}/shopify_consolidated_final.sql"
    
    print("🚀 Creating Clean Shopify Consolidated SQL...")
    
    with open(output_file, 'w') as outfile:
        # Write header
        outfile.write("-- Shopify Session Data - Consolidated Batch Insert\n")
        outfile.write(f"-- Generated: {datetime.now().isoformat()}\n")
        outfile.write(f"-- Total Files: 20 (shopify_sample_batch_0000.sql to shopify_sample_batch_0019.sql)\n")
        outfile.write(f"-- Total Records: 1000 (50 records per file)\n")
        outfile.write(f"-- Ref Parameter: {ref_param}\n")
        outfile.write("-- " + "="*60 + "\n\n")
        
        # Create table
        outfile.write("-- Create Shopify Raw Data Table\n")
        outfile.write("CREATE TABLE IF NOT EXISTS shopify_raw_data (\n")
        outfile.write("    id SERIAL PRIMARY KEY,\n")
        outfile.write("    day DATE NOT NULL,\n")
        outfile.write("    utm_campaign TEXT,\n")
        outfile.write("    utm_term TEXT,\n")
        outfile.write("    utm_content TEXT,\n")
        outfile.write("    landing_page_url TEXT,\n")
        outfile.write("    online_store_visitors INTEGER DEFAULT 0,\n")
        outfile.write("    sessions_completed_checkout INTEGER DEFAULT 0,\n")
        outfile.write("    sessions_reached_checkout INTEGER DEFAULT 0,\n")
        outfile.write("    sessions_with_cart_additions INTEGER DEFAULT 0,\n")
        outfile.write("    average_session_duration INTEGER DEFAULT 0,\n")
        outfile.write("    pageviews INTEGER DEFAULT 0,\n")
        outfile.write(f"    ref_parameter TEXT DEFAULT '{ref_param}',\n")
        outfile.write("    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n")
        outfile.write(");\n\n")
        
        # Create indexes
        outfile.write("-- Create indexes for performance\n")
        outfile.write("CREATE INDEX IF NOT EXISTS idx_shopify_day ON shopify_raw_data(day);\n")
        outfile.write("CREATE INDEX IF NOT EXISTS idx_shopify_campaign ON shopify_raw_data(utm_campaign);\n")
        outfile.write("CREATE INDEX IF NOT EXISTS idx_shopify_ref_param ON shopify_raw_data(ref_parameter);\n\n")
        
        # Optional cleanup
        outfile.write("-- Optional: Clear existing data for this ref parameter\n")
        outfile.write(f"-- DELETE FROM shopify_raw_data WHERE ref_parameter = '{ref_param}';\n\n")
        
        total_records = 0
        
        # Process each batch file
        for i in range(20):
            batch_file = f"{base_dir}/shopify_sample_batch_{i:04d}.sql"
            
            if os.path.exists(batch_file):
                print(f"📄 Processing {os.path.basename(batch_file)}")
                
                with open(batch_file, 'r') as infile:
                    content = infile.read()
                    
                    # Count records
                    file_records = content.count("('2024-")
                    total_records += file_records
                    
                    # Write batch header
                    outfile.write(f"-- Batch {i:02d}: {os.path.basename(batch_file)} ({file_records} records)\n")
                    outfile.write(content)
                    outfile.write("\n")
        
        # Write footer
        outfile.write(f"\n-- Consolidation Complete\n")
        outfile.write(f"-- Total Records Inserted: {total_records}\n")
        outfile.write(f"-- Ref Parameter: {ref_param}\n")
    
    file_size = os.path.getsize(output_file)
    print(f"\n✅ Consolidated SQL file created: {os.path.basename(output_file)}")
    print(f"📊 Total Records: {total_records}")
    print(f"💾 File Size: {file_size / 1024:.1f} KB")
    
    return output_file, total_records

if __name__ == "__main__":
    output_file, total_records = create_consolidated_sql()
    print(f"\n🎯 Execute this file in your PostgreSQL database to insert {total_records} Shopify session records")
    print(f"📄 File: {os.path.basename(output_file)}")