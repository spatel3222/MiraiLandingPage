#!/usr/bin/env python3
"""
Script to re-inject all MOI data properly:
- Google: with duplication detection 
- Meta: with duplication detection
- Shopify: as individual sessions (NO duplication detection)
"""
import pandas as pd
import json
import os
from datetime import datetime
import glob

def show_progress_bar(current, total, prefix="Progress", suffix="Complete", length=50):
    """Display a progress bar"""
    percent = (current / total) * 100
    filled_length = int(length * current // total)
    bar = '█' * filled_length + '░' * (length - filled_length)
    print(f'\r{prefix}: [{bar}] {percent:.1f}% {suffix}', end='', flush=True)

def process_google_files():
    """Process all Google CSV files"""
    google_files = glob.glob("./Google_*.csv") + glob.glob("./google_*.csv")
    all_records = []
    
    print("\n📈 PROCESSING GOOGLE FILES")
    print("=" * 50)
    
    for file_path in google_files:
        if not os.path.exists(file_path):
            continue
            
        print(f"📖 Reading: {file_path}")
        
        try:
            # Try reading with different approaches
            if "yearly" in file_path.lower():
                # Yearly files have headers in first rows
                with open(file_path, 'r') as f:
                    lines = f.readlines()
                df = pd.read_csv(file_path, skiprows=2)
                source_name = lines[0].strip() if lines else "Unknown"
            else:
                df = pd.read_csv(file_path)
                source_name = os.path.basename(file_path)
                
            print(f"📊 Records in file: {len(df)}")
            
            for _, row in df.iterrows():
                record = {
                    "day": str(row.get('Day', row.get('day', ''))),
                    "campaign": str(row.get('Campaign', row.get('campaign', ''))),
                    "cost": float(row.get('Cost', row.get('cost', 0))),
                    "source_file": file_path,
                    "source_file_name": os.path.basename(file_path),
                    "date_range_start": str(row.get('Day', row.get('day', ''))),
                    "date_range_end": str(row.get('Day', row.get('day', '')))
                }
                all_records.append(record)
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            continue
    
    print(f"\n✅ Google processing complete: {len(all_records)} total records")
    return all_records

def process_meta_files():
    """Process all Meta CSV files"""
    meta_files = glob.glob("./Meta_*.csv") + glob.glob("./meta_*.csv")
    all_records = []
    
    print("\n📱 PROCESSING META FILES")
    print("=" * 50)
    
    for file_path in meta_files:
        if not os.path.exists(file_path):
            continue
            
        print(f"📖 Reading: {file_path}")
        
        try:
            df = pd.read_csv(file_path, encoding='utf-8-sig')
            print(f"📊 Records in file: {len(df)}")
            
            for _, row in df.iterrows():
                # Extract date from various possible date columns
                reporting_date = None
                if 'Reporting starts' in row:
                    reporting_date = str(row['Reporting starts'])
                elif 'Day' in row:
                    reporting_date = str(row['Day'])
                
                record = {
                    "reporting_starts": f"{reporting_date} 00:00:00" if reporting_date else None,
                    "campaign_name": str(row.get('Campaign name', '')),
                    "ad_set_name": str(row.get('Ad set name', '')),
                    "ad_name": str(row.get('Ad name', '')),
                    "amount_spent_inr": float(row.get('Amount spent (INR)', 0)),
                    "cpm_cost_per_1000_impressions": float(row.get('CPM (cost per 1,000 impressions)', 0)),
                    "ctr_link_click_through_rate": float(row.get('CTR (link click-through rate)', 0)),
                    "source_file": file_path,
                    "source_file_name": os.path.basename(file_path),
                    "date_range_start": reporting_date,
                    "date_range_end": reporting_date
                }
                all_records.append(record)
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            continue
    
    print(f"\n✅ Meta processing complete: {len(all_records)} total records")
    return all_records

def process_shopify_files():
    """Process all Shopify CSV files as individual sessions"""
    shopify_files = glob.glob("./Shopify_*.csv") + glob.glob("./shopify_*.csv")
    all_records = []
    
    print("\n🛒 PROCESSING SHOPIFY FILES (Individual Sessions)")
    print("=" * 60)
    
    for file_path in shopify_files:
        if not os.path.exists(file_path):
            continue
            
        print(f"📖 Reading: {file_path}")
        
        try:
            df = pd.read_csv(file_path)
            print(f"📊 Sessions in file: {len(df)}")
            
            # Process all rows as individual sessions
            for i, (_, row) in enumerate(df.iterrows()):
                if i % 5000 == 0:  # Progress every 5000 sessions
                    show_progress_bar(i + 1, len(df), "Processing Sessions")
                
                # Extract date from Day field
                day_date = str(row.get('Day', ''))
                
                record = {
                    "day": day_date,
                    "hour_or_day": str(row.get('Day', '')),
                    "utm_campaign": str(row.get('UTM campaign', '')),
                    "utm_term": str(row.get('UTM term', '')),
                    "utm_content": str(row.get('UTM content', '')),
                    "landing_page_url": str(row.get('Landing page URL', ''))[:500],  # Truncate long URLs
                    "online_store_visitors": int(row.get('Online store visitors', 0)),
                    "sessions_completed_checkout": int(row.get('Sessions that completed checkout', 0)),
                    "sessions_reached_checkout": int(row.get('Sessions that reached checkout', 0)),
                    "sessions_with_cart_additions": int(row.get('Sessions with cart additions', 0)),
                    "average_session_duration": int(row.get('Average session duration', 0)),
                    "pageviews": int(row.get('Pageviews', 0)),
                    "source_file": file_path,
                    "source_file_name": os.path.basename(file_path),
                    "date_range_start": day_date,
                    "date_range_end": day_date
                }
                all_records.append(record)
            
            show_progress_bar(len(df), len(df), "Processing Sessions")
            print()  # New line after progress bar
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            continue
    
    print(f"\n✅ Shopify processing complete: {len(all_records)} session records")
    return all_records

def main():
    """Main processing function"""
    print("🚀 RE-INJECTING ALL MOI DATA")
    print("=" * 60)
    print("📝 Strategy:")
    print("   • Google: With duplication detection")
    print("   • Meta: With duplication detection") 
    print("   • Shopify: Individual sessions (NO deduplication)")
    print()
    
    # Process all data sources
    google_records = process_google_files()
    meta_records = process_meta_files()
    shopify_records = process_shopify_files()
    
    # Save to JSON files for database upload
    print("\n💾 SAVING DATA FILES")
    print("=" * 30)
    
    with open('google_reinjection_data.json', 'w') as f:
        json.dump(google_records, f, indent=2, default=str)
    print("✅ Saved: google_reinjection_data.json")
    
    with open('meta_reinjection_data.json', 'w') as f:
        json.dump(meta_records, f, indent=2, default=str)
    print("✅ Saved: meta_reinjection_data.json")
    
    with open('shopify_reinjection_data.json', 'w') as f:
        json.dump(shopify_records, f, indent=2, default=str)
    print("✅ Saved: shopify_reinjection_data.json")
    
    print(f"\n📊 RE-INJECTION SUMMARY")
    print("=" * 40)
    print(f"📈 Google records: {len(google_records):,}")
    print(f"📱 Meta records: {len(meta_records):,}")
    print(f"🛒 Shopify session records: {len(shopify_records):,}")
    print(f"📁 Total records prepared: {len(google_records) + len(meta_records) + len(shopify_records):,}")
    
    print(f"\n🎯 KEY INSIGHT:")
    print(f"   Shopify now contains {len(shopify_records):,} individual sessions")
    print(f"   This enables proper calculation of:")
    print(f"   • Users with session > 1 min")
    print(f"   • Users with 5+ pageviews AND > 1 min")
    print(f"   • ATC with session > 1 min")
    print(f"   • Checkout with session > 1 min")

if __name__ == "__main__":
    main()