#!/usr/bin/env python3
"""
Meta Data Upload via MCP Supabase Tools
======================================
Processes Meta CSV and uploads to Supabase using MCP integration
Optimized for speed and 100% data quality
"""

import pandas as pd
import sys
import time
from datetime import datetime

# Configuration
CSV_FILE_PATH = "/Users/shivangpatel/Downloads/yearly files/meta_combined_oct24_to_oct25_full.csv"
BATCH_SIZE = 1000  # Records per SQL batch
SUPABASE_REF = "nbclorobfotxrpbmyapi"

def clean_sql_value(value):
    """Clean and escape values for SQL"""
    if pd.isna(value) or value is None:
        return 'NULL'
    if isinstance(value, str):
        # Escape single quotes by doubling them
        escaped_value = value.replace("'", "''")
        return f"'{escaped_value}'"
    return str(value)

def generate_insert_sql(df_batch, batch_num):
    """Generate optimized SQL INSERT statement for a batch"""
    
    values_list = []
    for _, row in df_batch.iterrows():
        # Map CSV columns to database columns
        reporting_starts = clean_sql_value(row['Day'])
        campaign_name = clean_sql_value(row['Campaign name'])
        ad_set_name = clean_sql_value(row['Ad set name'])
        ad_name = clean_sql_value(row['Ad name'])
        amount_spent_inr = str(row['Amount spent (INR)']) if pd.notna(row['Amount spent (INR)']) else '0'
        cpm = str(row['CPM (cost per 1,000 impressions)']) if pd.notna(row['CPM (cost per 1,000 impressions)']) else '0'
        ctr = str(row['CTR (link click-through rate)']) if pd.notna(row['CTR (link click-through rate)']) else '0'
        
        # Create VALUES clause for this row
        values = f"({reporting_starts}, {campaign_name}, {ad_set_name}, {ad_name}, {amount_spent_inr}, {cpm}, {ctr}, 'nbclorobfotxrpbmyapi', CURRENT_TIMESTAMP)"
        values_list.append(values)
    
    # Combine into single INSERT statement with ON CONFLICT handling
    values_clause = ',\n    '.join(values_list)
    
    sql = f"""INSERT INTO meta_raw_data 
    (reporting_starts, campaign_name, ad_set_name, ad_name, amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter, processed_at)
VALUES 
    {values_clause}
ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name) 
DO UPDATE SET 
    amount_spent_inr = EXCLUDED.amount_spent_inr,
    cpm_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,
    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,
    processed_at = CURRENT_TIMESTAMP
RETURNING id;"""
    
    return sql

def process_meta_upload():
    """Main function to process and upload Meta data"""
    
    print("🚀 Meta Data Upload via MCP Supabase Tools")
    print("=" * 60)
    print("📈 Optimized for maximum speed and 100% data quality")
    print()
    
    # Load CSV data
    print(f"📁 Loading data from: {CSV_FILE_PATH}")
    try:
        df = pd.read_csv(CSV_FILE_PATH, encoding='utf-8-sig')
        total_records = len(df)
        print(f"📊 Loaded {total_records:,} records from CSV")
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        return False
    
    # Show sample data
    print("\n🔍 Sample data structure:")
    print("Columns:", df.columns.tolist())
    print("First row:", df.iloc[0].to_dict())
    
    # Calculate batches
    total_batches = (total_records + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"\n📦 Processing {total_batches} batches of ~{BATCH_SIZE} records each")
    
    # Generate SQL files for each batch
    print("\n⚡ Generating SQL batch files...")
    
    batch_files = []
    start_time = time.time()
    
    for i in range(total_batches):
        start_idx = i * BATCH_SIZE
        end_idx = min(start_idx + BATCH_SIZE, total_records)
        batch_df = df.iloc[start_idx:end_idx].copy()
        
        # Generate SQL for this batch
        sql = generate_insert_sql(batch_df, i + 1)
        
        # Save to file in current directory
        batch_file = f"meta_batch_{i+1:04d}.sql"
        with open(batch_file, 'w') as f:
            f.write(sql)
        
        batch_files.append(batch_file)
        
        if (i + 1) % 10 == 0:
            print(f"✅ Generated {i+1}/{total_batches} SQL files")
    
    end_time = time.time()
    print(f"🎯 Generated all {total_batches} SQL batch files in {end_time - start_time:.1f} seconds")
    
    # Print execution instructions
    print("\n" + "=" * 60)
    print("📋 EXECUTION READY!")
    print("=" * 60)
    print("🎯 Next Steps:")
    print("1. Use MCP SUPABASE_BETA_RUN_SQL_QUERY tool to execute each batch")
    print("2. Execute batches in parallel for maximum speed")
    print("3. Monitor progress and handle any conflicts")
    print()
    print("📁 SQL Files Location: ./meta_batch_*.sql")
    print(f"📊 Total Batches: {total_batches}")
    print(f"📈 Records per batch: ~{BATCH_SIZE}")
    print(f"🎯 Total records to upload: {total_records:,}")
    print()
    print("🚀 All SQL files generated successfully!")
    print("Ready for MCP execution!")
    
    return True

if __name__ == "__main__":
    success = process_meta_upload()
    sys.exit(0 if success else 1)