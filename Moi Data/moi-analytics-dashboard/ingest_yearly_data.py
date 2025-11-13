#!/usr/bin/env python3
"""
Ingest yearly Google and Shopify data into Supabase
Handles large datasets with batch processing
"""

import pandas as pd
import numpy as np
from supabase import create_client, Client
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = "https://nbclorobfotxrpbmyapi.supabase.co"
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY2xvcm9iZm90eHJwYm15YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwMDkwMzIsImV4cCI6MjA0NTU4NTAzMn0.VfkLDYoQlFgP3jxJGHw6_VLyWUfxqCXJgzELYpLnQ1g')

def clean_and_convert_data(value, target_type='float'):
    """Clean and convert data values"""
    if pd.isna(value) or value == '' or value == 'null':
        return None
    
    if target_type == 'float':
        try:
            # Remove commas and convert
            if isinstance(value, str):
                value = value.replace(',', '').replace('%', '')
            return float(value)
        except (ValueError, TypeError):
            return 0.0
    elif target_type == 'int':
        try:
            if isinstance(value, str):
                value = value.replace(',', '')
            return int(float(value))
        except (ValueError, TypeError):
            return 0
    elif target_type == 'str':
        return str(value) if value is not None else ''
    
    return value

def process_google_data(file_path):
    """Process Google CSV data"""
    logger.info(f"Processing Google data from {file_path}")
    
    # Read the CSV file, skipping the first 2 rows (headers)
    df = pd.read_csv(file_path, skiprows=2)
    
    logger.info(f"Google data shape: {df.shape}")
    logger.info(f"Google columns: {df.columns.tolist()}")
    
    # Clean and standardize the data
    processed_records = []
    
    for index, row in df.iterrows():
        try:
            # Parse date
            day_str = str(row['Day']).strip()
            day_date = pd.to_datetime(day_str).date()
            
            record = {
                "day": day_date.isoformat(),
                "campaign": clean_and_convert_data(row['Campaign'], 'str'),
                "cost": clean_and_convert_data(row['Cost'], 'float')
            }
            
            processed_records.append(record)
            
        except Exception as e:
            logger.warning(f"Error processing Google row {index}: {e}")
            continue
    
    logger.info(f"Processed {len(processed_records)} Google records")
    return processed_records

def process_shopify_data(file_path, batch_size=1000):
    """Process Shopify CSV data in batches"""
    logger.info(f"Processing Shopify data from {file_path}")
    
    # Process in chunks due to large file size
    chunk_iter = pd.read_csv(file_path, chunksize=batch_size)
    all_records = []
    
    for chunk_num, chunk in enumerate(chunk_iter):
        logger.info(f"Processing Shopify chunk {chunk_num + 1}, size: {len(chunk)}")
        
        for index, row in chunk.iterrows():
            try:
                # Parse date
                day_str = str(row['Day']).strip()
                day_date = pd.to_datetime(day_str).date()
                
                record = {
                    "day": day_date.isoformat(),
                    "utm_campaign": clean_and_convert_data(row['UTM campaign'], 'str'),
                    "utm_term": clean_and_convert_data(row['UTM term'], 'str'),
                    "utm_content": clean_and_convert_data(row['UTM content'], 'str'),
                    "landing_page_url": clean_and_convert_data(row['Landing page URL'], 'str'),
                    "online_store_visitors": clean_and_convert_data(row['Online store visitors'], 'int'),
                    "sessions_completed_checkout": clean_and_convert_data(row['Sessions that completed checkout'], 'int'),
                    "sessions_reached_checkout": clean_and_convert_data(row['Sessions that reached checkout'], 'int'),
                    "sessions_with_cart_additions": clean_and_convert_data(row['Sessions with cart additions'], 'int'),
                    "average_session_duration": clean_and_convert_data(row['Average session duration'], 'int'),
                    "pageviews": clean_and_convert_data(row['Pageviews'], 'int')
                }
                
                all_records.append(record)
                
            except Exception as e:
                logger.warning(f"Error processing Shopify row {index}: {e}")
                continue
        
        # Log progress every 100 chunks
        if (chunk_num + 1) % 100 == 0:
            logger.info(f"Processed {chunk_num + 1} chunks, {len(all_records)} total records")
    
    logger.info(f"Processed {len(all_records)} Shopify records total")
    return all_records

def batch_insert_to_supabase(supabase: Client, table_name: str, records: list, batch_size: int = 1000):
    """Insert records to Supabase in batches"""
    logger.info(f"Inserting {len(records)} records to {table_name} in batches of {batch_size}")
    
    total_inserted = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        
        try:
            response = supabase.table(table_name).insert(batch).execute()
            total_inserted += len(batch)
            
            if (i // batch_size + 1) % 10 == 0:  # Log every 10 batches
                logger.info(f"Inserted batch {i // batch_size + 1}, total: {total_inserted}")
                
        except Exception as e:
            logger.error(f"Error inserting batch {i // batch_size + 1}: {e}")
            continue
    
    logger.info(f"Successfully inserted {total_inserted} records to {table_name}")
    return total_inserted

def main():
    """Main function to process and ingest the data"""
    logger.info("Starting data ingestion process")
    
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # File paths
    google_file = "/Users/shivangpatel/Downloads/yearly files/Google_1st Oct 24 to 26th Oct 25.csv"
    shopify_file = "/Users/shivangpatel/Downloads/yearly files/Shopify_1st Oct 24 to 26th Oct 25.csv"
    
    try:
        # Process Google data
        logger.info("=" * 50)
        logger.info("PROCESSING GOOGLE DATA")
        logger.info("=" * 50)
        
        google_records = process_google_data(google_file)
        google_inserted = batch_insert_to_supabase(supabase, 'google_raw_data', google_records)
        
        # Process Shopify data
        logger.info("=" * 50)
        logger.info("PROCESSING SHOPIFY DATA")
        logger.info("=" * 50)
        
        shopify_records = process_shopify_data(shopify_file)
        shopify_inserted = batch_insert_to_supabase(supabase, 'shopify_raw_data', shopify_records)
        
        # Final summary
        logger.info("=" * 50)
        logger.info("INGESTION COMPLETE")
        logger.info("=" * 50)
        logger.info(f"Google records inserted: {google_inserted:,}")
        logger.info(f"Shopify records inserted: {shopify_inserted:,}")
        logger.info(f"Total records inserted: {google_inserted + shopify_inserted:,}")
        
    except Exception as e:
        logger.error(f"Error in main process: {e}")
        raise

if __name__ == "__main__":
    main()