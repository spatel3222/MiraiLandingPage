#!/usr/bin/env python3
"""
Create a properly formatted consolidated Meta SQL file for database execution.
Fixes syntax issues and ensures accurate record counting.
"""

import os
import glob
import re
from pathlib import Path

def create_meta_consolidated_fixed():
    """Create a properly formatted consolidated Meta SQL file."""
    
    # Configuration
    processed_dir = "processed_meta"
    output_file = "meta_consolidated_final_fixed.sql"
    ref_parameter = "nbclorobfotxrpbmyapi"
    
    print("🔧 Creating FIXED consolidated Meta SQL file...")
    print(f"📁 Source directory: {processed_dir}")
    print(f"📄 Output file: {output_file}")
    
    # Get all meta batch files in correct order
    batch_files = sorted(glob.glob(f"{processed_dir}/meta_batch_*.sql"))
    
    if not batch_files:
        print("❌ Error: No Meta batch files found in processed_meta directory")
        return False
    
    print(f"📊 Found {len(batch_files)} Meta batch files")
    
    # Start building consolidated SQL
    sql_lines = []
    
    # Add header comment
    sql_lines.extend([
        "-- MOI Analytics Dashboard - Meta Data Consolidated Import (FIXED)",
        "-- Generated: November 2, 2024",
        f"-- Total Files: {len(batch_files)}",
        "-- Expected Records: ~34,550 (50 records per file)",
        f"-- Ref Parameter: {ref_parameter}",
        "-- Processing: All 691 Meta advertising campaign batch files",
        "",
        "-- Create Meta raw data table if it doesn't exist",
        "CREATE TABLE IF NOT EXISTS meta_raw_data (",
        "    id SERIAL PRIMARY KEY,",
        "    reporting_starts DATE,",
        "    campaign_name TEXT,",
        "    ad_set_name TEXT,",
        "    ad_name TEXT,",
        "    amount_spent_inr DECIMAL(10,2),",
        "    cpm_cost_per_1000_impressions DECIMAL(10,8),",
        "    ctr_link_click_through_rate DECIMAL(10,8),",
        f"    ref_parameter TEXT DEFAULT '{ref_parameter}',",
        "    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,",
        "    UNIQUE(reporting_starts, campaign_name, ad_set_name, ad_name)",
        ");",
        "",
        "-- Create indexes for optimal query performance",
        "CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);",
        "CREATE INDEX IF NOT EXISTS idx_meta_campaign_name ON meta_raw_data(campaign_name);",
        "CREATE INDEX IF NOT EXISTS idx_meta_ref_parameter ON meta_raw_data(ref_parameter);",
        "CREATE INDEX IF NOT EXISTS idx_meta_processed_at ON meta_raw_data(processed_at);",
        "",
        "-- Begin data insertion",
        ""
    ])
    
    # Process each batch file
    total_records_processed = 0
    batch_count = 0
    
    print("📋 Processing batch files...")
    
    for batch_file in batch_files:
        try:
            with open(batch_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            # Extract the INSERT statement and VALUES
            if 'INSERT INTO meta_raw_data' in content:
                # Parse the original INSERT statement
                lines = content.split('\n')
                
                # Find VALUES section
                values_lines = []
                in_values = False
                record_count = 0
                
                for line in lines:
                    line = line.strip()
                    if line.startswith('VALUES'):
                        in_values = True
                        continue
                    elif in_values and line:
                        # This is a VALUES line
                        if line.startswith("('2024-"):
                            # Count this record
                            record_count += 1
                            # Add ref_parameter to the values
                            if line.endswith(','):
                                # Not the last record
                                line = line.rstrip(',') + f", '{ref_parameter}'),"
                            else:
                                # Last record, might end with ; or )
                                line = line.rstrip(');') + f", '{ref_parameter}'"
                            values_lines.append(line)
                        elif line and not line.startswith('--'):
                            # Continuation of a multi-line value
                            values_lines.append(line)
                
                if values_lines:
                    # Create proper INSERT statement
                    insert_statement = f"""-- Batch file: {os.path.basename(batch_file)} ({record_count} records)
INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name, 
                           amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter) 
VALUES"""
                    
                    sql_lines.append(insert_statement)
                    
                    # Add all values lines
                    for i, values_line in enumerate(values_lines):
                        if i == len(values_lines) - 1:
                            # Last line - ensure it ends properly
                            if not values_line.endswith(';'):
                                values_line += ';'
                        sql_lines.append("    " + values_line)
                    
                    # Add conflict resolution
                    conflict_clause = """ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name) 
DO UPDATE SET 
    amount_spent_inr = EXCLUDED.amount_spent_inr,
    cpm_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,
    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,
    ref_parameter = EXCLUDED.ref_parameter,
    processed_at = CURRENT_TIMESTAMP;"""
                    
                    # Remove the semicolon from the last VALUES line and add conflict clause
                    if sql_lines[-1].endswith(';'):
                        sql_lines[-1] = sql_lines[-1].rstrip(';')
                    
                    sql_lines.extend(["", conflict_clause, ""])
                    
                    total_records_processed += record_count
                    batch_count += 1
            
            # Progress indicator
            if batch_count % 100 == 0 or batch_count == len(batch_files):
                print(f"✅ Processed {batch_count}/{len(batch_files)} files... (Total records: {total_records_processed:,})")
        
        except Exception as e:
            print(f"⚠️  Warning: Error processing {batch_file}: {e}")
            continue
    
    # Add verification queries at the end
    sql_lines.extend([
        "-- Data verification queries",
        f"-- SELECT COUNT(*) as total_meta_records FROM meta_raw_data WHERE ref_parameter = '{ref_parameter}';",
        "-- Expected count: ~34,550 records",
        "",
        "-- Campaign performance summary",
        f"-- SELECT campaign_name, COUNT(*) as records, SUM(amount_spent_inr) as total_spend",
        f"-- FROM meta_raw_data WHERE ref_parameter = '{ref_parameter}'",
        "-- GROUP BY campaign_name ORDER BY total_spend DESC LIMIT 10;",
        "",
        "-- Processing completion timestamp",
        f"-- SELECT 'Meta data ingestion completed at: ' || CURRENT_TIMESTAMP as completion_status;",
        ""
    ])
    
    # Write consolidated file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_lines))
        
        file_size = os.path.getsize(output_file)
        print(f"\n🎉 SUCCESS: FIXED consolidated Meta SQL file created!")
        print(f"📄 File: {output_file}")
        print(f"📊 Size: {file_size:,} bytes ({file_size/1024/1024:.2f} MB)")
        print(f"🎯 Records: {total_records_processed:,} records processed")
        print(f"📁 Source files: {batch_count} batch files processed")
        print(f"📈 Expected vs Actual: {len(batch_files) * 50:,} expected, {total_records_processed:,} processed")
        
        return True
        
    except Exception as e:
        print(f"❌ Error writing consolidated file: {e}")
        return False

if __name__ == "__main__":
    success = create_meta_consolidated_fixed()
    if success:
        print("\n✅ FIXED Meta consolidated SQL file ready for database execution!")
        print("📋 Next steps:")
        print("   1. Execute meta_consolidated_final_fixed.sql in your PostgreSQL database")
        print("   2. Run verification queries to confirm data integrity")
        print("   3. Proceed with Shopify data execution")
    else:
        print("\n❌ Failed to create FIXED Meta consolidated SQL file")