#!/usr/bin/env python3
"""
Script to upload MOI CSV data to Supabase tables
"""
import pandas as pd
import json
from datetime import datetime
import re
import os

def process_google_files():
    """Process Google CSV files and prepare data for upload"""
    google_files = [
        "./Google_27th_Sept.csv",
        "./Google_29th_Sept.csv"
    ]
    
    print("Processing Google CSV files...")
    google_data_records = []
    
    for file_path in google_files:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        print(f"Processing: {file_path}")
        
        # Read the CSV file
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        # Extract filename and date range from first two rows
        filename = lines[0].strip()
        date_range = lines[1].strip().replace('"', '')
        
        print(f"Filename: {filename}")
        print(f"Date range: {date_range}")
        
        # Parse date range
        date_match = re.search(r'(\w+ \d+, \d+) - (\w+ \d+, \d+)', date_range)
        if date_match:
            start_date_str = date_match.group(1)
            end_date_str = date_match.group(2)
            
            # Convert to dates
            start_date = datetime.strptime(start_date_str, '%B %d, %Y').date()
            end_date = datetime.strptime(end_date_str, '%B %d, %Y').date()
            
            print(f"Start date: {start_date}")
            print(f"End date: {end_date}")
        
        # Read the actual data starting from row 3 (index 2)
        df = pd.read_csv(file_path, skiprows=2)
        
        print(f"Columns: {list(df.columns)}")
        print(f"Rows: {len(df)}")
        
        # Process each row for Google table
        for _, row in df.iterrows():
            record = {
                "day": row['Day'],
                "campaign": row['Campaign'],
                "cost": float(row['Cost']),
                "source_file": file_path,
                "source_file_name": filename,
                "date_range_start": start_date.isoformat(),
                "date_range_end": end_date.isoformat()
            }
            google_data_records.append(record)
    
    print(f"\nTotal Google records prepared: {len(google_data_records)}")
    return google_data_records

def process_meta_file():
    """Process Meta CSV file and prepare data for upload"""
    file_path = "./Meta_28_Oct.csv"
    
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
            "reporting_starts": row['Reporting starts'],
            "campaign_name": row['Campaign name'],
            "ad_set_name": row['Ad set name'],
            "ad_name": row['Ad name'],
            "amount_spent_inr": float(row['Amount spent (INR)']),
            "cpm_cost_per_1000_impressions": float(row['CPM (cost per 1,000 impressions)']),
            "ctr_link_click_through_rate": float(row['CTR (link click-through rate)']),
            "source_file": file_path,
            "source_file_name": "Meta_28_Oct.csv",
            "date_range_start": reporting_date.isoformat(),
            "date_range_end": reporting_date.isoformat()
        }
        meta_data_records.append(record)
    
    print(f"Total Meta records prepared: {len(meta_data_records)}")
    return meta_data_records

def process_shopify_file():
    """Process Shopify CSV file and prepare data for upload"""
    file_path = "./Shopify_28_Oct.csv"
    
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
            "hour_or_day": row['Day'],
            "utm_campaign": row['UTM campaign'],
            "utm_term": row['UTM term'],
            "utm_content": row['UTM content'],
            "landing_page_url": row['Landing page URL'],
            "online_store_visitors": int(row['Online store visitors']),
            "sessions_completed_checkout": int(row['Sessions that completed checkout']),
            "sessions_reached_checkout": int(row['Sessions that reached checkout']),
            "sessions_with_cart_additions": int(row['Sessions with cart additions']),
            "average_session_duration": int(row['Average session duration']),
            "pageviews": int(row['Pageviews']),
            "source_file": file_path,
            "source_file_name": "Shopify_28_Oct.csv",
            "date_range_start": day_date.isoformat(),
            "date_range_end": day_date.isoformat()
        }
        shopify_data_records.append(record)
    
    print(f"Total Shopify records prepared: {len(shopify_data_records)}")
    return shopify_data_records

def main():
    """Main function to process all files"""
    print("=== MOI CSV Data Processing ===\n")
    
    # Process all files
    google_records = process_google_files()
    meta_records = process_meta_file()
    shopify_records = process_shopify_file()
    
    # Save processed data to JSON files for upload
    with open('google_data.json', 'w') as f:
        json.dump(google_records, f, indent=2, default=str)
    
    with open('meta_data.json', 'w') as f:
        json.dump(meta_records, f, indent=2, default=str)
    
    with open('shopify_data.json', 'w') as f:
        json.dump(shopify_records, f, indent=2, default=str)
    
    print(f"\n=== Summary ===")
    print(f"Google records: {len(google_records)}")
    print(f"Meta records: {len(meta_records)}")
    print(f"Shopify records: {len(shopify_records)}")
    print(f"Total records: {len(google_records) + len(meta_records) + len(shopify_records)}")
    
    print("\nData files created:")
    print("- google_data.json")
    print("- meta_data.json") 
    print("- shopify_data.json")

if __name__ == "__main__":
    main()