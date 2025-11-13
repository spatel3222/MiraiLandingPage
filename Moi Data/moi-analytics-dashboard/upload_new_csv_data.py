#!/usr/bin/env python3
"""
Script to upload new MOI CSV data (Meta_27_Oct.csv and Shopify_27_Oct.csv) with duplicate prevention
"""
import pandas as pd
import json
from datetime import datetime
import os

def process_meta_27_oct():
    """Process Meta_27_Oct.csv file"""
    file_path = "./Meta_27_Oct.csv"
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return []
    
    print(f"Processing Meta file: {file_path}")
    
    # Read CSV with proper encoding
    df = pd.read_csv(file_path, encoding='utf-8-sig')
    
    print(f"Columns: {list(df.columns)}")
    print(f"Rows: {len(df)}")
    
    meta_data_records = []
    
    for _, row in df.iterrows():
        # Extract date from "Reporting starts" field
        reporting_date = pd.to_datetime(row['Reporting starts']).date()
        
        record = {
            "reporting_starts": f"{row['Reporting starts']} 00:00:00",
            "campaign_name": str(row['Campaign name']),
            "ad_set_name": str(row['Ad set name']),
            "ad_name": str(row['Ad name']),
            "amount_spent_inr": float(row['Amount spent (INR)']),
            "cpm_cost_per_1000_impressions": float(row['CPM (cost per 1,000 impressions)']),
            "ctr_link_click_through_rate": float(row['CTR (link click-through rate)']),
            "source_file": file_path,
            "source_file_name": "Meta_27_Oct.csv",
            "date_range_start": reporting_date.isoformat(),
            "date_range_end": reporting_date.isoformat()
        }
        meta_data_records.append(record)
    
    print(f"Total Meta records prepared: {len(meta_data_records)}")
    return meta_data_records

def process_shopify_27_oct():
    """Process Shopify_27_Oct.csv file"""
    file_path = "./Shopify_27_Oct.csv"
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return []
    
    print(f"Processing Shopify file: {file_path}")
    
    # Read CSV
    df = pd.read_csv(file_path)
    
    print(f"Columns: {list(df.columns)}")
    print(f"Rows: {len(df)}")
    
    shopify_data_records = []
    
    for _, row in df.iterrows():
        # Extract date from "Day" field
        day_date = pd.to_datetime(row['Day']).date()
        
        record = {
            "day": day_date.isoformat(),
            "hour_or_day": str(row['Day']),
            "utm_campaign": str(row['UTM campaign']),
            "utm_term": str(row['UTM term']),
            "utm_content": str(row['UTM content']),
            "landing_page_url": str(row['Landing page URL']),
            "online_store_visitors": int(row['Online store visitors']),
            "sessions_completed_checkout": int(row['Sessions that completed checkout']),
            "sessions_reached_checkout": int(row['Sessions that reached checkout']),
            "sessions_with_cart_additions": int(row['Sessions with cart additions']),
            "average_session_duration": int(row['Average session duration']),
            "pageviews": int(row['Pageviews']),
            "source_file": file_path,
            "source_file_name": "Shopify_27_Oct.csv",
            "date_range_start": day_date.isoformat(),
            "date_range_end": day_date.isoformat()
        }
        shopify_data_records.append(record)
    
    print(f"Total Shopify records prepared: {len(shopify_data_records)}")
    return shopify_data_records

def main():
    """Main function to process new files"""
    print("=== Processing New MOI CSV Data ===\n")
    
    # Process both files
    meta_records = process_meta_27_oct()
    shopify_records = process_shopify_27_oct()
    
    # Save processed data to JSON files for upload
    with open('meta_27_oct_data.json', 'w') as f:
        json.dump(meta_records, f, indent=2, default=str)
    
    with open('shopify_27_oct_data.json', 'w') as f:
        json.dump(shopify_records, f, indent=2, default=str)
    
    print(f"\n=== Processing Summary ===")
    print(f"Meta_27_Oct records: {len(meta_records)}")
    print(f"Shopify_27_Oct records: {len(shopify_records)}")
    print(f"Total new records: {len(meta_records) + len(shopify_records)}")
    
    print("\nData files created:")
    print("- meta_27_oct_data.json")
    print("- shopify_27_oct_data.json")

if __name__ == "__main__":
    main()