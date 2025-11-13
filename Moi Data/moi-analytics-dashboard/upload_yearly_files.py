#!/usr/bin/env python3
"""
Script to upload yearly MOI CSV data with progress tracking
"""
import pandas as pd
import json
from datetime import datetime
import os
import time

def show_progress_bar(current, total, prefix="Progress", suffix="Complete", length=50):
    """Display a progress bar"""
    percent = (current / total) * 100
    filled_length = int(length * current // total)
    bar = '█' * filled_length + '░' * (length - filled_length)
    print(f'\r{prefix}: [{bar}] {percent:.1f}% {suffix}', end='', flush=True)

def process_google_yearly():
    """Process Google yearly file"""
    file_path = "./Google_yearly_oct24_oct25.csv"
    
    print("\n📈 PROCESSING GOOGLE YEARLY FILE")
    print("=" * 50)
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return []
    
    print(f"📖 Reading: {file_path}")
    
    # Read file headers
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    filename = lines[0].strip()
    date_range = lines[1].strip().replace('"', '')
    print(f"📄 Source: {filename}")
    print(f"📅 Range: {date_range}")
    
    # Read CSV data
    df = pd.read_csv(file_path, skiprows=2)
    total_records = len(df)
    
    print(f"📊 Total records: {total_records}")
    
    records = []
    print("🔄 Processing records...")
    
    for i, (_, row) in enumerate(df.iterrows()):
        show_progress_bar(i + 1, total_records, "Processing")
        
        record = {
            "day": str(row['Day']),
            "campaign": str(row['Campaign']),
            "cost": float(row['Cost']) if pd.notna(row['Cost']) else 0.0,
            "source_file": file_path,
            "source_file_name": "Google_1st Oct 24 to 26th Oct 25.csv",
            "date_range_start": "2024-10-01",
            "date_range_end": "2025-10-26"
        }
        records.append(record)
    
    print(f"\n✅ Google processing complete: {len(records)} records")
    return records

def process_meta_yearly():
    """Process Meta yearly file"""
    file_path = "./Meta_yearly_oct24_oct25.csv"
    
    print("\n📱 PROCESSING META YEARLY FILE")
    print("=" * 50)
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return []
    
    print(f"📖 Reading: {file_path}")
    
    # Read CSV data
    df = pd.read_csv(file_path, encoding='utf-8-sig')
    total_records = len(df)
    
    print(f"📊 Total records: {total_records}")
    
    records = []
    print("🔄 Processing records...")
    
    for i, (_, row) in enumerate(df.iterrows()):
        if i % 1000 == 0:  # Update progress every 1000 records
            show_progress_bar(i + 1, total_records, "Processing")
        
        record = {
            "reporting_starts": f"{row['Day']} 00:00:00",
            "campaign_name": str(row['Campaign name']),
            "ad_set_name": str(row['Ad set name']),
            "ad_name": str(row['Ad name']),
            "amount_spent_inr": float(row['Amount spent (INR)']),
            "cpm_cost_per_1000_impressions": float(row['CPM (cost per 1,000 impressions)']),
            "ctr_link_click_through_rate": float(row['CTR (link click-through rate)']),
            "source_file": file_path,
            "source_file_name": "meta_combined_oct24_to_oct25_full.csv",
            "date_range_start": str(row['Day']),
            "date_range_end": str(row['Day'])
        }
        records.append(record)
    
    show_progress_bar(total_records, total_records, "Processing")
    print(f"\n✅ Meta processing complete: {len(records)} records")
    return records

def process_shopify_yearly():
    """Process Shopify yearly file (sample only due to size)"""
    file_path = "./Shopify_yearly_oct24_oct25.csv"
    
    print("\n🛒 PROCESSING SHOPIFY YEARLY FILE")
    print("=" * 50)
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return []
    
    print(f"📖 Reading: {file_path}")
    print("⚠️  Processing sample of large dataset...")
    
    # Read only first 10000 records due to massive size
    df = pd.read_csv(file_path, nrows=10000)
    total_records = len(df)
    
    print(f"📊 Sample records: {total_records} (of ~3.3M total)")
    
    records = []
    print("🔄 Processing records...")
    
    for i, (_, row) in enumerate(df.iterrows()):
        if i % 500 == 0:  # Update progress every 500 records
            show_progress_bar(i + 1, total_records, "Processing")
        
        record = {
            "day": str(row['Day']),
            "hour_or_day": str(row['Day']),
            "utm_campaign": str(row['UTM campaign']),
            "utm_term": str(row['UTM term']),
            "utm_content": str(row['UTM content']),
            "landing_page_url": str(row['Landing page URL'])[:500],  # Truncate long URLs
            "online_store_visitors": int(row['Online store visitors']),
            "sessions_completed_checkout": int(row['Sessions that completed checkout']),
            "sessions_reached_checkout": int(row['Sessions that reached checkout']),
            "sessions_with_cart_additions": int(row['Sessions with cart additions']),
            "average_session_duration": int(row['Average session duration']),
            "pageviews": int(row['Pageviews']),
            "source_file": file_path,
            "source_file_name": "Shopify_1st Oct 24 to 26th Oct 25.csv",
            "date_range_start": str(row['Day']),
            "date_range_end": str(row['Day'])
        }
        records.append(record)
    
    show_progress_bar(total_records, total_records, "Processing")
    print(f"\n✅ Shopify processing complete: {len(records)} records (sample)")
    return records

def main():
    """Main processing function"""
    print("🚀 YEARLY FILES PROCESSING")
    print("=" * 60)
    
    # Process all files
    google_records = process_google_yearly()
    meta_records = process_meta_yearly() 
    shopify_records = process_shopify_yearly()
    
    # Save to JSON files
    with open('google_yearly_data.json', 'w') as f:
        json.dump(google_records, f, indent=2, default=str)
    
    with open('meta_yearly_data.json', 'w') as f:
        json.dump(meta_records, f, indent=2, default=str)
    
    with open('shopify_yearly_data.json', 'w') as f:
        json.dump(shopify_records, f, indent=2, default=str)
    
    print(f"\n📊 PROCESSING SUMMARY")
    print("=" * 40)
    print(f"📈 Google records: {len(google_records):,}")
    print(f"📱 Meta records: {len(meta_records):,}")
    print(f"🛒 Shopify records: {len(shopify_records):,}")
    print(f"📁 Total processed: {len(google_records) + len(meta_records) + len(shopify_records):,}")
    
    print(f"\n📄 Output files created:")
    print("• google_yearly_data.json")
    print("• meta_yearly_data.json")
    print("• shopify_yearly_data.json")

if __name__ == "__main__":
    main()