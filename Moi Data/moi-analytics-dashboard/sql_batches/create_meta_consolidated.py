#!/usr/bin/env python3
"""
Create a consolidated Meta SQL file for database execution.
Combines all 691 processed Meta batch files into a single executable SQL file.
"""

import os
import glob
from pathlib import Path

def create_meta_consolidated():
    """Create consolidated Meta SQL file from all processed batch files."""
    
    # Configuration
    processed_dir = "processed_meta"
    output_file = "meta_consolidated_final.sql"
    ref_parameter = "nbclorobfotxrpbmyapi"
    
    print("🚀 Creating consolidated Meta SQL file...")
    print(f"📁 Source directory: {processed_dir}")
    print(f"📄 Output file: {output_file}")
    
    # Get all meta batch files
    batch_files = sorted(glob.glob(f"{processed_dir}/meta_batch_*.sql"))
    
    if not batch_files:
        print("❌ Error: No Meta batch files found in processed_meta directory")
        return False
    
    print(f"📊 Found {len(batch_files)} Meta batch files")
    
    # Start building consolidated SQL
    sql_content = []
    
    # Add header comment
    sql_content.append("-- MOI Analytics Dashboard - Meta Data Consolidated Import")
    sql_content.append("-- Generated: November 2, 2024")
    sql_content.append(f"-- Total Files: {len(batch_files)}")
    sql_content.append("-- Estimated Records: ~34,550")
    sql_content.append(f"-- Ref Parameter: {ref_parameter}")
    sql_content.append("-- Processing: All 691 Meta advertising campaign batch files")
    sql_content.append("")
    
    # Add table creation (if not exists)
    sql_content.append("-- Create Meta raw data table if it doesn't exist")
    sql_content.append("CREATE TABLE IF NOT EXISTS meta_raw_data (")
    sql_content.append("    id SERIAL PRIMARY KEY,")
    sql_content.append("    reporting_starts DATE,")
    sql_content.append("    campaign_name TEXT,")
    sql_content.append("    ad_set_name TEXT,")
    sql_content.append("    ad_name TEXT,")
    sql_content.append("    amount_spent_inr DECIMAL(10,2),")
    sql_content.append("    cpm_cost_per_1000_impressions DECIMAL(10,8),")
    sql_content.append("    ctr_link_click_through_rate DECIMAL(10,8),")
    sql_content.append(f"    ref_parameter TEXT DEFAULT '{ref_parameter}',")
    sql_content.append("    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,")
    sql_content.append("    UNIQUE(reporting_starts, campaign_name, ad_set_name, ad_name)")
    sql_content.append(");")
    sql_content.append("")
    
    # Add indexes for performance
    sql_content.append("-- Create indexes for optimal query performance")
    sql_content.append("CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);")
    sql_content.append("CREATE INDEX IF NOT EXISTS idx_meta_campaign_name ON meta_raw_data(campaign_name);")
    sql_content.append("CREATE INDEX IF NOT EXISTS idx_meta_ref_parameter ON meta_raw_data(ref_parameter);")
    sql_content.append("CREATE INDEX IF NOT EXISTS idx_meta_processed_at ON meta_raw_data(processed_at);")
    sql_content.append("")
    
    # Process each batch file
    total_insert_count = 0
    
    print("📋 Processing batch files...")
    
    for i, batch_file in enumerate(batch_files):
        try:
            with open(batch_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract the entire INSERT statement with all VALUES
            if 'INSERT INTO meta_raw_data' in content:
                # Clean the content and get the full INSERT statement
                insert_statement = content.strip()
                
                # Count the number of VALUES entries by counting occurrences of date patterns
                import re
                value_matches = re.findall(r"\('2024-\d{2}-\d{2}'", content)
                insert_count = len(value_matches)
                
                # Add ref parameter if not present
                if 'ref_parameter' not in insert_statement:
                    # Replace the VALUES section to add ref_parameter
                    insert_statement = re.sub(
                        r'INSERT INTO meta_raw_data \([^)]+\)',
                        f'INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name, amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter)',
                        insert_statement
                    )
                    
                    # Add ref_parameter value to each VALUES entry
                    insert_statement = re.sub(
                        r"(\([^)]*\d+\.\d+[^)]*\)),",
                        rf"\1, '{ref_parameter}'),",
                        insert_statement
                    )
                    # Handle the last value (without comma)
                    insert_statement = re.sub(
                        r"(\([^)]*\d+\.\d+[^)]*\));",
                        rf"\1, '{ref_parameter}');",
                        insert_statement
                    )
                
                # Add ON CONFLICT clause if not present
                if 'ON CONFLICT' not in insert_statement:
                    insert_statement = insert_statement.rstrip(';')
                    insert_statement += f"""
ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name) 
DO UPDATE SET 
    amount_spent_inr = EXCLUDED.amount_spent_inr,
    cpm_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,
    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,
    ref_parameter = EXCLUDED.ref_parameter,
    processed_at = CURRENT_TIMESTAMP;"""
                
                insert_lines = [insert_statement]
            
            if insert_lines:
                sql_content.append(f"-- Batch file: {os.path.basename(batch_file)} ({insert_count} records)")
                sql_content.extend(insert_lines)
                sql_content.append("")
                total_insert_count += insert_count
            
            # Progress indicator
            if (i + 1) % 100 == 0 or (i + 1) == len(batch_files):
                print(f"✅ Processed {i + 1}/{len(batch_files)} files... ({insert_count} records from this file)")
        
        except Exception as e:
            print(f"⚠️  Warning: Error processing {batch_file}: {e}")
            continue
    
    # Add verification queries at the end
    sql_content.append("-- Verification queries")
    sql_content.append("-- Check total records with ref parameter")
    sql_content.append(f"-- SELECT COUNT(*) as total_meta_records FROM meta_raw_data WHERE ref_parameter = '{ref_parameter}';")
    sql_content.append("")
    sql_content.append("-- Check campaign summary")
    sql_content.append(f"-- SELECT campaign_name, COUNT(*) as records, SUM(amount_spent_inr) as total_spend")
    sql_content.append(f"-- FROM meta_raw_data WHERE ref_parameter = '{ref_parameter}'")
    sql_content.append("-- GROUP BY campaign_name ORDER BY total_spend DESC;")
    sql_content.append("")
    
    # Write consolidated file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_content))
        
        file_size = os.path.getsize(output_file)
        print(f"\n🎉 SUCCESS: Consolidated Meta SQL file created!")
        print(f"📄 File: {output_file}")
        print(f"📊 Size: {file_size:,} bytes ({file_size/1024/1024:.2f} MB)")
        print(f"🎯 Records: ~{total_insert_count:,} INSERT statements")
        print(f"📁 Source files: {len(batch_files)} batch files")
        
        return True
        
    except Exception as e:
        print(f"❌ Error writing consolidated file: {e}")
        return False

if __name__ == "__main__":
    success = create_meta_consolidated()
    if success:
        print("\n✅ Meta consolidated SQL file ready for database execution!")
        print("📋 Next steps:")
        print("   1. Execute meta_consolidated_final.sql in your PostgreSQL database")
        print("   2. Run verification queries to confirm data integrity")
        print("   3. Proceed with Shopify data execution")
    else:
        print("\n❌ Failed to create Meta consolidated SQL file")