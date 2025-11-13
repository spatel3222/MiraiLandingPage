#!/usr/bin/env python3
"""
Process and generate SQL batches for all three yearly data files
"""

import pandas as pd
import numpy as np
from datetime import datetime
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_value_for_sql(value):
    """Clean and format values for SQL insertion"""
    if pd.isna(value) or value == '' or str(value).lower() == 'null':
        return 'NULL'
    
    if isinstance(value, str):
        # Escape single quotes for SQL
        value = value.replace("'", "''").replace('\n', '').replace('\r', '')
        return f"'{value}'"
    
    return str(value)

def process_google_data(file_path, batch_size=50):
    """Process Google CSV and create SQL batch files"""
    logger.info(f"Processing Google data from {file_path}")
    
    df = pd.read_csv(file_path, skiprows=2)
    logger.info(f"Google data shape: {df.shape}")
    
    batch_num = 0
    sql_files = []
    
    for start_idx in range(0, len(df), batch_size):
        end_idx = min(start_idx + batch_size, len(df))
        batch_df = df.iloc[start_idx:end_idx]
        
        sql_values = []
        
        for _, row in batch_df.iterrows():
            try:
                day_str = str(row['Day']).strip()
                day_date = pd.to_datetime(day_str).date().isoformat()
                
                campaign = clean_value_for_sql(row['Campaign'])
                cost = float(row['Cost']) if pd.notna(row['Cost']) else 0.0
                
                sql_values.append(f"('{day_date}', {campaign}, {cost})")
                
            except Exception as e:
                logger.warning(f"Error processing Google row: {e}")
                continue
        
        if sql_values:
            values_str = ',\n    '.join(sql_values)
            sql = f"""INSERT INTO google_raw_data (day, campaign, cost) VALUES \n    {values_str};"""
            
            batch_file = f'/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/google_batch_{batch_num:04d}.sql'
            os.makedirs(os.path.dirname(batch_file), exist_ok=True)
            
            with open(batch_file, 'w') as f:
                f.write(sql)
            
            sql_files.append(batch_file)
            batch_num += 1
    
    logger.info(f"Generated {len(sql_files)} Google SQL batch files")
    return sql_files

def process_meta_data(file_path, batch_size=50):
    """Process Meta CSV and create SQL batch files"""
    logger.info(f"Processing Meta data from {file_path}")
    
    df = pd.read_csv(file_path)
    logger.info(f"Meta data shape: {df.shape}")
    logger.info(f"Meta columns: {df.columns.tolist()}")
    
    batch_num = 0
    sql_files = []
    
    for start_idx in range(0, len(df), batch_size):
        end_idx = min(start_idx + batch_size, len(df))
        batch_df = df.iloc[start_idx:end_idx]
        
        sql_values = []
        
        for _, row in batch_df.iterrows():
            try:
                # Parse reporting_starts date
                reporting_starts = clean_value_for_sql(row['Reporting starts'])
                campaign_name = clean_value_for_sql(row['Campaign name'])
                ad_set_name = clean_value_for_sql(row['Ad set name'])
                ad_name = clean_value_for_sql(row['Ad name'])
                
                amount_spent_inr = float(row['Amount spent (INR)']) if pd.notna(row['Amount spent (INR)']) else 0.0
                cpm = float(row['CPM (cost per 1,000 impressions)']) if pd.notna(row['CPM (cost per 1,000 impressions)']) else 0.0
                ctr = float(row['CTR (link click-through rate)']) if pd.notna(row['CTR (link click-through rate)']) else 0.0
                
                sql_values.append(f"""({reporting_starts}, {campaign_name}, {ad_set_name}, {ad_name}, 
                                 {amount_spent_inr}, {cpm}, {ctr})""")
                
            except Exception as e:
                logger.warning(f"Error processing Meta row: {e}")
                continue
        
        if sql_values:
            values_str = ',\n    '.join(sql_values)
            sql = f"""INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name, 
                                              amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate) 
                     VALUES \n    {values_str};"""
            
            batch_file = f'/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/meta_batch_{batch_num:04d}.sql'
            os.makedirs(os.path.dirname(batch_file), exist_ok=True)
            
            with open(batch_file, 'w') as f:
                f.write(sql)
            
            sql_files.append(batch_file)
            batch_num += 1
    
    logger.info(f"Generated {len(sql_files)} Meta SQL batch files")
    return sql_files

def process_shopify_data_sample(file_path, sample_size=1000, batch_size=50):
    """Process a sample of Shopify CSV data for testing"""
    logger.info(f"Processing Shopify sample from {file_path}")
    
    # Read just a sample for now due to size
    df = pd.read_csv(file_path, nrows=sample_size)
    logger.info(f"Shopify sample shape: {df.shape}")
    logger.info(f"Shopify columns: {df.columns.tolist()}")
    
    batch_num = 0
    sql_files = []
    
    for start_idx in range(0, len(df), batch_size):
        end_idx = min(start_idx + batch_size, len(df))
        batch_df = df.iloc[start_idx:end_idx]
        
        sql_values = []
        
        for _, row in batch_df.iterrows():
            try:
                day_str = str(row['Day']).strip()
                day_date = pd.to_datetime(day_str).date().isoformat()
                
                utm_campaign = clean_value_for_sql(row['UTM campaign'])
                utm_term = clean_value_for_sql(row['UTM term'])
                utm_content = clean_value_for_sql(row['UTM content'])
                landing_page_url = clean_value_for_sql(row['Landing page URL'])
                
                online_store_visitors = int(row['Online store visitors']) if pd.notna(row['Online store visitors']) else 0
                sessions_completed_checkout = int(row['Sessions that completed checkout']) if pd.notna(row['Sessions that completed checkout']) else 0
                sessions_reached_checkout = int(row['Sessions that reached checkout']) if pd.notna(row['Sessions that reached checkout']) else 0
                sessions_with_cart_additions = int(row['Sessions with cart additions']) if pd.notna(row['Sessions with cart additions']) else 0
                average_session_duration = int(row['Average session duration']) if pd.notna(row['Average session duration']) else 0
                pageviews = int(row['Pageviews']) if pd.notna(row['Pageviews']) else 0
                
                sql_values.append(f"""('{day_date}', {utm_campaign}, {utm_term}, {utm_content}, {landing_page_url}, 
                                 {online_store_visitors}, {sessions_completed_checkout}, {sessions_reached_checkout}, 
                                 {sessions_with_cart_additions}, {average_session_duration}, {pageviews})""")
                
            except Exception as e:
                logger.warning(f"Error processing Shopify row: {e}")
                continue
        
        if sql_values:
            values_str = ',\n    '.join(sql_values)
            sql = f"""INSERT INTO shopify_raw_data (day, utm_campaign, utm_term, utm_content, landing_page_url,
                                                  online_store_visitors, sessions_completed_checkout, sessions_reached_checkout,
                                                  sessions_with_cart_additions, average_session_duration, pageviews) 
                     VALUES \n    {values_str};"""
            
            batch_file = f'/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/sql_batches/shopify_sample_batch_{batch_num:04d}.sql'
            os.makedirs(os.path.dirname(batch_file), exist_ok=True)
            
            with open(batch_file, 'w') as f:
                f.write(sql)
            
            sql_files.append(batch_file)
            batch_num += 1
    
    logger.info(f"Generated {len(sql_files)} Shopify sample SQL batch files")
    return sql_files

def main():
    google_file = "/Users/shivangpatel/Downloads/yearly files/Google_1st Oct 24 to 26th Oct 25.csv"
    meta_file = "/Users/shivangpatel/Downloads/yearly files/meta_combined_oct24_to_oct25_full.csv"
    shopify_file = "/Users/shivangpatel/Downloads/yearly files/Shopify_1st Oct 24 to 26th Oct 25.csv"
    
    logger.info("Starting batch file generation for all data sources")
    
    # Process Google data
    google_files = process_google_data(google_file)
    
    # Process Meta data  
    meta_files = process_meta_data(meta_file)
    
    # Process Shopify sample
    shopify_files = process_shopify_data_sample(shopify_file)
    
    logger.info("=" * 50)
    logger.info("BATCH FILE GENERATION COMPLETE")
    logger.info("=" * 50)
    logger.info(f"Google batch files: {len(google_files)}")
    logger.info(f"Meta batch files: {len(meta_files)}")
    logger.info(f"Shopify sample batch files: {len(shopify_files)}")
    logger.info(f"Total batch files: {len(google_files) + len(meta_files) + len(shopify_files)}")

if __name__ == "__main__":
    main()