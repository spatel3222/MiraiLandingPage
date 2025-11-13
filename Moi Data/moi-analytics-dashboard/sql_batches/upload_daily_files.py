#!/usr/bin/env python3
"""
🚀 DAILY FILES BULK UPLOADER
Upload all CSV files from daily files folder to respective Supabase tables
"""

import pandas as pd
import json
import os
import sys
from pathlib import Path

# Configuration
DAILY_FILES_PATH = "/Users/shivangpatel/Downloads/daily files"
SUPABASE_REF = "nbclorobfotxrpbmyapi"
BATCH_SIZE = 500

def escape_sql_value(value):
    """Escape SQL values safely"""
    if pd.isna(value) or value is None:
        return ''
    return str(value).replace("'", "''").replace("\\", "\\\\")

def process_shopify_file(filepath):
    """Process Shopify CSV file and create SQL insert statements"""
    print(f"📊 Processing Shopify file: {os.path.basename(filepath)}")
    
    df = pd.read_csv(filepath)
    print(f"   • Records: {len(df):,}")
    
    # Process in batches
    sql_statements = []
    for i in range(0, len(df), BATCH_SIZE):
        batch_df = df.iloc[i:i + BATCH_SIZE]
        values = []
        
        for _, row in batch_df.iterrows():
            try:
                day_val = f"'{row['Day']}'" if pd.notna(row['Day']) else 'NULL'
                utm_campaign = escape_sql_value(row['UTM campaign'])
                utm_term = escape_sql_value(row['UTM term'])
                utm_content = escape_sql_value(row['UTM content'])
                landing_page = escape_sql_value(row['Landing page URL'])
                
                visitors = int(float(row['Online store visitors'])) if pd.notna(row['Online store visitors']) else 0
                completed = int(float(row['Sessions that completed checkout'])) if pd.notna(row['Sessions that completed checkout']) else 0
                reached = int(float(row['Sessions that reached checkout'])) if pd.notna(row['Sessions that reached checkout']) else 0
                cart_adds = int(float(row['Sessions with cart additions'])) if pd.notna(row['Sessions with cart additions']) else 0
                duration = float(row['Average session duration']) if pd.notna(row['Average session duration']) else 0.0
                pageviews = int(float(row['Pageviews'])) if pd.notna(row['Pageviews']) else 0
                
                value_str = f"(gen_random_uuid(), {day_val}, '{utm_campaign}', '{utm_term}', '{utm_content}', '{landing_page}', {visitors}, {completed}, {reached}, {cart_adds}, {duration}, {pageviews})"
                values.append(value_str)
                
            except Exception as e:
                print(f"   ⚠️ Row error: {e}")
                continue
        
        if values:
            sql = f"""INSERT INTO shopify_raw_data (id, day, utm_campaign, utm_term, utm_content, landing_page_url, online_store_visitors, sessions_completed_checkout, sessions_reached_checkout, sessions_with_cart_additions, average_session_duration, pageviews) VALUES {', '.join(values)};"""
            sql_statements.append(sql)
    
    return sql_statements, len(df)

def process_meta_file(filepath):
    """Process Meta CSV file and create SQL insert statements"""
    print(f"📱 Processing Meta file: {os.path.basename(filepath)}")
    
    df = pd.read_csv(filepath)
    print(f"   • Records: {len(df):,}")
    
    # Process in batches
    sql_statements = []
    for i in range(0, len(df), BATCH_SIZE):
        batch_df = df.iloc[i:i + BATCH_SIZE]
        values = []
        
        for _, row in batch_df.iterrows():
            try:
                # Map CSV columns to database columns
                reporting_starts = f"'{row['Day']}'" if pd.notna(row['Day']) else 'NULL'
                campaign_name = escape_sql_value(row['Campaign name'])
                ad_set_name = escape_sql_value(row['Ad set name'])
                ad_name = escape_sql_value(row['Ad name'])
                amount_spent = float(row['Amount spent (INR)']) if pd.notna(row['Amount spent (INR)']) else 0.0
                cpm = float(row['CPM (cost per 1,000 impressions)']) if pd.notna(row['CPM (cost per 1,000 impressions)']) else 0.0
                ctr = float(row['CTR (link click-through rate)']) if pd.notna(row['CTR (link click-through rate)']) else 0.0
                
                # Generate filename as ref_parameter
                filename = os.path.basename(filepath)
                
                value_str = f"({reporting_starts}, '{campaign_name}', '{ad_set_name}', '{ad_name}', {amount_spent}, {cpm}, {ctr}, '{filename}', NOW())"
                values.append(value_str)
                
            except Exception as e:
                print(f"   ⚠️ Row error: {e}")
                continue
        
        if values:
            sql = f"""INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name, amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter, processed_at) VALUES {', '.join(values)};"""
            sql_statements.append(sql)
    
    return sql_statements, len(df)

def process_google_file(filepath):
    """Process Google CSV file and create SQL insert statements"""
    print(f"🔍 Processing Google file: {os.path.basename(filepath)}")
    
    # Read CSV, skipping first 2 lines (headers)
    df = pd.read_csv(filepath, skiprows=2)
    print(f"   • Records: {len(df):,}")
    
    # Process in batches  
    sql_statements = []
    for i in range(0, len(df), BATCH_SIZE):
        batch_df = df.iloc[i:i + BATCH_SIZE]
        values = []
        
        for _, row in batch_df.iterrows():
            try:
                day_val = f"'{row['Day']}'" if pd.notna(row['Day']) else 'NULL'
                campaign = escape_sql_value(row['Campaign'])
                cost = float(row['Cost']) if pd.notna(row['Cost']) else 0.0
                
                # Generate filename info
                filename = os.path.basename(filepath)
                
                value_str = f"(gen_random_uuid(), {day_val}, '{campaign}', {cost}, '{filename}', NOW(), NOW(), {day_val}, {day_val}, '{filename}')"
                values.append(value_str)
                
            except Exception as e:
                print(f"   ⚠️ Row error: {e}")
                continue
        
        if values:
            sql = f"""INSERT INTO google_raw_data (id, day, campaign, cost, source_file, inserted_at, upload_date, date_range_start, date_range_end, source_file_name) VALUES {', '.join(values)};"""
            sql_statements.append(sql)
    
    return sql_statements, len(df)

def main():
    print("🚀 DAILY FILES BULK UPLOADER")
    print("=" * 60)
    
    if not os.path.exists(DAILY_FILES_PATH):
        print(f"❌ Directory not found: {DAILY_FILES_PATH}")
        return
    
    # Get all CSV files
    csv_files = [f for f in os.listdir(DAILY_FILES_PATH) if f.endswith('.csv')]
    print(f"📁 Found {len(csv_files)} CSV files")
    
    total_records = 0
    total_sql_statements = 0
    
    for filename in csv_files:
        filepath = os.path.join(DAILY_FILES_PATH, filename)
        
        try:
            if 'Shopify' in filename:
                sql_statements, record_count = process_shopify_file(filepath)
            elif 'Meta' in filename:
                sql_statements, record_count = process_meta_file(filepath)
            elif 'Google' in filename:
                sql_statements, record_count = process_google_file(filepath)
            else:
                print(f"❓ Unknown file type: {filename}")
                continue
            
            total_records += record_count
            total_sql_statements += len(sql_statements)
            
            print(f"   ✅ Generated {len(sql_statements)} SQL batches for {record_count:,} records")
            
            # Save SQL statements to files for manual execution
            sql_output_dir = f"/tmp/daily_upload_sql"
            os.makedirs(sql_output_dir, exist_ok=True)
            
            base_name = filename.replace('.csv', '')
            for i, sql in enumerate(sql_statements):
                sql_file = f"{sql_output_dir}/{base_name}_batch_{i:03d}.sql"
                with open(sql_file, 'w') as f:
                    f.write(sql)
            
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 SUMMARY:")
    print(f"   • Total files processed: {len(csv_files)}")
    print(f"   • Total records: {total_records:,}")
    print(f"   • Total SQL batches: {total_sql_statements}")
    print(f"   • SQL files saved to: /tmp/daily_upload_sql/")
    print("🎯 Ready for upload via MCP!")

if __name__ == "__main__":
    main()