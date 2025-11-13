#!/usr/bin/env python3
"""
Ingest yearly Google and Shopify data into Supabase using direct SQL
Handles large datasets with batch processing
"""

import pandas as pd
import numpy as np
import requests
import json
from datetime import datetime
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = "https://nbclorobfotxrpbmyapi.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY2xvcm9iZm90eHJwYm15YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwMDkwMzIsImV4cCI6MjA0NTU4NTAzMn0.VfkLDYoQlFgP3jxJGHw6_VLyWUfxqCXJgzELYpLnQ1g"

def execute_sql_query(query):
    """Execute SQL query via Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {"query": query}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"SQL execution failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error executing SQL: {e}")
        return None

def clean_value(value):
    """Clean and format values for SQL insertion"""
    if pd.isna(value) or value == '' or value == 'null':
        return 'NULL'
    
    if isinstance(value, str):
        # Escape single quotes for SQL
        value = value.replace("'", "''")
        return f"'{value}'"
    
    return str(value)

def process_google_data(file_path):
    """Process Google CSV data and generate SQL insert statements"""
    logger.info(f"Processing Google data from {file_path}")
    
    # Read CSV, skipping header rows
    df = pd.read_csv(file_path, skiprows=2)
    logger.info(f"Google data shape: {df.shape}")
    
    sql_statements = []
    batch_values = []
    
    for index, row in df.iterrows():
        try:
            # Parse and clean data
            day_str = str(row['Day']).strip()
            day_date = pd.to_datetime(day_str).date().isoformat()
            
            campaign = clean_value(row['Campaign'])
            cost = float(row['Cost']) if pd.notna(row['Cost']) else 0.0
            
            batch_values.append(f"('{day_date}', {campaign}, {cost})")
            
            # Insert in batches of 100
            if len(batch_values) >= 100:
                values_str = ','.join(batch_values)
                sql = f"""
                INSERT INTO google_raw_data (day, campaign, cost) 
                VALUES {values_str};
                """
                sql_statements.append(sql)
                batch_values = []
                
        except Exception as e:
            logger.warning(f"Error processing Google row {index}: {e}")
            continue
    
    # Insert remaining values
    if batch_values:
        values_str = ','.join(batch_values)
        sql = f"""
        INSERT INTO google_raw_data (day, campaign, cost) 
        VALUES {values_str};
        """
        sql_statements.append(sql)
    
    logger.info(f"Generated {len(sql_statements)} Google SQL statements")
    return sql_statements

def process_shopify_data_chunk(file_path, chunk_size=1000):
    """Process Shopify CSV data in chunks and yield SQL statements"""
    logger.info(f"Processing Shopify data from {file_path} in chunks of {chunk_size}")
    
    chunk_iter = pd.read_csv(file_path, chunksize=chunk_size)
    
    for chunk_num, chunk in enumerate(chunk_iter):
        logger.info(f"Processing Shopify chunk {chunk_num + 1}")
        
        batch_values = []
        
        for index, row in chunk.iterrows():
            try:
                # Parse and clean data
                day_str = str(row['Day']).strip()
                day_date = pd.to_datetime(day_str).date().isoformat()
                
                utm_campaign = clean_value(row['UTM campaign'])
                utm_term = clean_value(row['UTM term'])
                utm_content = clean_value(row['UTM content'])
                landing_page_url = clean_value(row['Landing page URL'])
                
                online_store_visitors = int(row['Online store visitors']) if pd.notna(row['Online store visitors']) else 0
                sessions_completed_checkout = int(row['Sessions that completed checkout']) if pd.notna(row['Sessions that completed checkout']) else 0
                sessions_reached_checkout = int(row['Sessions that reached checkout']) if pd.notna(row['Sessions that reached checkout']) else 0
                sessions_with_cart_additions = int(row['Sessions with cart additions']) if pd.notna(row['Sessions with cart additions']) else 0
                average_session_duration = int(row['Average session duration']) if pd.notna(row['Average session duration']) else 0
                pageviews = int(row['Pageviews']) if pd.notna(row['Pageviews']) else 0
                
                batch_values.append(f"""('{day_date}', {utm_campaign}, {utm_term}, {utm_content}, {landing_page_url}, 
                                   {online_store_visitors}, {sessions_completed_checkout}, {sessions_reached_checkout}, 
                                   {sessions_with_cart_additions}, {average_session_duration}, {pageviews})""")
                
            except Exception as e:
                logger.warning(f"Error processing Shopify row {index}: {e}")
                continue
        
        # Generate SQL for this chunk
        if batch_values:
            values_str = ','.join(batch_values)
            sql = f"""
            INSERT INTO shopify_raw_data (day, utm_campaign, utm_term, utm_content, landing_page_url,
                                        online_store_visitors, sessions_completed_checkout, sessions_reached_checkout,
                                        sessions_with_cart_additions, average_session_duration, pageviews) 
            VALUES {values_str};
            """
            yield sql

def main():
    """Main function to process and ingest the data"""
    logger.info("Starting data ingestion process")
    
    google_file = "/Users/shivangpatel/Downloads/yearly files/Google_1st Oct 24 to 26th Oct 25.csv"
    shopify_file = "/Users/shivangpatel/Downloads/yearly files/Shopify_1st Oct 24 to 26th Oct 25.csv"
    
    try:
        # Process Google data
        logger.info("=" * 50)
        logger.info("PROCESSING GOOGLE DATA")
        logger.info("=" * 50)
        
        google_sql_statements = process_google_data(google_file)
        
        logger.info(f"Executing {len(google_sql_statements)} Google SQL statements...")
        for i, sql in enumerate(google_sql_statements):
            result = execute_sql_query(sql)
            if i % 10 == 0:
                logger.info(f"Executed Google batch {i + 1}/{len(google_sql_statements)}")
            time.sleep(0.1)  # Small delay to avoid rate limiting
        
        logger.info("Google data ingestion complete")
        
        # Process Shopify data
        logger.info("=" * 50)
        logger.info("PROCESSING SHOPIFY DATA")
        logger.info("=" * 50)
        
        shopify_batch_count = 0
        for sql in process_shopify_data_chunk(shopify_file):
            result = execute_sql_query(sql)
            shopify_batch_count += 1
            
            if shopify_batch_count % 100 == 0:
                logger.info(f"Executed Shopify batch {shopify_batch_count}")
            
            time.sleep(0.1)  # Small delay to avoid rate limiting
        
        logger.info(f"Shopify data ingestion complete. Executed {shopify_batch_count} batches")
        
        logger.info("=" * 50)
        logger.info("INGESTION COMPLETE")
        logger.info("=" * 50)
        
    except Exception as e:
        logger.error(f"Error in main process: {e}")
        raise

if __name__ == "__main__":
    main()